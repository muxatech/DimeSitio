import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@22'

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
const VALID_PLAN_TYPES = new Set(['standard', 'founder'])
const VALID_PAYMENT_METHODS = new Set(['redirect', 'email'])

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
  if (body.reservations_url !== undefined && typeof body.reservations_url !== 'string') {
    errors.push('reservations_url must be a string')
  }
  if (body.instagram_url !== undefined && typeof body.instagram_url !== 'string') {
    errors.push('instagram_url must be a string')
  }
  if (body.is_demo !== undefined && typeof body.is_demo !== 'boolean') {
    errors.push('is_demo must be a boolean')
  }
  if (body.plan_type && !VALID_PLAN_TYPES.has(body.plan_type as string)) {
    errors.push('plan_type must be "standard" or "founder"')
  }
  if (body.payment_method && !VALID_PAYMENT_METHODS.has(body.payment_method as string)) {
    errors.push('payment_method must be "redirect" or "email"')
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
  for (const key of ['name', 'description', 'phone', 'address', 'zone', 'image_url', 'menu_url', 'reservations_url', 'instagram_url', 'owner_email', 'locale']) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitized[key].trim()
    }
  }
  return sanitized
}

async function assignFounderRank(supabase: ReturnType<typeof createClient>, restaurantId: string) {
  const { count, error: countErr } = await supabase
    .from('restaurants')
    .select('*', { count: 'exact', head: true })
    .not('founder_rank', 'is', null)

  if (countErr) {
    console.error('staff: assignFounderRank count failed', countErr.message)
    return
  }

  if (count !== null && count < 100) {
    const { error: updateErr } = await supabase
      .from('restaurants')
      .update({ founder_rank: count + 1 })
      .eq('id', restaurantId)

    if (updateErr) {
      console.error('staff: assignFounderRank update failed', updateErr.message)
    } else {
      console.log(`staff: assigned founder_rank ${count + 1} to ${restaurantId}`)
    }
  }
}

function getStripeKeys(planType: string) {
  const isFounderTest = planType === 'founder' && Deno.env.get('STRIPE_FOUNDER_MODE') === 'test'
  return {
    secretKey: isFounderTest
      ? Deno.env.get('STRIPE_SECRET_KEY_TEST') ?? ''
      : Deno.env.get('STRIPE_SECRET_KEY') ?? '',
    priceId: planType === 'founder'
      ? (isFounderTest
          ? Deno.env.get('STRIPE_PRICE_FOUNDER_SETUP_TEST') ?? ''
          : Deno.env.get('STRIPE_PRICE_FOUNDER_SETUP') ?? '')
      : PRICE_ID,
  }
}

async function sendPaymentLinkEmail(
  supabase: ReturnType<typeof createClient>,
  ownerEmail: string,
  restaurantName: string,
  paymentLink: string,
  planType: string,
  locale: string = 'es',
) {
  const planLabel = planType === 'founder' ? 'Plan Founder — 39€ (pago único)' : 'Plan Normal — 29€/mes'
  const fnUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
  }

  try {
    await fetch(fnUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to: ownerEmail,
        type: 'payment_link',
        subject: locale === 'en' ? 'Activate your restaurant on DimeSitio' : 'Activa tu restaurante en DimeSitio',
        html: `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${locale === 'en' ? 'Activate your restaurant' : 'Activa tu restaurante'}</title></head>
<body style="margin:0;padding:0;background-color:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafaf9;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" style="max-width:480px;background-color:#fff;border-radius:16px;">
<tr><td style="padding:32px 24px 0;text-align:center;"><h1 style="margin:0;font-size:24px;font-weight:700;color:#1c1917;">DimeSitio</h1></td></tr>
<tr><td style="padding:24px 24px 8px;text-align:center;">
<p style="margin:0;font-size:15px;color:#44403c;line-height:1.5;">${locale === 'en' ? `A profile has been created for <strong>${restaurantName}</strong> on DimeSitio.` : `Te han creado un perfil para <strong>${restaurantName}</strong> en DimeSitio.`}</p>
<p style="margin:12px 0 0;font-size:14px;color:#57534e;line-height:1.5;">${locale === 'en' ? `Selected plan: <strong>${planLabel}</strong>` : `Plan seleccionado: <strong>${planLabel}</strong>`}</p>
<p style="margin:12px 0 0;font-size:14px;color:#57534e;line-height:1.5;">${locale === 'en' ? 'Click the following link to complete payment and activate your restaurant.' : 'Haz clic en el siguiente enlace para completar el pago y activar tu restaurante.'}</p>
</td></tr>
<tr><td align="center" style="padding:24px;">
<a href="${paymentLink}" style="display:inline-block;padding:14px 32px;background-color:#292524;color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:16px;">${locale === 'en' ? 'Activate now' : 'Activar ahora'}</a>
</td></tr>
<tr><td style="padding:24px;text-align:center;border-top:1px solid #e7e5e4;"><p style="margin:0;font-size:12px;color:#a8a29e;">&copy; 2026 DimeSitio &mdash; Valencia</p></td></tr>
</table>
</td></tr></table></body>
</html>`,
      }),
    })
  } catch (emailErr) {
    console.error('staff: payment link email failed', emailErr.message)
  }
}

