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

type RangePreset = 'today' | 'yesterday' | '7d' | '30d' | 'custom'

function parseRange(url: URL): { fromISO: string; toISO: string; preset: RangePreset; label: string } {
  const preset = (url.searchParams.get('preset') as RangePreset) || '7d'
  const fromParam = url.searchParams.get('from')
  const toParam = url.searchParams.get('to')
  const now = new Date()
  const startOfDay = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString()
  const endOfDay = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999)).toISOString()
  let fromISO: string, toISO: string, label: string
  if (preset === 'today') { fromISO = startOfDay(now); toISO = endOfDay(now); label = 'Hoy' }
  else if (preset === 'yesterday') { const y = new Date(now); y.setUTCDate(y.getUTCDate() - 1); fromISO = startOfDay(y); toISO = endOfDay(y); label = 'Ayer' }
  else if (preset === '30d') { fromISO = daysAgo(30); toISO = now.toISOString(); label = 'Últimos 30 días' }
  else if (preset === 'custom') {
    if (!fromParam || !toParam) throw new Error('from/to required for custom')
    const from = new Date(fromParam); const to = new Date(toParam)
    if (isNaN(from.getTime()) || isNaN(to.getTime())) throw new Error('Invalid date')
    if (from > to) throw new Error('from > to')
    if ((to.getTime() - from.getTime()) / 86400000 > 90) throw new Error('Range max 90d')
    fromISO = startOfDay(from); toISO = endOfDay(to); label = `${fromParam} → ${toParam}`
  } else { fromISO = daysAgo(7); toISO = now.toISOString(); label = 'Últimos 7 días' }
  return { fromISO, toISO, preset, label }
}

function fillMissingDates(dateMap: Map<string, { page_views: number; flow_starts: number; impressions: number; cta: number }>, fromISO: string, toISO: string): { date: string; page_views: number; flow_starts: number; impressions: number; cta: number }[] {
  const from = new Date(fromISO.slice(0, 10))
  const to = new Date(toISO.slice(0, 10))
  const out: { date: string; page_views: number; flow_starts: number; impressions: number; cta: number }[] = []
  for (let d = new Date(from); d <= to; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = d.toISOString().slice(0, 10)
    const v = dateMap.get(key) ?? { page_views: 0, flow_starts: 0, impressions: 0, cta: 0 }
    out.push({ date: key, ...v })
  }
  return out
}

