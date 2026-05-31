import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@22'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, x-region, stripe-signature',
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

function getStripe(): Stripe {
  const key = Deno.env.get('STRIPE_SECRET_KEY')
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured')
  return new Stripe(key, { apiVersion: '2026-04-22', httpClient: Stripe.createFetchHttpClient() })
}

const PRICE_ID = Deno.env.get('STRIPE_PRICE_ID') ?? ''

// ─── Checkout Session (self-service) ────────────────────────

async function handleCreateCheckout(
  supabase: ReturnType<typeof createClient>,
  user: { id: string },
  body: { restaurant_id: string; success_url?: string; cancel_url?: string }
) {
  console.log('stripe: create-checkout', JSON.stringify({ restaurant_id: body.restaurant_id }))

  const { data: admin } = await supabase
    .from('restaurant_admins')
    .select('role')
    .eq('restaurant_id', body.restaurant_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!admin || admin.role !== 'owner') {
    return fail('Not found or no permission', 404)
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('restaurant_id', body.restaurant_id)
    .maybeSingle()

  const stripe = getStripe()

  const customerData: { email?: string; metadata: Record<string, string> } = {
    metadata: { restaurant_id: body.restaurant_id },
  }

  const { data: userData } = await supabase.auth.admin.getUserById(user.id)
  if (userData?.user?.email) {
    customerData.email = userData.user.email
  }

  let customerId = sub?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create(customerData)
    customerId = customer.id
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    metadata: { restaurant_id: body.restaurant_id, source: 'self-service' },
    success_url: body.success_url ?? `${Deno.env.get('PUBLIC_SITE_URL') ?? 'http://localhost:3000'}/establecimientos`,
    cancel_url: body.cancel_url ?? `${Deno.env.get('PUBLIC_SITE_URL') ?? 'http://localhost:3000'}/suscripcion`,
  })

  console.log('stripe: checkout session created', session.id)
  return ok({ url: session.url })
}

// ─── Customer Portal ───────────────────────────────────────

async function handleCreatePortal(
  supabase: ReturnType<typeof createClient>,
  user: { id: string },
  body: { restaurant_id: string; return_url?: string }
) {
  console.log('stripe: create-portal', JSON.stringify({ restaurant_id: body.restaurant_id }))

  const { data: admin } = await supabase
    .from('restaurant_admins')
    .select('role')
    .eq('restaurant_id', body.restaurant_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!admin || admin.role !== 'owner') {
    return fail('Not found or no permission', 404)
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('restaurant_id', body.restaurant_id)
    .maybeSingle()

  if (!sub?.stripe_customer_id) {
    return fail('No subscription found')
  }

  const stripe = getStripe()

    const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: body.return_url ?? `${Deno.env.get('PUBLIC_SITE_URL') ?? 'http://localhost:3000'}/suscripcion`,
  })

  console.log('stripe: portal session created', session.url)
  return ok({ url: session.url })
}

// ─── Verify Subscription ───────────────────────────────────