async function sendPaymentReminderEmail(
  supabase: ReturnType<typeof createClient>,
  ownerEmail: string,
  restaurantName: string,
  paymentLink: string,
  planType: string,
  locale: string = 'es',
) {
  const planLabel = planType === 'founder' ? 'Plan Founder — 39€ (pago único)' : 'Plan Normal — 29€/mes'
  const fnUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
  }

  try {
    await fetch(fnUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to: ownerEmail,
        type: 'payment_reminder',
        subject: locale === 'en' ? `Reminder — activate ${restaurantName} on DimeSitio` : `Recordatorio — activación de ${restaurantName} en DimeSitio`,
        html: `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${locale === 'en' ? 'Activation reminder' : 'Recordatorio de activación'}</title></head>
<body style="margin:0;padding:0;background-color:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafaf9;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" style="max-width:480px;background-color:#fff;border-radius:16px;">
<tr><td style="padding:32px 24px 0;text-align:center;"><h1 style="margin:0;font-size:24px;font-weight:700;color:#1c1917;">DimeSitio</h1></td></tr>
<tr><td style="padding:24px 24px 8px;text-align:center;">
<p style="margin:0;font-size:15px;color:#44403c;line-height:1.5;">${locale === 'en' ? `The profile for <strong>${restaurantName}</strong> on DimeSitio is pending activation.` : `El perfil de <strong>${restaurantName}</strong> en DimeSitio está pendiente de activación.`}</p>
<p style="margin:12px 0 0;font-size:14px;color:#57534e;line-height:1.5;">${locale === 'en' ? `Selected plan: <strong>${planLabel}</strong>` : `Plan seleccionado: <strong>${planLabel}</strong>`}</p>
<p style="margin:12px 0 0;font-size:14px;color:#57534e;line-height:1.5;">${locale === 'en' ? 'To complete the process, just pay through the following link. Once activated, your restaurant will appear in DimeSitio searches.' : 'Para finalizar el proceso, solo tienes que completar el pago a través del siguiente enlace. Una vez activado, tu restaurante aparecerá en las búsquedas de DimeSitio.'}</p>
</td></tr>
<tr><td align="center" style="padding:24px;">
<a href="${paymentLink}" style="display:inline-block;padding:14px 32px;background-color:#292524;color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:16px;">${locale === 'en' ? 'Activate restaurant' : 'Activar restaurante'}</a>
</td></tr>
<tr><td style="padding:24px;text-align:center;border-top:1px solid #e7e5e4;"><p style="margin:0;font-size:12px;color:#a8a29e;">&copy; 2026 DimeSitio &mdash; Valencia</p></td></tr>
</table>
</td></tr></table></body>
</html>`,
      }),
    })
  } catch (emailErr) {
    console.error('staff: reminder email failed', emailErr.message)
  }
}

