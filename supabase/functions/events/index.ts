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
