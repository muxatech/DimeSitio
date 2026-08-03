import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'

type Supabase = SupabaseClient<any, any, any, any, any>

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
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

async function getUser(authHeader: string | null, supabase: Supabase) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.replace('Bearer ', '')
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) return null
  return data.user
}

// ─── SigV4 presigning (AWS S3 compatible, R2) ───────────────────────────

const ALLOWED_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp'])
const MAX_FILES = 8
const PRESIGN_EXPIRES = 900
const CACHE_CONTROL = 'public, max-age=31536000, immutable'

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

function encodeRfc3986(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (c) =>
    '%' + c.charCodeAt(0).toString(16).toUpperCase()
  )
}

function canonicalQuery(params: [string, string][]): string {
  return params
    .map(([k, v]) => [encodeRfc3986(k), encodeRfc3986(v)] as [string, string])
    .sort((a, b) =>
      a[0] < b[0] ? -1
      : a[0] > b[0] ? 1
      : a[1] < b[1] ? -1
      : a[1] > b[1] ? 1
      : 0
    )
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
}

export function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hmacSha256(key: BufferSource, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data))
}

async function sha256Hex(data: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))
  return toHex(digest)
}

interface SignOptions {
  method: 'PUT' | 'DELETE'
  key: string
  contentType?: string
}

export async function presignUrl({ method, key, contentType }: SignOptions): Promise<string> {
  const accountId = Deno.env.get('R2_ACCOUNT_ID')
  const accessKeyId = Deno.env.get('R2_ACCESS_KEY_ID')
  const secretAccessKey = Deno.env.get('R2_SECRET_ACCESS_KEY')
  const bucket = Deno.env.get('R2_BUCKET_NAME')
  const region = Deno.env.get('R2_REGION') ?? 'auto'

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error('R2 storage is not configured')
  }

  const host = `${accountId}.r2.cloudflarestorage.com`
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)

  const signedHeaders = method === 'PUT'
    ? ['cache-control', 'content-type', 'host']
    : ['host']

  const headers: Record<string, string> = { host }
  if (method === 'PUT' && contentType) {
    headers['cache-control'] = CACHE_CONTROL
    headers['content-type'] = contentType
  }

  const queryParams: [string, string][] = [
    ['X-Amz-Algorithm', 'AWS4-HMAC-SHA256'],
    ['X-Amz-Credential', `${accessKeyId}/${dateStamp}/${region}/s3/aws4_request`],
    ['X-Amz-Date', amzDate],
    ['X-Amz-Expires', String(PRESIGN_EXPIRES)],
    ['X-Amz-SignedHeaders', signedHeaders.join(';')],
  ]

  const canonicalUri = `/${bucket}/${key}`
  const canonicalHeaders = signedHeaders.map((h) => `${h}:${headers[h]}\n`).join('')
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery(queryParams),
    canonicalHeaders,
    signedHeaders.join(';'),
    'UNSIGNED-PAYLOAD',
  ].join('\n')

  const scope = `${dateStamp}/${region}/s3/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    await sha256Hex(canonicalRequest),
  ].join('\n')

  const kDate = await hmacSha256(new TextEncoder().encode(`AWS4${secretAccessKey}`), dateStamp)
  const kRegion = await hmacSha256(kDate, region)
  const kService = await hmacSha256(kRegion, 's3')
  const kSigning = await hmacSha256(kService, 'aws4_request')
  const signature = toHex(await hmacSha256(kSigning, stringToSign))

  return `https://${host}${canonicalUri}?${canonicalQuery(queryParams)}&X-Amz-Signature=${signature}`
}

// ─── Handlers ────────────────────────────────────────────────────────

function publicBase(): string {
  return (Deno.env.get('R2_PUBLIC_BASE_URL') ?? '').replace(/\/+$/, '')
}

async function handlePresignUpload(body: Record<string, unknown>) {
  const files = body.files
  if (!Array.isArray(files) || files.length < 1 || files.length > MAX_FILES) {
    return fail(`files must be an array with between 1 and ${MAX_FILES} items`)
  }

  const base = publicBase()
  if (!base) return fail('Public base URL is not configured', 500)

  const items: { key: string; uploadUrl: string; publicUrl: string }[] = []
  for (const file of files) {
    const rawExt = String((file as Record<string, unknown>)?.ext ?? '').toLowerCase().replace(/^\./, '')
    if (!ALLOWED_EXTS.has(rawExt)) {
      return fail(`Unsupported file extension: ${rawExt}`)
    }
    const key = `restaurants/${crypto.randomUUID()}/${crypto.randomUUID()}.${rawExt}`
    const uploadUrl = await presignUrl({
      method: 'PUT',
      key,
      contentType: MIME_BY_EXT[rawExt],
    })
    items.push({ key, uploadUrl, publicUrl: `${base}/images/${key}` })
  }

  return ok({ items })
}

async function handlePresignDelete(body: Record<string, unknown>) {
  const keys = body.keys
  if (!Array.isArray(keys) || keys.length < 1 || keys.length > MAX_FILES) {
    return fail(`keys must be an array with between 1 and ${MAX_FILES} items`)
  }

  const items: { key: string; deleteUrl: string }[] = []
  for (const key of keys) {
    if (typeof key !== 'string' || !key.startsWith('restaurants/') || key.includes('..')) {
      return fail('Invalid object key')
    }
    const deleteUrl = await presignUrl({ method: 'DELETE', key })
    items.push({ key, deleteUrl })
  }

  return ok({ items })
}

// ─── Router ───────────────────────────────────────────────────────────

function route(method: string, pathname: string): { handler: string } {
  const path = pathname.replace(/^\/functions\/v1\/photos/, '').replace(/^\/photos/, '') || '/'
  if (method === 'POST' && path === '/presign-upload') return { handler: 'presignUpload' }
  if (method === 'POST' && path === '/presign-delete') return { handler: 'presignDelete' }
  if (method === 'GET' && path === '/health') return { handler: 'health' }
  return { handler: 'notFound' }
}

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const { handler: h } = route(req.method, url.pathname)
    console.log('photos: request', JSON.stringify({ method: req.method, path: url.pathname, handler: h }))

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    switch (h) {
      case 'health':
        return ok({ status: 'ok' })
      case 'presignUpload':
      case 'presignDelete': {
        const user = await getUser(req.headers.get('Authorization'), supabase)
        if (!user) return fail('Unauthorized', 401)
        const body = await req.json().catch(() => ({}))
        return h === 'presignUpload'
          ? await handlePresignUpload(body)
          : await handlePresignDelete(body)
      }
      default:
        return fail('Not found', 404)
    }
  } catch (err) {
    console.error('photos: unhandled error', err instanceof Error ? err.message : String(err))
    return json({ success: false, data: null, error: err instanceof Error ? err.message : 'Internal server error' }, 500)
  }
}

if (import.meta.main) {
  serve(handler)
}
export { handler }