async function handleSendReminder(
  supabase: ReturnType<typeof createClient>,
  user: { id: string },
  body: Record<string, unknown>,
  isAdmin: boolean,
) {
  const restaurantId = body.restaurant_id as string
  const ownerEmail = body.owner_email as string

  if (!restaurantId || !ownerEmail) {
    return fail('restaurant_id and owner_email are required')
  }

  if (!isAdmin) {
    const { data: staff } = await supabase
      .from('staff_users').select('user_id').eq('user_id', user.id).maybeSingle()
    if (!staff) return fail('Not authorized as staff', 403)
  }

  const { data: restaurant, error: rErr } = await supabase
    .from('restaurants').select('id, name, plan_type, active')
    .eq('id', restaurantId).single()
  if (rErr || !restaurant) return fail('Restaurant not found', 404)
  if (restaurant.plan_type !== 'founder') return fail('Not a founder plan')

  const { secretKey, priceId } = getStripeKeys('founder')
  if (!secretKey || !priceId) return fail('Stripe not configured', 500)

  const stripe = new Stripe(secretKey, {
    apiVersion: '2026-04-22.dahlia',
    httpClient: Stripe.createFetchHttpClient(),
  })

  // Find existing active payment link for this restaurant
  const existingLinks = await stripe.paymentLinks.list({ active: true, limit: 100 })
  const link = existingLinks.data.find(pl => pl.metadata?.restaurant_id === restaurantId)

  let paymentLinkUrl: string
  if (link) {
    paymentLinkUrl = link.url
    console.log('staff: found existing payment link', link.id, 'for restaurant', restaurantId)
  } else {
    // Create a new payment link if none found
    const metadata: Record<string, string> = {
      restaurant_id: restaurantId,
      owner_email: ownerEmail,
      source: 'staff',
      plan: 'founder',
    }
    const newLink = await stripe.paymentLinks.create({
      line_items: [{ price: priceId, quantity: 1 }],
      metadata,
      payment_intent_data: { setup_future_usage: 'off_session' },
    })
    paymentLinkUrl = newLink.url
    console.log('staff: created new payment link for reminder', { restaurantId, paymentLinkId: newLink.id })
  }

  await sendPaymentReminderEmail(supabase, ownerEmail, restaurant.name, paymentLinkUrl, 'founder')

  return ok({ sent: true, payment_link_url: paymentLinkUrl })
}

async function handleRegeneratePaymentLink(
  supabase: ReturnType<typeof createClient>,
  user: { id: string },
  body: Record<string, unknown>,
  isAdmin: boolean,
) {
  const restaurantId = body.restaurant_id as string
  const ownerEmail = body.owner_email as string

  if (!restaurantId || !ownerEmail) {
    return fail('restaurant_id and owner_email are required')
  }

  if (!isAdmin) {
    const { data: staff } = await supabase
      .from('staff_users').select('user_id').eq('user_id', user.id).maybeSingle()
    if (!staff) return fail('Not authorized as staff', 403)
  }

  const { data: restaurant, error: rErr } = await supabase
    .from('restaurants').select('id, name, plan_type, active')
    .eq('id', restaurantId).single()
  if (rErr || !restaurant) return fail('Restaurant not found', 404)
  if (restaurant.plan_type !== 'founder') return fail('Not a founder plan')
  if (restaurant.active) return fail('Restaurant is already active')

  const { secretKey, priceId } = getStripeKeys('founder')
  if (!secretKey || !priceId) return fail('Stripe not configured', 500)

  const stripe = new Stripe(secretKey, {
    apiVersion: '2026-04-22.dahlia',
    httpClient: Stripe.createFetchHttpClient(),
  })

  // Deactivate old payment links for this restaurant
  const oldLinks = await stripe.paymentLinks.list({ active: true, limit: 100 })
  for (const pl of oldLinks.data) {
    if (pl.metadata?.restaurant_id === restaurantId) {
      await stripe.paymentLinks.update(pl.id, { active: false })
      console.log('staff: deactivated payment link', pl.id, 'for restaurant', restaurantId)
    }
  }

  // Create new payment link
  const metadata: Record<string, string> = {
    restaurant_id: restaurantId,
    owner_email: ownerEmail,
    source: 'staff',
    plan: 'founder',
  }

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: priceId, quantity: 1 }],
    metadata,
    payment_intent_data: { setup_future_usage: 'off_session' },
  })

  console.log('staff: new payment link created', { restaurantId, paymentLinkId: paymentLink.id })

  await sendPaymentLinkEmail(supabase, ownerEmail, restaurant.name, paymentLink.url, 'founder')

  return ok({ payment_link_url: paymentLink.url, sent: true })
}

