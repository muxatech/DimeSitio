import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
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

async function getAdminAccess(
  supabase: ReturnType<typeof createClient>,
  restaurantId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('restaurant_admins')
    .select('id')
    .eq('restaurant_id', restaurantId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return false
  return true
}

async function getStaffAccess(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('staff_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}

async function canAccessAsStaff(
  supabase: ReturnType<typeof createClient>,
  restaurantId: string,
  userId: string
): Promise<boolean> {
  const isStaff = await getStaffAccess(supabase, userId)
  if (!isStaff) return false

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('owner_id')
    .eq('id', restaurantId)
    .maybeSingle()

  return !!restaurant
}

const VALID_PRICE_LEVELS = new Set([1, 2, 3])
const VALID_UPDATE_FIELDS = new Set(['name', 'description', 'phone', 'address', 'price_level', 'zone', 'image_url', 'menu_url', 'reservations_url', 'active', 'is_demo', 'founder_rank', 'category_ids', 'lat', 'lng'])

function validateCreate(body: Record<string, unknown>) {
  const errors: string[] = []
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push('name is required and must be a non-empty string')
  }
  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push('description must be a string')
  }
  if (body.phone !== undefined && typeof body.phone !== 'string') {
    errors.push('phone must be a string')
  }
  if (body.address !== undefined && typeof body.address !== 'string') {
    errors.push('address must be a string')
  }
  if (!body.price_level || !VALID_PRICE_LEVELS.has(body.price_level as number)) {
    errors.push('price_level is required and must be 1, 2, or 3')
  }
  if (!body.zone || typeof body.zone !== 'string' || !body.zone.trim()) {
    errors.push('zone is required and must be a non-empty string')
  }
  if (body.image_url !== undefined && typeof body.image_url !== 'string') {
    errors.push('image_url must be a string')
  }
  if (body.menu_url !== undefined && typeof body.menu_url !== 'string') {
    errors.push('menu_url must be a string')
  }
  if (body.reservations_url !== undefined && typeof body.reservations_url !== 'string') {
    errors.push('reservations_url must be a string')
  }
  if (body.category_ids !== undefined) {
    if (!Array.isArray(body.category_ids)) {
      errors.push('category_ids must be an array')
    } else if (!body.category_ids.every((id: unknown) => typeof id === 'string')) {
      errors.push('category_ids must contain only strings')
    }
  }
  return errors
}

function sanitizeStrings(body: Record<string, unknown>) {
  const sanitized = { ...body }
  for (const key of ['name', 'description', 'phone', 'address', 'zone', 'image_url', 'menu_url', 'reservations_url']) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitized[key].trim()
    }
  }
  return sanitized
}

function validateUpdate(body: Record<string, unknown>): string[] {
  const errors: string[] = []

  for (const key of Object.keys(body)) {
    if (!VALID_UPDATE_FIELDS.has(key)) {
      errors.push(`Invalid field: ${key}`)
      continue
    }
    if (key === 'category_ids') {
      if (!Array.isArray(body[key])) {
        errors.push('category_ids must be an array')
      } else if (!body[key].every((id: unknown) => typeof id === 'string')) {
        errors.push('category_ids must contain only strings')
      }
      continue
    }
    if (key === 'price_level' && !VALID_PRICE_LEVELS.has(body[key] as number)) {
      errors.push('price_level must be 1, 2, or 3')
    }
    if (key === 'name' && (typeof body[key] !== 'string' || !(body[key] as string).trim())) {
      errors.push('name must be a non-empty string')
    }
    if (['description', 'phone', 'address', 'zone', 'image_url', 'menu_url', 'reservations_url'].includes(key) && typeof body[key] !== 'string') {
      errors.push(`${key} must be a string`)
    }
    if ((key === 'active' || key === 'is_demo') && typeof body[key] !== 'boolean') {
      errors.push(`${key} must be a boolean`)
    }
  }

  return errors
}

// ─── Handlers ──────────────────────────────────────────────

