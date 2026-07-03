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
  return new Stripe(key, { apiVersion: '2026-04-22.dahlia', httpClient: Stripe.createFetchHttpClient() })
}

const PRICE_ID = Deno.env.get('STRIPE_PRICE_ID') ?? ''

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

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
    success_url: body.success_url ?? `${Deno.env.get('PUBLIC_SITE_URL') ?? 'http://localhost:3000'}/suscripcion?checking=true&restaurant_id=${body.restaurant_id}`,
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

// ─── Payment Link ───────────────────────────────────────────

async function handleCreatePaymentLink(
  supabase: ReturnType<typeof createClient>,
  user: { id: string },
  body: { restaurant_id: string; plan_type: string }
) {
  console.log('stripe: create-payment-link', JSON.stringify(body))

  const { data: admin } = await supabase
    .from('restaurant_admins')
    .select('role')
    .eq('restaurant_id', body.restaurant_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!admin || admin.role !== 'owner') {
    return fail('Not found or no permission', 404)
  }

  const stripe = getStripe()

  const isFounder = body.plan_type === 'founder'
  const priceId = isFounder
    ? (Deno.env.get('STRIPE_FOUNDER_MODE') === 'test'
        ? Deno.env.get('STRIPE_PRICE_FOUNDER_SETUP_TEST') ?? ''
        : Deno.env.get('STRIPE_PRICE_FOUNDER_SETUP') ?? '')
    : PRICE_ID

  if (!priceId) {
    return fail('Price not configured', 500)
  }

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      restaurant_id: body.restaurant_id,
      source: 'self-service',
      plan: body.plan_type,
    },
    ...(isFounder ? {
      payment_intent_data: {
        setup_future_usage: 'off_session',
      },
    } : {}),
  })

  console.log('stripe: payment link created', paymentLink.id)
  return ok({ url: paymentLink.url })
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
  const cryptoProvider = Stripe.createSubtleCryptoProvider()

  const webhookSecrets = [
    Deno.env.get('STRIPE_WEBHOOK_SECRET'),
    Deno.env.get('STRIPE_WEBHOOK_SECRET_TEST'),
  ].filter(Boolean) as string[]

  if (!webhookSecrets.length) {
    console.error('stripe: webhook secret not configured')
    return fail('Webhook secret not configured', 500)
  }

  let event: Stripe.Event | undefined
  let lastErr: unknown
  for (const secret of webhookSecrets) {
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature ?? '', secret, undefined, cryptoProvider)
      console.log('stripe: webhook verified with secret', secret.slice(0, 10) + '...')
      break
    } catch (err) {
      lastErr = err
    }
  }

  if (!event) {
    console.error('stripe: webhook signature verification failed', JSON.stringify({
      error: lastErr instanceof Error ? lastErr.message : String(lastErr),
      bodyLength: rawBody?.length,
      signaturePrefix: signature?.slice(0, 20),
    }))
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

      const isFounder = session.metadata?.plan === 'founder'

      // Founder plan = one-time payment (mode: 'payment')
      if (isFounder) {
        const ownerEmail = session.metadata?.owner_email

        // Resolve customer ID from session, payment intent, or create one
        let customerId = session.customer as string | null

        if (!customerId && session.payment_intent) {
          const pi = typeof session.payment_intent === 'string'
            ? await stripe.paymentIntents.retrieve(session.payment_intent)
            : session.payment_intent
          customerId = pi.customer as string | null
        }

        if (!customerId && ownerEmail) {
          const existing = await stripe.customers.list({ email: ownerEmail, limit: 1 })
          customerId = existing.data[0]?.id ?? (await stripe.customers.create({ email: ownerEmail })).id
        }

        const { error: upsertError } = await supabase.from('subscriptions').upsert({
          restaurant_id: restaurantId,
          stripe_customer_id: customerId,
          stripe_subscription_id: null,
          status: 'active',
          current_period_end: new Date('2026-12-31T23:59:59Z').toISOString(),
        }, { onConflict: 'restaurant_id' })

        if (upsertError) {
          console.error('stripe: failed to upsert founder subscription', JSON.stringify(upsertError))
          return fail('Failed to save subscription', 500)
        }

        // Activate restaurant regardless (self-service or staff)
        await supabase.from('restaurants').update({ active: true }).eq('id', restaurantId)
        console.log('stripe: founder payment completed', { restaurantId, customerId })

        if (!ownerEmail) {
          console.log('stripe: founder checkout without owner_email (self-service)')
          break
        }

        console.log('stripe: founder flow — setting up owner for', ownerEmail)

        const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(ownerEmail, {
          data: { onboarded: true },
        })

        if (inviteError) {
          console.error('stripe: failed to invite user', JSON.stringify(inviteError))
        }

        let ownerUserId = inviteData?.user?.id

        if (!ownerUserId) {
          const { data: usersData } = await supabase.auth.admin.listUsers()
          const existingUser = usersData?.users?.find((u) => u.email === ownerEmail)
          if (existingUser) {
            ownerUserId = existingUser.id
            console.log('stripe: found existing user for founder flow', ownerUserId)
          }
        }

        if (ownerUserId) {
          const { error: adminError } = await supabase.from('restaurant_admins').insert({
            restaurant_id: restaurantId,
            user_id: ownerUserId,
            role: 'owner',
          })

          if (adminError) {
            console.error('stripe: failed to insert admin', JSON.stringify(adminError))
          } else {
            await supabase.from('restaurants').update({ owner_id: ownerUserId }).eq('id', restaurantId)
            console.log('stripe: founder owner setup completed', { restaurantId, ownerEmail, ownerUserId })
          }
        }

        const { data: rData } = await supabase.from('restaurants').select('name').eq('id', restaurantId).single()
        const rName = escapeHtml(rData?.name ?? 'tu restaurante')

        try {
          await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({
              to: ownerEmail,
              type: 'payment_receipt',
              restaurant_id: restaurantId,
              subject: '¡Tu restaurante ya está activo en DimeSitio!',
              html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Restaurante activo</title></head>
<body style="margin:0;padding:0;background-color:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafaf9;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" style="max-width:480px;background-color:#fff;border-radius:16px;">
<tr><td style="padding:32px 24px 0;text-align:center;"><h1 style="margin:0;font-size:24px;font-weight:700;color:#1c1917;">DimeSitio</h1></td></tr>
<tr><td style="padding:24px 24px 8px;text-align:center;">
<p style="margin:0;font-size:15px;color:#44403c;line-height:1.5;"><strong>${rName}</strong> ya está activo en DimeSitio.</p>
<p style="margin:12px 0 0;font-size:14px;color:#57534e;line-height:1.5;">Pago único de 39€ — sin cuotas hasta enero de 2027. Recibirás un email de invitación para crear tu cuenta y gestionar tu perfil.</p>
</td></tr>
<tr><td align="center" style="padding:24px;">
<a href="${Deno.env.get('PUBLIC_SITE_URL') ?? 'https://dimesitio.es'}/set-password" style="display:inline-block;padding:14px 32px;background-color:#292524;color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:16px;">Ir al panel</a>
</td></tr>
<tr><td style="padding:24px;text-align:center;border-top:1px solid #e7e5e4;"><p style="margin:0;font-size:12px;color:#a8a29e;">&copy; 2026 DimeSitio &mdash; Valencia</p></td></tr>
</table>
</td></tr></table></body>
</html>`,
            }),
          })
        } catch (emailErr) {
          console.error('stripe: founder receipt email failed', emailErr.message)
        }
        break
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

      await supabase.from('restaurants').update({ active: true }).eq('id', restaurantId)

      const { data: restaurantData } = await supabase
        .from('restaurants')
        .select('name, plan_type')
        .eq('id', restaurantId)
        .single()

      const restaurantName = escapeHtml(restaurantData?.name ?? 'tu restaurante')
      const planType = restaurantData?.plan_type ?? 'standard'
      const planLabel = planType === 'founder' ? 'Plan Founder — 39€ (pago único)' : '29€/mes'
      const fnUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      }

      if (source === 'self-service') {
        console.log('stripe: subscription activated (self-service)', restaurantId)

        const customerEmails = session.customer_email || session.customer_details?.email
        const ownerEmail = customerEmails as string | undefined

        if (ownerEmail) {
          try {
            await fetch(fnUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                to: ownerEmail,
                type: 'payment_receipt',
                restaurant_id: restaurantId,
                subject: '¡Pago confirmado! Tu restaurante ya está activo en DimeSitio',
                html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Pago confirmado</title></head>
<body style="margin:0;padding:0;background-color:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafaf9;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" style="max-width:480px;background-color:#fff;border-radius:16px;">
<tr><td style="padding:32px 24px 0;text-align:center;"><h1 style="margin:0;font-size:24px;font-weight:700;color:#1c1917;">DimeSitio</h1></td></tr>
<tr><td style="padding:24px 24px 8px;text-align:center;">
<p style="margin:0;font-size:15px;color:#44403c;line-height:1.5;">¡Pago confirmado!</p>
<p style="margin:12px 0 0;font-size:15px;color:#44403c;line-height:1.5;"><strong>${restaurantName}</strong> ya está activo en DimeSitio.</p>
<p style="margin:12px 0 0;font-size:14px;color:#57534e;line-height:1.5;">Tu suscripción de ${planLabel} está al día. Puedes gestionar tu perfil y ver estadísticas desde el panel.</p>
</td></tr>
<tr><td align="center" style="padding:24px;">
<a href="${Deno.env.get('PUBLIC_SITE_URL') ?? 'https://dimesitio.es'}/dashboard" style="display:inline-block;padding:14px 32px;background-color:#292524;color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:16px;">Ir al panel</a>
</td></tr>
<tr><td style="padding:24px;text-align:center;border-top:1px solid #e7e5e4;"><p style="margin:0;font-size:12px;color:#a8a29e;">&copy; 2026 DimeSitio &mdash; Valencia</p></td></tr>
</table>
</td></tr></table></body>
</html>`,
              }),
            })
          } catch (emailErr) {
            console.error('stripe: welcome email failed', emailErr.message)
          }
        }
      } else {
        const ownerEmail = session.metadata?.owner_email
        if (!ownerEmail) {
          console.error('stripe: staff checkout without owner_email metadata')
          return ok({ received: true })
        }

        console.log('stripe: subscription activated (staff)', restaurantId)

        const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(ownerEmail, {
          data: { onboarded: true },
        })

        if (inviteError) {
          console.error('stripe: failed to invite user', JSON.stringify(inviteError))
        }

        let ownerUserId = inviteData?.user?.id

        if (!ownerUserId) {
          const { data: usersData } = await supabase.auth.admin.listUsers()
          const existingUser = usersData?.users?.find((u) => u.email === ownerEmail)
          if (existingUser) {
            ownerUserId = existingUser.id
            console.log('stripe: found existing user for staff flow', ownerUserId)
          }
        }

        if (ownerUserId) {
          const { error: adminError } = await supabase.from('restaurant_admins').insert({
            restaurant_id: restaurantId,
            user_id: ownerUserId,
            role: 'owner',
          })

          if (adminError) {
            console.error('stripe: failed to insert admin', JSON.stringify(adminError))
          } else {
            await supabase.from('restaurants').update({ owner_id: ownerUserId, active: true }).eq('id', restaurantId)
            console.log('stripe: staff flow completed', { restaurantId, ownerEmail, ownerUserId })
          }
        }

        try {
          await fetch(fnUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              to: ownerEmail,
              type: 'payment_receipt',
              restaurant_id: restaurantId,
              subject: '¡Tu restaurante ya está activo en DimeSitio!',
              html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Restaurante activo</title></head>
<body style="margin:0;padding:0;background-color:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafaf9;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" style="max-width:480px;background-color:#fff;border-radius:16px;">
<tr><td style="padding:32px 24px 0;text-align:center;"><h1 style="margin:0;font-size:24px;font-weight:700;color:#1c1917;">DimeSitio</h1></td></tr>
<tr><td style="padding:24px 24px 8px;text-align:center;">
<p style="margin:0;font-size:15px;color:#44403c;line-height:1.5;"><strong>${restaurantName}</strong> ya está activo en DimeSitio.</p>
<p style="margin:12px 0 0;font-size:14px;color:#57534e;line-height:1.5;">Tu ${planLabel}. Recibirás un email de invitación para crear tu cuenta y gestionar tu perfil. Revisa tu bandeja de entrada.</p>
</td></tr>
<tr><td align="center" style="padding:24px;">
<a href="${Deno.env.get('PUBLIC_SITE_URL') ?? 'https://dimesitio.es'}/set-password" style="display:inline-block;padding:14px 32px;background-color:#292524;color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:16px;">Ir al panel</a>
</td></tr>
<tr><td style="padding:24px;text-align:center;border-top:1px solid #e7e5e4;"><p style="margin:0;font-size:12px;color:#a8a29e;">&copy; 2026 DimeSitio &mdash; Valencia</p></td></tr>
</table>
</td></tr></table></body>
</html>`,
            }),
          })
        } catch (emailErr) {
          console.error('stripe: receipt email failed', emailErr.message)
        }
      }
      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = invoice.subscription as string
      const stripe = getStripe()

      let { data: subs } = await supabase
        .from('subscriptions')
        .select('restaurant_id')
        .eq('stripe_subscription_id', subscriptionId)
        .maybeSingle()

      if (!subs) {
        console.log('stripe: invoice paid but no subscription record — trying fallback lookup')
        const checkoutSessionId = (invoice as Record<string, unknown>).checkout_session as string | undefined
        if (checkoutSessionId) {
          try {
            const checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId)
            const restaurantId = checkoutSession.metadata?.restaurant_id
            const customerId = checkoutSession.customer as string
            if (restaurantId) {
              const { error: upsertError } = await supabase.from('subscriptions').upsert({
                restaurant_id: restaurantId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                status: 'active',
                current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
              }, { onConflict: 'restaurant_id' })

              if (upsertError) {
                console.error('stripe: invoice paid fallback upsert failed', JSON.stringify(upsertError))
              } else {
                await supabase.from('restaurants').update({ active: true }).eq('id', restaurantId)
                subs = { restaurant_id: restaurantId }
                console.log('stripe: invoice paid fallback created subscription', restaurantId)
              }
            }
          } catch (csErr) {
            console.error('stripe: invoice paid fallback checkout retrieval failed', csErr.message)
          }
        }
      }

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

        try {
          const { data: admins } = await supabase
            .from('restaurant_admins')
            .select('user_id')
            .eq('restaurant_id', subs.restaurant_id)
            .eq('role', 'owner')
            .limit(1)

          const adminUserId = admins?.[0]?.user_id
          if (adminUserId) {
            const { data: userData } = await supabase.auth.admin.getUserById(adminUserId)
            const ownerEmail = userData?.user?.email
            if (ownerEmail) {
              const { data: rData } = await supabase.from('restaurants').select('name').eq('id', subs.restaurant_id).single()
              const rName = escapeHtml(rData?.name ?? 'tu restaurante')
              const invoiceTotal = (invoice.amount_paid / 100).toFixed(2)

              await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                },
                body: JSON.stringify({
                  to: ownerEmail,
                  type: 'invoice',
                  restaurant_id: subs.restaurant_id,
                  subject: 'Recibo de tu suscripción DimeSitio',
                  html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Recibo</title></head>
<body style="margin:0;padding:0;background-color:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafaf9;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" style="max-width:480px;background-color:#fff;border-radius:16px;">
<tr><td style="padding:32px 24px 0;text-align:center;"><h1 style="margin:0;font-size:24px;font-weight:700;color:#1c1917;">DimeSitio</h1></td></tr>
<tr><td style="padding:24px 24px 8px;text-align:center;">
<p style="margin:0;font-size:15px;color:#44403c;line-height:1.5;">Recibo de suscripción</p>
<p style="margin:12px 0 0;font-size:14px;color:#57534e;line-height:1.5;"><strong>${rName}</strong></p>
<p style="margin:4px 0 0;font-size:14px;color:#57534e;line-height:1.5;">Importe: <strong>${invoiceTotal}€</strong></p>
<p style="margin:4px 0 0;font-size:14px;color:#57534e;line-height:1.5;">Tu suscripción sigue activa. Gracias por confiar en DimeSitio.</p>
</td></tr>
<tr><td align="center" style="padding:24px;">
<a href="${Deno.env.get('PUBLIC_SITE_URL') ?? 'https://dimesitio.es'}/dashboard" style="display:inline-block;padding:14px 32px;background-color:#292524;color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:16px;">Ir al panel</a>
</td></tr>
<tr><td style="padding:24px;text-align:center;border-top:1px solid #e7e5e4;"><p style="margin:0;font-size:12px;color:#a8a29e;">&copy; 2026 DimeSitio &mdash; Valencia</p></td></tr>
</table>
</td></tr></table></body>
</html>`,
                }),
              })
            }
          }
        } catch (emailErr) {
          console.error('stripe: invoice email failed', emailErr.message)
        }
      }
      break
    }

    case 'customer.subscription.created': {
      const createdSub = event.data.object as Stripe.Subscription
      console.log('stripe: subscription created', createdSub.id)

      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('restaurant_id')
        .eq('stripe_subscription_id', createdSub.id)
        .maybeSingle()

      if (!existingSub) {
        const checkoutSessionId = (createdSub as Record<string, unknown>).checkout_session as string | undefined
        if (checkoutSessionId) {
          try {
            const stripe = getStripe()
            const checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId)
            const restaurantId = checkoutSession.metadata?.restaurant_id
            const customerId = checkoutSession.customer as string
            if (restaurantId) {
              await supabase.from('subscriptions').upsert({
                restaurant_id: restaurantId,
                stripe_customer_id: customerId,
                stripe_subscription_id: createdSub.id,
                status: 'active',
                current_period_end: new Date(createdSub.current_period_end * 1000).toISOString(),
              }, { onConflict: 'restaurant_id' })

              await supabase.from('restaurants').update({ active: true }).eq('id', restaurantId)
              console.log('stripe: subscription created fallback — activated', restaurantId)
            }
          } catch (csErr) {
            console.error('stripe: subscription created fallback failed', csErr.message)
          }
        }
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
      console.log('stripe: unhandled event type', event.type, JSON.stringify({ id: event.id }))
  }

  return ok({ received: true })
}

