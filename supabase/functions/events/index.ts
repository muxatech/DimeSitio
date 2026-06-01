import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, x-region',
}

serve(async (req) => {
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
      const msg = 'Missing required field: restaurant_id for type: ' + body.type
      console.error('events: validation failed', msg)
      return new Response(JSON.stringify({ error: msg }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!['start', 'impression', 'selection', 'call'].includes(body.type)) {
      const msg = `Invalid type: ${body.type}`
      console.error('events: validation failed', msg)
      return new Response(JSON.stringify({ error: msg }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const payload = {
      restaurant_id: body.restaurant_id,
      session_id: body.session_id,
      created_at: new Date().toISOString(),
    }

    switch (body.type) {
      case 'start': {
        const { error } = await supabase.from('flow_starts').insert({
          session_id: body.session_id,
          created_at: new Date().toISOString(),
        })
        if (error) {
          console.error('events: start insert failed', JSON.stringify(error))
          throw error
        }
        console.log('events: start inserted', body.session_id)
        break
      }
      case 'impression': {
        const { error } = await supabase.from('impressions').insert(payload)
        if (error) {
          console.error('events: impression insert failed', JSON.stringify(error))
          throw error
        }
        console.log('events: impression inserted', payload.restaurant_id)
        break
      }
      case 'selection': {
        const { error } = await supabase.from('selections').insert({
          ...payload,
          round: body.round ?? 0,
        })
        if (error) {
          console.error('events: selection insert failed', JSON.stringify(error))
          throw error
        }
        console.log('events: selection inserted', payload.restaurant_id, 'round', body.round ?? 0)
        break
      }
      case 'call': {
        const { error } = await supabase.from('calls').insert(payload)
        if (error) {
          console.error('events: call insert failed', JSON.stringify(error))
          throw error
        }
        console.log('events: call inserted', payload.restaurant_id)

        try {
          const { count } = await supabase
            .from('calls')
            .select('*', { count: 'exact', head: true })
            .eq('restaurant_id', payload.restaurant_id)

          if (count === 1) {
            const { data: rName } = await supabase
              .from('restaurants')
              .select('name')
              .eq('id', payload.restaurant_id)
              .single()

            const restaurantName = rName?.name ?? 'tu restaurante'

            const { data: admins } = await supabase
              .from('restaurant_admins')
              .select('user_id')
              .eq('restaurant_id', payload.restaurant_id)
              .limit(1)

            const adminUserId = admins?.[0]?.user_id

            if (adminUserId) {
              const { data: userData } = await supabase.auth.admin.getUserById(adminUserId)
              const ownerEmail = userData?.user?.email
              if (ownerEmail) {
                const fnUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`
                await fetch(fnUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                  },
                  body: JSON.stringify({
                    to: ownerEmail,
                    type: 'first_call',
                    restaurant_id: payload.restaurant_id,
                    subject: '¡Han llamado a tu restaurante desde DimeSitio!',
                    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Primera llamada</title></head>
<body style="margin:0;padding:0;background-color:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafaf9;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" style="max-width:480px;background-color:#fff;border-radius:16px;">
<tr><td style="padding:32px 24px 0;text-align:center;"><h1 style="margin:0;font-size:24px;font-weight:700;color:#1c1917;">DimeSitio</h1></td></tr>
<tr><td style="padding:24px 24px 8px;text-align:center;">
<p style="margin:0;font-size:15px;color:#44403c;line-height:1.5;">¡Buenas noticias!<br/>Alguien ha llamado a <strong>${restaurantName}</strong> desde DimeSitio.</p>
<p style="margin:12px 0 0;font-size:14px;color:#57534e;line-height:1.5;">Tu listado en DimeSitio ya está generando clientes reales. Sigue así.</p>
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
          }
        } catch (emailErr) {
          console.error('events: first-call email failed', emailErr.message)
        }
        break
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
})