async function handleCreate(supabase: ReturnType<typeof createClient>, user: { id: string }, body: Record<string, unknown>) {
  console.log('restaurants: create', JSON.stringify({ name: body.name, zone: body.zone }))

  const errs = validateCreate(body)
  if (errs.length) {
    console.error('restaurants: create validation failed', JSON.stringify(errs))
    return fail(errs.join('; '))
  }

  const sanitized = sanitizeStrings(body)
  const categoryIds: string[] = sanitized.category_ids as string[] ?? []

  const { data: restaurant, error: insertError } = await supabase
    .from('restaurants')
    .insert({
      owner_id: user.id,
      name: sanitized.name,
      description: sanitized.description ?? null,
      phone: sanitized.phone ?? null,
      address: sanitized.address ?? null,
      city: 'Valencia',
      price_level: sanitized.price_level,
      lat: body.lat != null ? Number(body.lat) : null,
      lng: body.lng != null ? Number(body.lng) : null,
      image_url: sanitized.image_url ?? null,
      menu_url: sanitized.menu_url ?? null,
      reservations_url: sanitized.reservations_url ?? null,
      zone: sanitized.zone,
      active: false,
    })
    .select()
    .single()

  if (insertError) {
    console.error('restaurants: create insert failed', JSON.stringify(insertError))
    return fail('Failed to create restaurant', 500)
  }

  const { error: adminError } = await supabase
    .from('restaurant_admins')
    .insert({
      restaurant_id: restaurant.id,
      user_id: user.id,
      role: 'owner',
    })

  if (adminError) {
    console.error('restaurants: create admin insert failed, rolling back restaurant', JSON.stringify(adminError))
    await supabase.from('restaurants').delete().eq('id', restaurant.id)
    return fail('Failed to set admin role', 500)
  }

  await assignFounderRank(supabase, restaurant.id)

  const { data: updatedRestaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', restaurant.id)
    .single()

  if (categoryIds.length > 0) {
    const catRows = categoryIds.map((catId: string) => ({
      restaurant_id: restaurant.id,
      category_id: catId,
    }))
    const { error: catError } = await supabase
      .from('restaurant_categories')
      .insert(catRows)

    if (catError) {
      console.error('restaurants: create categories failed', JSON.stringify(catError))
    }
  }

  const responseRestaurant = updatedRestaurant ?? restaurant
  console.log('restaurants: created', responseRestaurant.id)
  return ok(responseRestaurant)
}

async function handleListMine(supabase: ReturnType<typeof createClient>, user: { id: string }) {
  console.log('restaurants: list mine', user.id)

  const { data: admins, error: adminsError } = await supabase
    .from('restaurant_admins')
    .select('restaurant_id, role')
    .eq('user_id', user.id)

  if (adminsError) {
    console.error('restaurants: list admins failed', JSON.stringify(adminsError))
    return fail('Failed to fetch restaurants', 500)
  }

  if (!admins || admins.length === 0) {
    return ok([])
  }

  const restaurantIds = admins.map((a: { restaurant_id: string }) => a.restaurant_id)
  const roleMap = new Map(admins.map((a: { restaurant_id: string; role: string }) => [a.restaurant_id, a.role]))

  const { data: restaurants, error: restError } = await supabase
    .from('restaurants')
    .select('*, restaurant_categories(category_id)')
    .in('id', restaurantIds)

  if (restError) {
    console.error('restaurants: list restaurants failed', JSON.stringify(restError))
    return fail('Failed to fetch restaurants', 500)
  }

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('restaurant_id, status')
    .in('restaurant_id', restaurantIds)

  const subMap = new Map((subscriptions ?? []).map((s: { restaurant_id: string; status: string }) => [s.restaurant_id, s.status]))

  // Aggregate stats
  const [allImp, allSel, allCal] = await Promise.all([
    supabase.from('impressions').select('restaurant_id').in('restaurant_id', restaurantIds),
    supabase.from('selections').select('restaurant_id').in('restaurant_id', restaurantIds),
    supabase.from('calls').select('restaurant_id').in('restaurant_id', restaurantIds),
  ])

  if (allImp.error) console.error('restaurants: stats impressions query failed', JSON.stringify(allImp.error))
  if (allSel.error) console.error('restaurants: stats selections query failed', JSON.stringify(allSel.error))
  if (allCal.error) console.error('restaurants: stats calls query failed', JSON.stringify(allCal.error))

  const impCount: Record<string, number> = {}
  const selCount: Record<string, number> = {}
  const calCount: Record<string, number> = {}

  for (const row of allImp.data ?? []) {
    impCount[row.restaurant_id] = (impCount[row.restaurant_id] || 0) + 1
  }
  for (const row of allSel.data ?? []) {
    selCount[row.restaurant_id] = (selCount[row.restaurant_id] || 0) + 1
  }
  for (const row of allCal.data ?? []) {
    calCount[row.restaurant_id] = (calCount[row.restaurant_id] || 0) + 1
  }

  const result = (restaurants ?? []).map((r: Record<string, unknown>) => ({
    id: r.id,
    owner_id: r.owner_id,
    name: r.name,
    description: r.description,
    phone: r.phone,
    address: r.address,
    city: r.city,
    price_level: r.price_level,
    zone: r.zone,
    image_url: r.image_url,
    menu_url: r.menu_url,
      active: r.active,
      is_demo: r.is_demo ?? false,
      plan_type: r.plan_type ?? 'standard',
      founder_rank: r.founder_rank ?? null,
    created_at: r.created_at,
    restaurant_categories: r.restaurant_categories,
    role: roleMap.get(r.id as string),
    subscription_status: subMap.get(r.id as string) ?? null,
    stats: {
      impressions: impCount[r.id as string] ?? 0,
      selections: selCount[r.id as string] ?? 0,
      calls: calCount[r.id as string] ?? 0,
    },
  }))

  console.log('restaurants: listed', result.length, 'for user', user.id)
  return ok(result)
}

async function handleUpdate(
  supabase: ReturnType<typeof createClient>,
  user: { id: string },
  restaurantId: string,
  body: Record<string, unknown>
) {
  console.log('restaurants: update', restaurantId)

  let hasAccess = await getAdminAccess(supabase, restaurantId, user.id)
  if (!hasAccess) {
    hasAccess = await canAccessAsStaff(supabase, restaurantId, user.id)
  }
  if (!hasAccess) {
    return fail('Not found or no permission', 404)
  }

  if (Object.keys(body).length === 0) {
    return fail('No fields to update')
  }

  const errs = validateUpdate(body)
  if (errs.length) {
    console.error('restaurants: update validation failed', JSON.stringify(errs))
    return fail(errs.join('; '))
  }

  if (body.active === true) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('restaurant_id', restaurantId)
      .maybeSingle()
    if (!sub || sub.status !== 'active') {
      console.log('restaurants: blocked active=true — no active subscription', restaurantId)
      return fail('Se necesita una suscripción activa para publicar el establecimiento', 403)
    }
  }

  const sanitized = sanitizeStrings(body)
  const categoryIds: string[] | undefined = sanitized.category_ids as string[] | undefined
  const updateFields = { ...sanitized } as Record<string, unknown>
  delete updateFields.category_ids

  if (updateFields.name !== undefined) updateFields.name = (updateFields.name as string).trim()
  if (Object.keys(updateFields).length > 0) {
    const { error: updateError } = await supabase
      .from('restaurants')
      .update(updateFields)
      .eq('id', restaurantId)

    if (updateError) {
      console.error('restaurants: update failed', JSON.stringify(updateError))
      return fail('Failed to update restaurant', 500)
    }
  }

  if (categoryIds !== undefined) {
    if (categoryIds.length > 0) {
      const { data: validCats, error: catCheckError } = await supabase
        .from('categories')
        .select('id')
        .in('id', categoryIds)

      if (catCheckError) {
        console.error('restaurants: category validation failed', JSON.stringify(catCheckError))
        return fail('Failed to validate categories', 500)
      }

      const validIds = new Set((validCats ?? []).map((c: { id: string }) => c.id))
      const invalidIds = categoryIds.filter((id: string) => !validIds.has(id))
      if (invalidIds.length > 0) {
        return fail(`Invalid category_ids: ${invalidIds.join(', ')}`)
      }
    }

    await supabase
      .from('restaurant_categories')
      .delete()
      .eq('restaurant_id', restaurantId)

    if (categoryIds.length > 0) {
      const catRows = categoryIds.map((catId: string) => ({
        restaurant_id: restaurantId,
        category_id: catId,
      }))
      const { error: catError } = await supabase
        .from('restaurant_categories')
        .insert(catRows)

      if (catError) {
        console.error('restaurants: update categories failed', JSON.stringify(catError))
        return fail('Failed to update categories', 500)
      }
    }
  }

  const { data: updated, error: fetchError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', restaurantId)
    .single()

  if (fetchError) {
    return fail('Failed to fetch updated restaurant', 500)
  }

  console.log('restaurants: updated', restaurantId)
  return ok(updated)
}

async function handleDelete(
  supabase: ReturnType<typeof createClient>,
  user: { id: string },
  restaurantId: string
) {
  console.log('restaurants: delete requested', JSON.stringify({ restaurantId, userId: user.id }))

  let via = 'admin'
  let hasAccess = await getAdminAccess(supabase, restaurantId, user.id)
  if (!hasAccess) {
    hasAccess = await canAccessAsStaff(supabase, restaurantId, user.id)
    via = 'staff'
  }
  if (!hasAccess) {
    return fail('Only owners can delete restaurants', 403)
  }

  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', restaurantId)

  if (error) {
    console.error('restaurants: delete failed', JSON.stringify({ restaurantId, error }))
    return fail('Failed to delete restaurant', 500)
  }

  console.log('restaurants: deleted', JSON.stringify({ restaurantId, userId: user.id, via }))
  return ok({ id: restaurantId, deleted: true, via })
}

async function handleStats(
  supabase: ReturnType<typeof createClient>,
  user: { id: string },
  restaurantId: string
) {
  console.log('restaurants: stats', restaurantId)

  const hasAccess = await getAdminAccess(supabase, restaurantId, user.id)
  if (!hasAccess) {
    return fail('Not found or no permission', 404)
  }

  const now = new Date()
  const daysAgo = (days: number) => new Date(now.getTime() - days * 86400000).toISOString()

  const [imp7, imp30, sel7, sel30, cal7, cal30] = await Promise.all([
    supabase.from('impressions').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId).gte('created_at', daysAgo(7)),
    supabase.from('impressions').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId).gte('created_at', daysAgo(30)),
    supabase.from('selections').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId).gte('created_at', daysAgo(7)),
    supabase.from('selections').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId).gte('created_at', daysAgo(30)),
    supabase.from('calls').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId).gte('created_at', daysAgo(7)),
    supabase.from('calls').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurantId).gte('created_at', daysAgo(30)),
  ])

  const i7 = imp7.count ?? 0
  const i30 = imp30.count ?? 0
  const s7 = sel7.count ?? 0
  const s30 = sel30.count ?? 0
  const c7 = cal7.count ?? 0
  const c30 = cal30.count ?? 0

  const conversionRate = i30 > 0 ? +(c30 / i30).toFixed(4) : 0

  console.log('restaurants: stats', restaurantId, { i7, i30, s7, s30, c7, c30 })
  return ok({
    impressions_7d: i7,
    impressions_30d: i30,
    selections_7d: s7,
    selections_30d: s30,
    calls_7d: c7,
    calls_30d: c30,
    conversion_rate: conversionRate,
  })
}

