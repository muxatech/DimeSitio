import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, x-region',
}

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json()
    console.log('events: received', JSON.stringify({ type: body.type, restaurant_id: body.restaurant_id, session_id: body.session_id, round: body.round }))

    if (!body.type || !body.session_id) {
      const msg = 'Missing required fields: type, session_id'
      console.error('events: validation failed', msg)
      return new Response(JSON.stringify({ error: msg }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (body.type !== 'start' && !body.restaurant_id) {
      const msg = 'Missing required field: restaurant_id'
      console.error('events: validation failed', msg)
      return new Response(JSON.stringify({ error: msg }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const allowedTypes = ['start', 'impression', 'detail_view', 'swipe', 'click', 'add_contact', 'share']
    if (!allowedTypes.includes(body.type)) {
      console.error('events: invalid type', body.type)
      return new Response(JSON.stringify({ error: 'Invalid type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (body.restaurant_id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.restaurant_id)) {
      console.error('events: invalid restaurant_id format', body.restaurant_id)
      return new Response(JSON.stringify({ error: 'Invalid restaurant_id format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    const { error } = await supabase.from('events').insert({
      type: body.type,
      session_id: body.session_id,
      restaurant_id: body.restaurant_id || null,
      round: body.round || 1,
      metadata: body.metadata || null,
    })

    if (error) {
      console.error('events: insert error', error.message)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // If first_call event, send email to admin
    if (body.type === 'first_call') {
      try {
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('name, admin_email')
          .eq('id', body.restaurant_id)
          .single()

        if (restaurant?.admin_email) {
          const safeName = escapeHtml(restaurant.name ?? '')
          const emailRes = await fetch(
            `${Deno.env.get('PUBLIC_SITE_URL') ?? 'http://localhost:3000'}/api/send-email`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: restaurant.admin_email,
                subject: `📞 ¡${safeName} ha recibido una llamada!`,
                html: `
                  <h2>Nueva llamada registrada</h2>
                  <p>El restaurante <strong>${safeName}</strong> ha recibido una llamada desde DimeSitio.</p>
                  <p>Gracias por usar DimeSitio.</p>
                `,
                type: 'first_call',
              }),
            }
          )

          if (!emailRes.ok) {
            const emailError = await emailRes.text()
            console.error('events: failed to send email', emailError)
          }
        }
      } catch (emailErr) {
        console.error('events: email error', emailErr.message)
      }
    }

    if (body.type === 'swipe' || body.type === 'click') {
      try {
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('name, admin_email')
          .eq('id', body.restaurant_id)
          .single()

        if (restaurant) {
          const restaurantId = body.restaurant_id
          const { data: votes } = await supabase
            .from('events')
            .select('type')
            .eq('restaurant_id', restaurantId)
            .eq('type', 'swipe')

          const swipeCount = votes?.length ?? 0

          if (swipeCount === 5) {
            const safeName = escapeHtml(restaurant.name ?? '')
            const emailRes = await fetch(
              `${Deno.env.get('PUBLIC_SITE_URL') ?? 'http://localhost:3000'}/api/send-email`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: restaurant.admin_email,
                  subject: `🔥 ${safeName} está en racha — 5 swipes`,
                  html: `
                    <h2>¡Tu restaurante está sonando!</h2>
                    <p><strong>${safeName}</strong> ha recibido 5 swipes en DimeSitio.</p>
                    <p>Es una buena señal de los usuarios están interesados.</p>
                  `,
                  type: 'swipe_milestone',
                }),
              }
            )

            if (!emailRes.ok) {
              const emailError = await emailRes.text()
              console.error('events: failed to send milestone email', emailError)
            }
          }
        }
      } catch (emailErr) {
        console.error('events: milestone email error', emailErr.message)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('events: unhandled error', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

if (import.meta.main) {
  serve(handler)
}
export { handler }