async function handleGetGlobal(
  supabase: ReturnType<typeof createClient>,
  url: URL
) {

  const { fromISO, toISO, preset, label } = parseRange(url)

  const { data: realRows } = await supabase.from('restaurants').select('id').eq('is_demo', false)
  const realIds: string[] = (realRows ?? []).map((r: { id: string }) => r.id)
  const realFilter = realIds.length > 0 ? realIds : ['00000000-0000-0000-0000-000000000000']

  const [pv, uniq, flow, qCat, qPrice, qLoc, pvRest, imp, sel, cal, ctaMaps, ctaMenu, ctaRes, ctaIg, ctaWinner, restCount, dailyPv, dailyFlow, dailyQ, dailyImp, dailyCta, topImp, topWin, topCall] = await Promise.all([
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('page_views').select('visitor_id').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('flow_starts').select('*', { count: 'exact', head: true }).gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('question_views').select('*', { count: 'exact', head: true }).eq('question_key', 'categories').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('question_views').select('*', { count: 'exact', head: true }).eq('question_key', 'price').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('question_views').select('*', { count: 'exact', head: true }).eq('question_key', 'location').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).like('path', '%/restaurantes%').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('impressions').select('*', { count: 'exact', head: true }).in('restaurant_id', realFilter).gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('selections').select('*', { count: 'exact', head: true }).in('restaurant_id', realFilter).gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('cta_clicks').select('*', { count: 'exact', head: true }).in('restaurant_id', realFilter).eq('cta_type', 'call').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('cta_clicks').select('*', { count: 'exact', head: true }).in('restaurant_id', realFilter).eq('cta_type', 'maps').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('cta_clicks').select('*', { count: 'exact', head: true }).in('restaurant_id', realFilter).eq('cta_type', 'menu').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('cta_clicks').select('*', { count: 'exact', head: true }).in('restaurant_id', realFilter).eq('cta_type', 'reservations').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('cta_clicks').select('*', { count: 'exact', head: true }).in('restaurant_id', realFilter).eq('cta_type', 'instagram').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('cta_clicks').select('*', { count: 'exact', head: true }).in('restaurant_id', realFilter).eq('cta_type', 'winner').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('active', true).eq('is_demo', false),
    supabase.from('page_views').select('created_at').gte('created_at', fromISO).lte('created_at', toISO).order('created_at', { ascending: true }),
    supabase.from('flow_starts').select('created_at').gte('created_at', fromISO).lte('created_at', toISO).order('created_at', { ascending: true }),
    supabase.from('question_views').select('created_at, question_key').gte('created_at', fromISO).lte('created_at', toISO).order('created_at', { ascending: true }),
    supabase.from('impressions').select('created_at').in('restaurant_id', realFilter).gte('created_at', fromISO).lte('created_at', toISO).order('created_at', { ascending: true }),
    supabase.from('cta_clicks').select('created_at, cta_type').in('restaurant_id', realFilter).gte('created_at', fromISO).lte('created_at', toISO).order('created_at', { ascending: true }),
    supabase.from('impressions').select('restaurant_id').in('restaurant_id', realFilter).gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('cta_clicks').select('restaurant_id').eq('cta_type', 'winner').in('restaurant_id', realFilter).gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('cta_clicks').select('restaurant_id').eq('cta_type', 'call').in('restaurant_id', realFilter).gte('created_at', fromISO).lte('created_at', toISO),
  ])

  const uniqCount = new Set((uniq.data ?? []).map((r: { visitor_id: string }) => r.visitor_id)).size

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

  const daily = fillMissingDates(dateMap, fromISO, toISO)

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
    const filteredIds = ids.filter((id) => realIds.includes(id))
    if (filteredIds.length) {
      const { data: rests } = await supabase.from('restaurants').select('id, name').in('id', filteredIds)
      const nameMap = new Map((rests ?? []).map((r: { id: string; name: string }) => [r.id, r.name]))
      const impTop = topCounts(topImp.data ?? []).slice(0, 5).map(r=>({ ...r, name: nameMap.get(r.restaurant_id) ?? r.restaurant_id, type: 'impressions' as const }))
      const winTop = topCounts(topWin.data ?? []).slice(0, 5).map(r=>({ ...r, name: nameMap.get(r.restaurant_id) ?? r.restaurant_id, type: 'winner' as const }))
      const callTop = topCounts(topCall.data ?? []).slice(0, 5).map(r=>({ ...r, name: nameMap.get(r.restaurant_id) ?? r.restaurant_id, type: 'call' as const }))
      topRestaurants = [...impTop, ...winTop, ...callTop]
    }
  } catch {}

  const generic = {
    page_views: pv.count ?? 0,
    uniques: uniqCount,
    flow_starts: flow.count ?? 0,
    q_categories: qCat.count ?? 0,
    q_price: qPrice.count ?? 0,
    q_location: qLoc.count ?? 0,
    restaurantes_views: pvRest.count ?? 0,
    impressions: imp.count ?? 0,
    selections: sel.count ?? 0,
    cta_call: cal.count ?? 0,
    cta_maps: ctaMaps.count ?? 0,
    cta_menu: ctaMenu.count ?? 0,
    cta_reservations: ctaRes.count ?? 0,
    cta_instagram: ctaIg.count ?? 0,
    cta_winner: ctaWinner.count ?? 0,
    restaurants_active: restCount.count ?? 0,
  }

  return ok({
    totals: {
      ...generic,
      page_views_7d: generic.page_views,
      page_views_30d: generic.page_views,
      uniques_7d: generic.uniques,
      flow_starts_7d: generic.flow_starts,
      flow_starts_30d: generic.flow_starts,
      q_categories_7d: generic.q_categories,
      q_price_7d: generic.q_price,
      q_location_7d: generic.q_location,
      restaurantes_views_7d: generic.restaurantes_views,
      impressions_7d: generic.impressions,
      impressions_30d: generic.impressions,
      selections_7d: generic.selections,
      selections_30d: generic.selections,
      cta_call_7d: generic.cta_call,
      cta_call_30d: generic.cta_call,
      cta_maps_7d: generic.cta_maps,
      cta_menu_7d: generic.cta_menu,
      cta_reservations_7d: generic.cta_reservations,
      cta_instagram_7d: generic.cta_instagram,
      cta_winner_7d: generic.cta_winner,
      restaurants_active: generic.restaurants_active,
    },
    daily,
    topRestaurants,
    range: { from: fromISO, to: toISO, preset, label },
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
      return await handleGetGlobal(supabase, url)
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
