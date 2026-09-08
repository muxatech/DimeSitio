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

async function handleGetGlobal(
  supabase: ReturnType<typeof createClient>
) {
  const iso7 = daysAgo(7)
  const iso30 = daysAgo(30)

  const [pv7, pv30, uniq7, flow7, flow30, qCat7, qPrice7, qLoc7, pvRest7, imp7, imp30, sel7, sel30, cal7, cal30, ctaMaps7, ctaMenu7, ctaRes7, ctaIg7, ctaWinner7, restCount, dailyPv, dailyFlow, dailyQ, dailyImp, dailyCta, topImp, topWin, topCall] = await Promise.all([
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', iso7),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', iso30),
    supabase.from('page_views').select('visitor_id').gte('created_at', iso7),
    supabase.from('flow_starts').select('*', { count: 'exact', head: true }).gte('created_at', iso7),
    supabase.from('flow_starts').select('*', { count: 'exact', head: true }).gte('created_at', iso30),
    supabase.from('question_views').select('*', { count: 'exact', head: true }).eq('question_key', 'categories').gte('created_at', iso7),
    supabase.from('question_views').select('*', { count: 'exact', head: true }).eq('question_key', 'price').gte('created_at', iso7),
    supabase.from('question_views').select('*', { count: 'exact', head: true }).eq('question_key', 'location').gte('created_at', iso7),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).like('path', '%/restaurantes%').gte('created_at', iso7),
    supabase.from('impressions').select('*', { count: 'exact', head: true }).gte('created_at', iso7),
    supabase.from('impressions').select('*', { count: 'exact', head: true }).gte('created_at', iso30),
    supabase.from('selections').select('*', { count: 'exact', head: true }).gte('created_at', iso7),
    supabase.from('selections').select('*', { count: 'exact', head: true }).gte('created_at', iso30),
    supabase.from('cta_clicks').select('*', { count: 'exact', head: true }).eq('cta_type', 'call').gte('created_at', iso7),
    supabase.from('cta_clicks').select('*', { count: 'exact', head: true }).eq('cta_type', 'call').gte('created_at', iso30),
    supabase.from('cta_clicks').select('*', { count: 'exact', head: true }).eq('cta_type', 'maps').gte('created_at', iso7),
    supabase.from('cta_clicks').select('*', { count: 'exact', head: true }).eq('cta_type', 'menu').gte('created_at', iso7),
    supabase.from('cta_clicks').select('*', { count: 'exact', head: true }).eq('cta_type', 'reservations').gte('created_at', iso7),
    supabase.from('cta_clicks').select('*', { count: 'exact', head: true }).eq('cta_type', 'instagram').gte('created_at', iso7),
    supabase.from('cta_clicks').select('*', { count: 'exact', head: true }).eq('cta_type', 'winner').gte('created_at', iso7),
    supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('page_views').select('created_at').gte('created_at', iso30).order('created_at', { ascending: true }),
    supabase.from('flow_starts').select('created_at').gte('created_at', iso30).order('created_at', { ascending: true }),
    supabase.from('question_views').select('created_at, question_key').gte('created_at', iso30).order('created_at', { ascending: true }),
    supabase.from('impressions').select('created_at').gte('created_at', iso30).order('created_at', { ascending: true }),
    supabase.from('cta_clicks').select('created_at, cta_type').gte('created_at', iso30).order('created_at', { ascending: true }),
    supabase.from('impressions').select('restaurant_id').gte('created_at', iso30),
    supabase.from('cta_clicks').select('restaurant_id').eq('cta_type', 'winner').gte('created_at', iso30),
    supabase.from('cta_clicks').select('restaurant_id').eq('cta_type', 'call').gte('created_at', iso30),
  ])

  const uniqCount = new Set((uniq7.data ?? []).map((r: { visitor_id: string }) => r.visitor_id)).size

  const dateMap = new Map<string, { page_views: number; flow_starts: number; impressions: number; cta: number }>()
  function addDate(rows: { created_at: string }[], field: 'page_views' | 'flow_starts' | 'impressions' | 'cta') {
    for (const r of rows) {
      const d = r.created_at.slice(0, 10)
      const e = dateMap.get(d) ?? { page_views: 0, flow_starts: 0, impressions: 0, cta: 0 }
      e[field]++
      dateMap.set(d, e)
    }
  }
  addDate(dailyPv.data ?? [], 'page_views')
  addDate(dailyFlow.data ?? [], 'flow_starts')
  addDate(dailyImp.data ?? [], 'impressions')
  addDate((dailyCta.data ?? []) as { created_at: string }[], 'cta')

  const daily = Array.from(dateMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, v]) => ({ date, ...v }))

  function topCounts(rows: { restaurant_id: string }[]) {
    const m = new Map<string, number>()
    for (const r of rows) m.set(r.restaurant_id, (m.get(r.restaurant_id) ?? 0) + 1)
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([restaurant_id, count]) => ({ restaurant_id, count }))
  }

  let topRestaurants: { restaurant_id: string; name: string; count: number; type: string }[] = []
  try {
    const impIds = topCounts(topImp.data ?? []).map((r) => r.restaurant_id)
    const winIds = topCounts(topWin.data ?? []).map((r) => r.restaurant_id)
    const callIds = topCounts(topCall.data ?? []).map((r) => r.restaurant_id)
    const ids = Array.from(new Set([...impIds, ...winIds, ...callIds])).slice(0, 20)
    if (ids.length) {
      const { data: rests } = await supabase.from('restaurants').select('id, name').in('id', ids)
      const nameMap = new Map((rests ?? []).map((r: { id: string; name: string }) => [r.id, r.name]))
      const impTop = topCounts(topImp.data ?? []).slice(0, 5).map(r=>({ ...r, name: nameMap.get(r.restaurant_id) ?? r.restaurant_id, type: 'impressions' as const }))
      const winTop = topCounts(topWin.data ?? []).slice(0, 5).map(r=>({ ...r, name: nameMap.get(r.restaurant_id) ?? r.restaurant_id, type: 'winner' as const }))
      const callTop = topCounts(topCall.data ?? []).slice(0, 5).map(r=>({ ...r, name: nameMap.get(r.restaurant_id) ?? r.restaurant_id, type: 'call' as const }))
      topRestaurants = [...impTop, ...winTop, ...callTop]
    }
  } catch {}

  return ok({
    totals: {
      page_views_7d: pv7.count ?? 0,
      page_views_30d: pv30.count ?? 0,
      uniques_7d: uniqCount,
      flow_starts_7d: flow7.count ?? 0,
      flow_starts_30d: flow30.count ?? 0,
      q_categories_7d: qCat7.count ?? 0,
      q_price_7d: qPrice7.count ?? 0,
      q_location_7d: qLoc7.count ?? 0,
      restaurantes_views_7d: pvRest7.count ?? 0,
      impressions_7d: imp7.count ?? 0,
      impressions_30d: imp30.count ?? 0,
      selections_7d: sel7.count ?? 0,
      selections_30d: sel30.count ?? 0,
      cta_call_7d: cal7.count ?? 0,
      cta_call_30d: cal30.count ?? 0,
      cta_maps_7d: ctaMaps7.count ?? 0,
      cta_menu_7d: ctaMenu7.count ?? 0,
      cta_reservations_7d: ctaRes7.count ?? 0,
      cta_instagram_7d: ctaIg7.count ?? 0,
      cta_winner_7d: ctaWinner7.count ?? 0,
      restaurants_active: restCount.count ?? 0,
    },
    daily,
    topRestaurants,
  })
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

    if (path === '/global' && req.method === 'GET') {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
      const user = await getUser(req.headers.get('Authorization'), supabase)
      if (!user) return fail('Unauthorized', 401)
      const { data: staff } = await supabase.from('staff_users').select('user_id').eq('user_id', user.id).maybeSingle()
      if (!staff) return fail('Forbidden', 403)
      return await handleGetGlobal(supabase)
    }

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