async function handleVerify(
  supabase: ReturnType<typeof createClient>,
  user: { id: string },
  body: { restaurant_id: string }
) {
  console.log('stripe: verify', JSON.stringify({ restaurant_id: body.restaurant_id }))

  const { data: admin } = await supabase
    .from('restaurant_admins')
    .select('role')
    .eq('restaurant_id', body.restaurant_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!admin) {
    return fail('Not found or no permission', 404)
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('restaurant_id', body.restaurant_id)
    .maybeSingle()

  return ok({
    subscription_status: sub?.status ?? 'inactive',
    current_period_end: sub?.current_period_end ?? null,
  })
}

// ─── Webhook ────────────────────────────────────────────────

async function handleWebhook(supabase: ReturnType<typeof createClient>, rawBody: string, signature: string | null) {
  console.log('stripe: webhook received')

  const stripe = getStripe()
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!webhookSecret) {
    console.error('stripe: webhook secret not configured')
    return fail('Webhook secret not configured', 500)
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature ?? '', webhookSecret)
  } catch (err) {
    console.error('stripe: webhook signature verification failed', err instanceof Error ? err.message : String(err))
    return fail('Invalid signature', 401)
  }

  console.log('stripe: event', event.type, event.id)

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const restaurantId = session.metadata?.restaurant_id
      const source = session.metadata?.source

      if (!restaurantId) {
        console.error('stripe: checkout completed without restaurant_id metadata')
        return ok({ received: true })
      }

      if (source === 'self-service') {
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        const { error: upsertError } = await supabase.from('subscriptions').upsert({
          restaurant_id: restaurantId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        }, { onConflict: 'restaurant_id' })

        if (upsertError) {
          console.error('stripe: failed to upsert subscription', JSON.stringify(upsertError))
          return fail('Failed to save subscription', 500)
        }

        await supabase.from('restaurants').update({ active: true }).eq('id', restaurantId)
        console.log('stripe: subscription activated (self-service)', restaurantId)
      } else {
        const ownerEmail = session.metadata?.owner_email
        if (!ownerEmail) {
          console.error('stripe: staff checkout without owner_email metadata')
          return ok({ received: true })
        }

        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        const { error: upsertError } = await supabase.from('subscriptions').upsert({
          restaurant_id: restaurantId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        }, { onConflict: 'restaurant_id' })

        if (upsertError) {
          console.error('stripe: failed to upsert subscription', JSON.stringify(upsertError))
          return fail('Failed to save subscription', 500)
        }

        const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(ownerEmail, {
          data: { onboarded: true },
        })

        if (inviteError) {
          console.error('stripe: failed to invite user', JSON.stringify(inviteError))
        }

        const invitedUserId = inviteData?.user?.id

        if (invitedUserId) {
          const { error: adminError } = await supabase.from('restaurant_admins').insert({
            restaurant_id: restaurantId,
            user_id: invitedUserId,
            role: 'owner',
          })

          if (adminError) {
            console.error('stripe: failed to insert admin', JSON.stringify(adminError))
          } else {
            await supabase.from('restaurants').update({ owner_id: invitedUserId, active: true }).eq('id', restaurantId)
            console.log('stripe: staff flow completed', { restaurantId, ownerEmail, invitedUserId })
          }
        }
      }
      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = invoice.subscription as string

      const { data: subs } = await supabase
        .from('subscriptions')
        .select('restaurant_id')
        .eq('stripe_subscription_id', subscriptionId)
        .maybeSingle()

      if (subs) {
        const periodEnd = invoice.lines?.data?.[0]?.period?.end
          ? new Date(invoice.lines.data[0].period.end * 1000).toISOString()
          : new Date(Date.now() + 30 * 86400000).toISOString()

        await supabase
          .from('subscriptions')
          .update({ status: 'active', current_period_end: periodEnd })
          .eq('restaurant_id', subs.restaurant_id)

        await supabase.from('restaurants').update({ active: true }).eq('id', subs.restaurant_id)
        console.log('stripe: invoice paid, subscription renewed', subs.restaurant_id, { periodEnd })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const deletedSub = event.data.object as Stripe.Subscription

      const { data: subs } = await supabase
        .from('subscriptions')
        .select('restaurant_id')
        .eq('stripe_subscription_id', deletedSub.id)
        .maybeSingle()

      if (subs) {
        await supabase.from('subscriptions').update({ status: 'canceled' }).eq('restaurant_id', subs.restaurant_id)
        await supabase.from('restaurants').update({ active: false }).eq('id', subs.restaurant_id)
        console.log('stripe: subscription deleted, deactivated', subs.restaurant_id)
      }
      break
    }

    default:
      console.log('stripe: unhandled event type', event.type)
  }

  return ok({ received: true })
}

// ─── Router ─────────────────────────────────────────────────

function route(method: string, pathname: string): { handler: string; params: Record<string, string> } {
  const path = pathname.replace(/^\/functions\/v1\/stripe/, '').replace(/^\/stripe/, '') || '/'

  if (method === 'POST' && path === '/webhook') return { handler: 'webhook', params: {} }
  if (method === 'POST' && path === '/create-checkout') return { handler: 'createCheckout', params: {} }
  if (method === 'POST' && path === '/create-portal') return { handler: 'createPortal', params: {} }
  if (method === 'POST' && path === '/verify') return { handler: 'verify', params: {} }

  return { handler: 'notFound', params: {} }
}

// ─── Main ───────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const { handler, params } = route(req.method, url.pathname)
    console.log('stripe: request', JSON.stringify({ method: req.method, path: url.pathname, handler }))

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Webhook doesn't need auth (uses signature verification)
    if (handler === 'webhook') {
      const rawBody = await req.text()
      const signature = req.headers.get('stripe-signature')
      return await handleWebhook(supabase, rawBody, signature)
    }

    // All other endpoints need auth
    const user = await getUser(req.headers.get('Authorization'), supabase)
    if (!user) {
      return fail('Unauthorized', 401)
    }

    switch (handler) {
      case 'createCheckout': {
        const body = await req.json()
        return await handleCreateCheckout(supabase, user, body)
      }
      case 'createPortal': {
        const body = await req.json()
        return await handleCreatePortal(supabase, user, body)
      }
      case 'verify': {
        const body = await req.json()
        return await handleVerify(supabase, user, body)
      }
      default:
        return fail('Not found', 404)
    }
  } catch (err) {
    console.error('stripe: unhandled error', err instanceof Error ? err.message : String(err))
    return json({ success: false, data: null, error: err instanceof Error ? err.message : 'Internal server error' }, 500)
  }
})