async function handleCreateForClient(
  supabase: ReturnType<typeof createClient>,
  user: { id: string },
  body: Record<string, unknown>
) {
  console.log('staff: create-for-client', JSON.stringify({ name: body.name, owner_email: body.owner_email, plan_type: body.plan_type, payment_method: body.payment_method }))

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
  const planType = (sanitized.plan_type as string) || 'standard'
  const paymentMethod = (sanitized.payment_method as string) || 'redirect'
  const locale = (sanitized.locale as string) || 'es'

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
      lat: sanitized.lat != null ? Number(sanitized.lat) : null,
      lng: sanitized.lng != null ? Number(sanitized.lng) : null,
      image_url: sanitized.image_url ?? null,
      menu_url: sanitized.menu_url ?? null,
      reservations_url: sanitized.reservations_url ?? null,
      instagram_url: sanitized.instagram_url ?? null,
      zone: sanitized.zone,
      active: false,
      is_demo: sanitized.is_demo ?? false,
      plan_type: planType,
    })
    .select()
    .single()

  if (insertError) {
    console.error('staff: insert restaurant failed', JSON.stringify(insertError))
    return fail('Failed to create restaurant', 500)
  }

  if (planType === 'founder') {
    await assignFounderRank(supabase, restaurant.id)
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

  // Stripe keys
  const { secretKey, priceId } = getStripeKeys(planType)
  if (!secretKey) {
    console.error('staff: Stripe secret key not configured')
    return fail('Payment is not configured', 500)
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2026-04-22.dahlia',
    httpClient: Stripe.createFetchHttpClient(),
  })

  const metadata: Record<string, string> = {
    restaurant_id: restaurant.id,
    owner_email: ownerEmail,
    source: 'staff',
    plan: planType,
  }

  const successUrl = `${Deno.env.get('PUBLIC_SITE_URL') ?? 'http://localhost:3000'}/${locale}/pago-exitoso?email=${encodeURIComponent(ownerEmail)}`
  const cancelUrl = `${Deno.env.get('PUBLIC_SITE_URL') ?? 'http://localhost:3000'}/${locale}/establecimientos`

  if (paymentMethod === 'email') {
    // Use Payment Link for email (never expires)
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: priceId, quantity: 1 }],
      metadata,
      ...(planType === 'founder' ? {
        payment_intent_data: {
          setup_future_usage: 'off_session',
        },
      } : {}),
    })

    console.log('staff: payment link created', { restaurantId: restaurant.id, paymentLinkId: paymentLink.id })

    await sendPaymentLinkEmail(supabase, ownerEmail, sanitized.name as string, paymentLink.url, planType, locale)
    return ok({
      restaurant_id: restaurant.id,
      checkout_url: null,
      sent: true,
    })
  }

  // Pay now: use Payment Link (shows QR on screen)
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: priceId, quantity: 1 }],
    metadata,
    ...(planType === 'founder' ? {
      payment_intent_data: {
        setup_future_usage: 'off_session',
      },
    } : {}),
  })

  console.log('staff: payment link created for redirect', { restaurantId: restaurant.id, paymentLinkId: paymentLink.id })
  return ok({
    restaurant_id: restaurant.id,
    checkout_url: paymentLink.url,
    sent: false,
  })
}

async function handleSendPaymentEmail(
  supabase: ReturnType<typeof createClient>,
  body: Record<string, unknown>,
) {
  const restaurantId = body.restaurant_id as string
  const ownerEmail = body.owner_email as string
  const paymentUrl = body.payment_url as string
  const planType = (body.plan_type as string) || 'standard'
  const locale = (body.locale as string) || 'es'

  if (!restaurantId || !ownerEmail || !paymentUrl) {
    return fail('restaurant_id, owner_email and payment_url are required')
  }

  const { data: restaurant, error: rErr } = await supabase
    .from('restaurants').select('id, name').eq('id', restaurantId).single()
  if (rErr || !restaurant) return fail('Restaurant not found', 404)

  await sendPaymentLinkEmail(supabase, ownerEmail, restaurant.name, paymentUrl, planType, locale)

  return ok({ sent: true })
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

    const authHeader = req.headers.get('Authorization')
    const adminKey = Deno.env.get('STAFF_ADMIN_KEY')
    const isAdmin = adminKey ? authHeader === `Bearer ${adminKey}` : false

    const user = isAdmin ? { id: 'admin' } : await getUser(req.headers.get('Authorization'), supabase)
    if (!user) {
      return fail('Unauthorized', 401)
    }

    if (req.method === 'POST') {
      const body = await req.json()
      if (body.action === 'regenerate-payment-link') {
        if (!isAdmin) return fail('Unauthorized', 401)
        return await handleRegeneratePaymentLink(supabase, user, body, isAdmin)
      }

      if (body.action === 'send-reminder') {
        if (!isAdmin) return fail('Unauthorized', 401)
        return await handleSendReminder(supabase, user, body, isAdmin)
      }

      if (body.action === 'send-payment-email') {
        return await handleSendPaymentEmail(supabase, body)
      }

      return await handleCreateForClient(supabase, user, body)
    }

    return fail('Method not allowed', 405)
  } catch (err) {
    console.error('staff: unhandled error', err instanceof Error ? err.message : String(err))
    return json({ success: false, data: null, error: err instanceof Error ? err.message : 'Internal server error' }, 500)
  }
})