async function assignFounderRank(supabase: ReturnType<typeof createClient>, restaurantId: string) {
  const { count } = await supabase
    .from('restaurants')
    .select('*', { count: 'exact', head: true })
    .not('founder_rank', 'is', null)

  if (count !== null && count < 100) {
    await supabase
      .from('restaurants')
      .update({ founder_rank: count + 1 })
      .eq('id', restaurantId)
  }
}

// ─── Router ─────────────────────────────────────────────────

function route(method: string, pathname: string): { handler: string; params: Record<string, string> } {
  const path = pathname.replace(/^\/functions\/v1\/restaurants/, '').replace(/^\/restaurants/, '') || '/'

  if (method === 'POST' && path === '/') return { handler: 'create', params: {} }
  if (method === 'GET' && path === '/mine') return { handler: 'listMine', params: {} }
  if (method === 'PATCH') {
    const m = path.match(/^\/([^/]+)$/)
    if (m) return { handler: 'update', params: { id: m[1] } }
  }
  if (method === 'DELETE') {
    const m = path.match(/^\/([^/]+)$/)
    if (m) return { handler: 'delete', params: { id: m[1] } }
  }
  if (method === 'GET') {
    const m = path.match(/^\/([^/]+)\/stats$/)
    if (m) return { handler: 'stats', params: { id: m[1] } }
  }

  return { handler: 'notFound', params: {} }
}

