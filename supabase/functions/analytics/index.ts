import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, x-region',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function ok(data: unknown) {
  return json({ success: true, data, error: null })
}

function fail(error: string, status = 400) {
  return json({ success: false, data: null, error }, status)
}

async function getUser(authHeader: string | null, supabase: ReturnType<typeof createClient>) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.replace('Bearer ', '')
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) return null
  return data.user
}

async function checkAccess(
  supabase: ReturnType<typeof createClient>,
  restaurantId: string,
  userId: string
): Promise<boolean> {
  const { data: admin } = await supabase
    .from('restaurant_admins')
    .select('id')
    .eq('restaurant_id', restaurantId)
    .eq('user_id', userId)
    .maybeSingle()

  if (admin) return true

  const { data: staff } = await supabase
    .from('staff_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  return !!staff
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString()
}

async function handleGetAnalytics(
  supabase: ReturnType<typeof createClient>,
  restaurantId: string
) {
  console.log('analytics: get', restaurantId)

  const now = new Date()
  const iso7 = daysAgo(7)
  const iso30 = daysAgo(30)

  const [imp7, imp30, sel7, sel30, cal7, cal30, dailyImp, dailySel, dailyCal, recentEvents] = await Promise.all([
    supabase.from('impressions').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId).gte('created_at', iso7),
    supabase.from('impressions').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId).gte('created_at', iso30),
    supabase.from('selections').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId).gte('created_at', iso7),
    supabase.from('selections').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId).gte('created_at', iso30),
    supabase.from('calls').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId).gte('created_at', iso7),
    supabase.from('calls').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId).gte('created_at', iso30),
    supabase.from('impressions').select('created_at').eq('restaurant_id', restaurantId).gte('created_at', iso30).order('created_at', { ascending: true }),
    supabase.from('selections').select('created_at').eq('restaurant_id', restaurantId).gte('created_at', iso30).order('created_at', { ascending: true }),
    supabase.from('calls').select('created_at').eq('restaurant_id', restaurantId).gte('created_at', iso30).order('created_at', { ascending: true }),
    supabase.from('impressions').select('created_at').eq('restaurant_id', restaurantId).order('created_at', { ascending: false }).limit(20),
  ])

  const i7 = imp7.count ?? 0
  const i30 = imp30.count ?? 0
  const s7 = sel7.count ?? 0
  const s30 = sel30.count ?? 0
  const c7 = cal7.count ?? 0
  const c30 = cal30.count ?? 0

  // Build daily aggregates
  const dateMap = new Map<string, { impressions: number; selections: number; calls: number }>()

  function countDate(items: { created_at: string }[], field: 'impressions' | 'selections' | 'calls') {
    for (const item of items) {
      const d = item.created_at.slice(0, 10)
      const entry = dateMap.get(d) ?? { impressions: 0, selections: 0, calls: 0 }
      entry[field]++
      dateMap.set(d, entry)
    }
  }

  countDate(dailyImp.data ?? [], 'impressions')
  countDate(dailySel.data ?? [], 'selections')
  countDate(dailyCal.data ?? [], 'calls')

  const daily = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }))

  const conversionRate = i30 > 0 ? +(c30 / i30).toFixed(4) : 0
  const selectionRate = i30 > 0 ? +(s30 / i30).toFixed(4) : 0

  const recent = (recentEvents.data ?? []).slice(0, 20).map((e) => ({
    type: 'impression' as const,
    created_at: e.created_at,
  }))

  return ok({
    restaurant_id: restaurantId,
    totals: {
      impressions_7d: i7,
      impressions_30d: i30,
      selections_7d: s7,
      selections_30d: s30,
      calls_7d: c7,
      calls_30d: c30,
      conversion_rate: conversionRate,
      selection_rate: selectionRate,
    },
    daily,
    recent_events: recent.slice(0, 10),
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace(/^\/functions\/v1\/analytics/, '').replace(/^\/analytics/, '') || '/'

    const m = path.match(/^\/([^/]+)$/)
    if (!m || req.method !== 'GET') {
      return fail('Not found', 404)
    }

    const restaurantId = m[1]

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const user = await getUser(req.headers.get('Authorization'), supabase)
    if (!user) {
      return fail('Unauthorized', 401)
    }

    const hasAccess = await checkAccess(supabase, restaurantId, user.id)
    if (!hasAccess) {
      return fail('Not found or no permission', 404)
    }

    return await handleGetAnalytics(supabase, restaurantId)
  } catch (err) {
    console.error('analytics: unhandled error', err instanceof Error ? err.message : String(err))
    return json({ success: false, data: null, error: err instanceof Error ? err.message : 'Internal server error' }, 500)
  }
})
