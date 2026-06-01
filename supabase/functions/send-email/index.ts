import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { Resend } from 'npm:resend@4'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM = Deno.env.get('RESEND_FROM') ?? 'DimeSitio <dimesitio@resend.dev>'

const resend = new Resend(RESEND_API_KEY)

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

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (token !== serviceRoleKey) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      serviceRoleKey!
    )

    const body = await req.json()
    const { to, subject, html, type, restaurant_id } = body

    if (!to || !subject || !html || !type) {
      return json({ error: 'Missing required fields: to, subject, html, type' }, 400)
    }

    const { data, error: sendError } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject,
      html,
    })

    const status = sendError ? 'failed' : 'sent'

    await supabase.from('email_logs').insert({
      to_email: to,
      type,
      restaurant_id: restaurant_id ?? null,
      status,
      error: sendError?.message ?? null,
    })

    if (sendError) {
      console.error('send-email: resend error', JSON.stringify(sendError))
      return json({ error: sendError.message }, 500)
    }

    console.log('send-email: sent', JSON.stringify({ type, to, id: data?.id }))
    return json({ success: true, id: data?.id })
  } catch (err) {
    console.error('send-email: unhandled error', err.message)
    return json({ error: err.message }, 500)
  }
}

if (import.meta.main) {
  serve(handler)
}
export { handler }