// ─── Health ─────────────────────────────────────────────────

async function handleHealth(): Promise<Response> {
  const stripe = getStripe()
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  const cryptoProvider = Stripe.createSubtleCryptoProvider()

  if (!webhookSecret) return fail('Webhook secret not configured', 500)

  const payload = JSON.stringify({ test: true })
  const timestamp = Math.floor(Date.now() / 1000)
  const signedPayload = `${timestamp}.${payload}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(webhookSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sigBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload))
  const hexSig = Array.from(new Uint8Array(sigBuf)).map((b) => b.toString(16).padStart(2, '0')).join('')
  const header = `t=${timestamp},v1=${hexSig}`

  try {
    await stripe.webhooks.constructEventAsync(payload, header, webhookSecret, undefined, cryptoProvider)
    return ok({ healthy: true })
  } catch (err) {
    console.error('stripe: health check failed', err instanceof Error ? err.message : String(err))
    return fail('Health check failed', 500)
  }
}

// ─── Router ─────────────────────────────────────────────────

function route(method: string, pathname: string): { handler: string; params: Record<string, string> } {
  const path = pathname.replace(/^\/functions\/v1\/stripe/, '').replace(/^\/stripe/, '') || '/'

  if (method === 'GET' && path === '/health') return { handler: 'health', params: {} }
  if (method === 'POST' && (path === '/webhook' || path === '/')) return { handler: 'webhook', params: {} }
  if (method === 'POST' && path === '/create-checkout') return { handler: 'createCheckout', params: {} }
  if (method === 'POST' && path === '/create-portal') return { handler: 'createPortal', params: {} }
  if (method === 'POST' && path === '/create-payment-link') return { handler: 'createPaymentLink', params: {} }
  if (method === 'POST' && path === '/verify') return { handler: 'verify', params: {} }

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
    console.log('stripe: request', JSON.stringify({ method: req.method, path: url.pathname, handler }))

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Health check doesn't need auth
    if (handler === 'health') return await handleHealth()

    // Webhook doesn't need auth (uses signature verification)
    if (handler === 'webhook') {
      const rawBody = await req.text()
      const signature = req.headers.get('stripe-signature')
      console.log('stripe: webhook request', JSON.stringify({ bodyLength: rawBody.length, hasSignature: !!signature }))
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
      case 'createPaymentLink': {
        const body = await req.json()
        return await handleCreatePaymentLink(supabase, user, body)
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
}

if (import.meta.main) {
  serve(handler)
}
export { handler }