// ─── Main ───────────────────────────────────────────────────

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const { handler, params } = route(req.method, url.pathname)
    console.log('restaurants: request', JSON.stringify({ method: req.method, path: url.pathname, handler }))

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Only GET /restaurants/mine and login/register might need auth differently
    // For create, update, delete, stats — auth is required
    const requiresAuth = ['create', 'listMine', 'update', 'delete', 'stats'].includes(handler)

    let user: { id: string } | null = null
    if (requiresAuth) {
      user = await getUser(req.headers.get('Authorization'), supabase)
      if (!user) {
        return fail('Unauthorized', 401)
      }
    }

    const authedUser = user
    if (requiresAuth && !authedUser) {
      return fail('Unauthorized', 401)
    }

    switch (handler) {
      case 'create': {
        const body = await req.json()
        return await handleCreate(supabase, authedUser!, body)
      }
      case 'listMine':
        return await handleListMine(supabase, authedUser!)
      case 'update': {
        const body = await req.json()
        return await handleUpdate(supabase, authedUser!, params.id, body)
      }
      case 'delete':
        return await handleDelete(supabase, authedUser!, params.id)
      case 'stats':
        return await handleStats(supabase, authedUser!, params.id)
      default:
        return fail('Not found', 404)
    }
  } catch (err) {
    console.error('restaurants: unhandled error', err instanceof Error ? err.message : String(err))
    return json({ success: false, data: null, error: err instanceof Error ? err.message : 'Internal server error' }, 500)
  }
}

if (import.meta.main) {
  serve(handler)
}
export { handler }
