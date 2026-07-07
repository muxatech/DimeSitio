import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@22'

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

function getStripe(key?: string): Stripe {
  const k = key ?? Deno.env.get('STRIPE_SECRET_KEY')
  if (!k) throw new Error('STRIPE_SECRET_KEY not configured')
  return new Stripe(k, { apiVersion: '2026-04-22.dahlia', httpClient: Stripe.createFetchHttpClient() })
}

function getStripeInstances(): Stripe[] {
  const keys: string[] = []
  const live = Deno.env.get('STRIPE_SECRET_KEY')
  if (live) keys.push(live)
  const test = Deno.env.get('STRIPE_SECRET_KEY_TEST')
  if (test) keys.push(test)
  return keys.map((k) => getStripe(k))
}

async function handler(req: Request): Promise<Response> {
  try {
    if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return fail('Method not allowed', 405)
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : authHeader
  const apiKey = req.headers.get('apikey') ?? ''

  const svcKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const backfillKey = Deno.env.get('BACKFILL_KEY') ?? ''
  if (token !== svcKey && token !== backfillKey && apiKey !== svcKey && apiKey !== backfillKey) {
    return fail('Unauthorized', 403)
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const stripes = getStripeInstances()

  const { data: subscriptions, error: queryError } = await supabase
    .from('subscriptions')
    .select('restaurant_id, stripe_customer_id, status')
    .is('stripe_customer_id', null)
    .neq('status', 'inactive')

  if (queryError) {
    console.error('backfill: query failed', JSON.stringify(queryError))
    return fail('Query failed', 500)
  }

  if (!subscriptions || subscriptions.length === 0) {
    return ok({ message: 'No subscriptions to backfill', updated: 0, not_found: 0 })
  }

  console.log('backfill: found', subscriptions.length, 'subscriptions to backfill')

  let updated = 0
  let notFound = 0

  // fetch all completed sessions once
  const allSessions: Stripe.Checkout.Session[] = []
  for (const stripe of stripes) {
    const first = await stripe.checkout.sessions.list({ limit: 100, status: 'complete' })
    allSessions.push(...first.data)
    let cursor = first
    while (cursor.has_more && allSessions.length < 2000) {
      cursor = await stripe.checkout.sessions.list({
        limit: 100,
        status: 'complete',
        starting_after: cursor.data[cursor.data.length - 1].id,
      })
      allSessions.push(...cursor.data)
    }
  }

  for (const sub of subscriptions) {
    const restaurantId = sub.restaurant_id

    const completedSession = allSessions.find(
      (s) => s.metadata?.restaurant_id === restaurantId
    )

    try {
      if (!completedSession) {
        console.log('backfill: no completed session for', restaurantId)
        notFound++
        continue
      }

      let customerId = completedSession.customer as string | null

      if (!customerId && completedSession.payment_intent) {
        // try each stripe key to retrieve the payment intent
        for (const stripe of stripes) {
          try {
            const pi = typeof completedSession.payment_intent === 'string'
              ? await stripe.paymentIntents.retrieve(completedSession.payment_intent)
              : completedSession.payment_intent
            if (pi.customer) {
              customerId = pi.customer as string
              break
            }
          } catch { /* try next key */ }
        }
      }

      if (!customerId) {
        console.log('backfill: no customer found for', restaurantId)
        notFound++
        continue
      }

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          stripe_customer_id: customerId,
          status: 'active',
        })
        .eq('restaurant_id', restaurantId)

      if (updateError) {
        console.error('backfill: update failed for', restaurantId, JSON.stringify(updateError))
      } else {
        console.log('backfill: updated', restaurantId, '→ customer:', customerId)
        updated++
      }
    } catch (err) {
      console.error('backfill: error processing', restaurantId, err.message)
      notFound++
    }
  }

  return ok({
    message: `Backfill complete: ${updated} updated, ${notFound} not found`,
    updated,
    not_found: notFound,
    total: subscriptions.length,
  })
  } catch (err) {
    console.error('backfill: handler crashed', err.message, err.stack)
    return fail('Internal error: ' + err.message, 500)
  }
}

if (import.meta.main) {
  serve(handler)
}

export { handler }
