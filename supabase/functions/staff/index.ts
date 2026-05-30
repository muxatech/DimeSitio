import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@17'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

const PRICE_ID = Deno.env.get('STRIPE_PRICE_ID') ?? ''

const VALID_PRICE_LEVELS = new Set([1, 2, 3])

function validateCreate(body: Record<string, unknown>) {
  const errors: string[] = []
  if (!body.owner_email || typeof body.owner_email !== 'string' || !body.owner_email.trim()) {
    errors.push('owner_email is required and must be a non-empty string')
  }
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
  for (const key of ['name', 'description', 'phone', 'address', 'zone', 'image_url', 'menu_url', 'owner_email']) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitized[key].trim()
    }
  }
  return sanitized
}

async function handleCreateForClient(
  supabase: ReturnType<typeof createClient>,
  user: { id: string },
  body: Record<string, unknown>
) {
  console.log('staff: create-for-client', JSON.stringify({ name: body.name, owner_email: body.owner_email }))

  // Verify staff role
  const { data: staff } = await supabase
    .from('staff_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!staff) {
    return fail('Not authorized as staff', 403)
  }

  const errs = validateCreate(body)
  if (errs.length) {
    console.error('staff: validation failed', JSON.stringify(errs))
    return fail(errs.join('; '))
  }

  const sanitized = sanitizeStrings(body)
  const ownerEmail = sanitized.owner_email as string
  const categoryIds: string[] = (sanitized.category_ids as string[]) ?? []

  // Create restaurant (no owner_id yet)
  const { data: restaurant, error: insertError } = await supabase
    .from('restaurants')
    .insert({
      owner_id: null,
      name: sanitized.name,
      description: sanitized.description ?? null,
      phone: sanitized.phone ?? null,
      address: sanitized.address ?? null,
      city: 'Valencia',
      price_level: sanitized.price_level,
      image_url: sanitized.image_url ?? null,
      menu_url: sanitized.menu_url ?? null,
      zone: sanitized.zone,
      active: false,
    })
    .select()
    .single()

  if (insertError) {
    console.error('staff: insert restaurant failed', JSON.stringify(insertError))
    return fail('Failed to create restaurant', 500)
  }

  // Create categories
  if (categoryIds.length > 0) {
    const catRows = categoryIds.map((catId: string) => ({
      restaurant_id: restaurant.id,
      category_id: catId,
    }))
    const { error: catError } = await supabase
      .from('restaurant_categories')
      .insert(catRows)

    if (catError) {
      console.error('staff: insert categories failed', JSON.stringify(catError))
    }
  }

  // Create Stripe Checkout Session
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  if (!stripeKey) {
    console.error('staff: STRIPE_SECRET_KEY not configured')
    return fail('Stripe is not configured', 500)
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-03-31' as any,
    httpClient: Stripe.createFetchHttpClient(),
  })

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    customer_email: ownerEmail,
    metadata: {
      restaurant_id: restaurant.id,
      owner_email: ownerEmail,
      source: 'staff',
    },
    success_url: `${Deno.env.get('PUBLIC_SITE_URL') ?? 'http://localhost:3000'}/pago-exitoso?email=${encodeURIComponent(ownerEmail)}`,
    cancel_url: `${Deno.env.get('PUBLIC_SITE_URL') ?? 'http://localhost:3000'}/establecimientos`,
  })

  console.log('staff: checkout session created', { restaurantId: restaurant.id, sessionId: session.id })

  return ok({
    restaurant_id: restaurant.id,
    checkout_url: session.url,
  })
}

// ─── Main ───────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    console.log('staff: request', JSON.stringify({ method: req.method, path: url.pathname }))

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const user = await getUser(req.headers.get('Authorization'), supabase)
    if (!user) {
      return fail('Unauthorized', 401)
    }

    if (req.method === 'POST') {
      const body = await req.json()
      return await handleCreateForClient(supabase, user, body)
    }

    return fail('Method not allowed', 405)
  } catch (err) {
    console.error('staff: unhandled error', err instanceof Error ? err.message : String(err))
    return json({ success: false, data: null, error: err instanceof Error ? err.message : 'Internal server error' }, 500)
  }
})
