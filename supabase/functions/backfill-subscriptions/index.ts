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

function getStripe(): Stripe {
  const key = Deno.env.get('STRIPE_SECRET_KEY')
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured')
  return new Stripe(key, { apiVersion: '2026-04-22.dahlia', httpClient: Stripe.createFetchHttpClient() })
}

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return fail('Method not allowed', 405)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return fail('Missing or invalid Authorization header', 401)
  }

  const token = authHeader.replace('Bearer ', '')
  if (token !== Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
    return fail('Unauthorized', 403)
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const stripe = getStripe()

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

  for (const sub of subscriptions) {
    const restaurantId = sub.restaurant_id

    try {
      const sessions = await stripe.checkout.sessions.list({
        query: `metadata['restaurant_id']:'${restaurantId}'`,
        limit: 10,
      })

      const completedSession = sessions.data.find((s) => s.status === 'complete')
      if (!completedSession) {
        console.log('backfill: no completed session for', restaurantId)
        notFound++
        continue
      }

      let customerId = completedSession.customer as string | null

      if (!customerId && completedSession.payment_intent) {
        const pi = typeof completedSession.payment_intent === 'string'
          ? await stripe.paymentIntents.retrieve(completedSession.payment_intent)
          : completedSession.payment_intent
        customerId = pi.customer as string | null
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
}

if (import.meta.main) {
  serve(handler)
}

export { handler }
