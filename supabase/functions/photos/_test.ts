import { assertEquals } from 'jsr:@std/assert'

const env = new Map<string, string>([
  ['SUPABASE_URL', 'http://localhost:54321'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key'],
  ['R2_ACCOUNT_ID', 'test-account'],
  ['R2_ACCESS_KEY_ID', 'test-access-key'],
  ['R2_SECRET_ACCESS_KEY', 'test-secret-key'],
  ['R2_BUCKET_NAME', 'test-bucket'],
  ['R2_PUBLIC_BASE_URL', 'https://dimesitio.es'],
])

const originalGet = Deno.env.get
const originalFetch = globalThis.fetch

function withEnv<T>(fn: () => Promise<T>): Promise<T> {
  Deno.env.get = (key: string) => env.get(key) ?? originalGet(key)
  return fn().finally(() => {
    Deno.env.get = originalGet
    globalThis.fetch = originalFetch
  })
}

function mockAuthFetch() {
  globalThis.fetch = (() => Promise.resolve(
    new Response(JSON.stringify({ id: 'u1', aud: 'authenticated', role: 'authenticated' }), { status: 200 })
  )) as unknown as typeof fetch
}

Deno.test({
  name: 'photos: rejects OPTIONS correctly',
  async fn() {
    await withEnv(async () => {
      const mod = await import('./index.ts')
      const req = new Request('http://localhost/functions/v1/photos', { method: 'OPTIONS' })
      const res = await mod.handler(req)
      assertEquals(res.status, 204)
    })
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'photos: rejects presign-upload without auth',
  async fn() {
    await withEnv(async () => {
      const mod = await import('./index.ts')
      const req = new Request('http://localhost/functions/v1/photos/presign-upload', {
        method: 'POST',
        body: JSON.stringify({ files: [{ ext: 'webp' }] }),
      })
      const res = await mod.handler(req)
      assertEquals(res.status, 401)
    })
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'photos: rejects invalid method',
  async fn() {
    await withEnv(async () => {
      const mod = await import('./index.ts')
      const req = new Request('http://localhost/functions/v1/photos', { method: 'PUT' })
      const res = await mod.handler(req)
      assertEquals(res.status, 404)
    })
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'photos: rejects unsupported file extension',
  async fn() {
    await withEnv(async () => {
      mockAuthFetch()
      const mod = await import('./index.ts')
      const req = new Request('http://localhost/functions/v1/photos/presign-upload', {
        method: 'POST',
        headers: { Authorization: 'Bearer mock-token' },
        body: JSON.stringify({ files: [{ ext: 'gif' }] }),
      })
      const res = await mod.handler(req)
      assertEquals(res.status, 400)
    })
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'photos: rejects too many files',
  async fn() {
    await withEnv(async () => {
      mockAuthFetch()
      const mod = await import('./index.ts')
      const files = Array.from({ length: 9 }, () => ({ ext: 'webp' }))
      const req = new Request('http://localhost/functions/v1/photos/presign-upload', {
        method: 'POST',
        headers: { Authorization: 'Bearer mock-token' },
        body: JSON.stringify({ files }),
      })
      const res = await mod.handler(req)
      assertEquals(res.status, 400)
    })
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'photos: builds upload urls for valid request',
  async fn() {
    await withEnv(async () => {
      mockAuthFetch()
      const mod = await import('./index.ts')
      const req = new Request('http://localhost/functions/v1/photos/presign-upload', {
        method: 'POST',
        headers: { Authorization: 'Bearer mock-token' },
        body: JSON.stringify({ files: [{ ext: 'webp' }, { ext: 'jpg' }] }),
      })
      const res = await mod.handler(req)
      assertEquals(res.status, 200)
      const body = await res.json()
      assertEquals(body.success, true)
      assertEquals(body.data.items.length, 2)
      for (const item of body.data.items) {
        assertEquals(typeof item.key, 'string')
        assertEquals(item.key.startsWith('restaurants/'), true)
        assertEquals(item.key.endsWith('.webp') || item.key.endsWith('.jpg'), true)
        assertEquals(item.publicUrl, `https://dimesitio.es/images/${item.key}`)
        assertEquals(item.uploadUrl.includes('X-Amz-Signature='), true)
        assertEquals(item.uploadUrl.startsWith('https://test-account.r2.cloudflarestorage.com/test-bucket/restaurants/'), true)
      }
    })
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'photos: signing key derivation matches AWS test vector',
  async fn() {
    const { hmacSha256, toHex } = await import('./index.ts')
    const secret = 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY'
    const date = '20150830'
    const region = 'us-east-1'
    const service = 'iam'

    const kDate = await hmacSha256(new TextEncoder().encode(`AWS4${secret}`), date)
    const kRegion = await hmacSha256(kDate, region)
    const kService = await hmacSha256(kRegion, service)
    const kSigning = await hmacSha256(kService, 'aws4_request')

    assertEquals(
      toHex(kSigning),
      'c4afb1cc5771d871763a393e44b703571b55cc28424d1a5e86da6ed3c154a4b9'
    )
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'photos: rejects invalid delete keys',
  async fn() {
    await withEnv(async () => {
      mockAuthFetch()
      const mod = await import('./index.ts')
      const req = new Request('http://localhost/functions/v1/photos/presign-delete', {
        method: 'POST',
        headers: { Authorization: 'Bearer mock-token' },
        body: JSON.stringify({ keys: ['../../etc/passwd'] }),
      })
      const res = await mod.handler(req)
      assertEquals(res.status, 400)
    })
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'photos: builds delete urls for valid keys',
  async fn() {
    await withEnv(async () => {
      mockAuthFetch()
      const mod = await import('./index.ts')
      const req = new Request('http://localhost/functions/v1/photos/presign-delete', {
        method: 'POST',
        headers: { Authorization: 'Bearer mock-token' },
        body: JSON.stringify({ keys: ['restaurants/abc/def.webp'] }),
      })
      const res = await mod.handler(req)
      assertEquals(res.status, 200)
      const body = await res.json()
      assertEquals(body.success, true)
      assertEquals(body.data.items.length, 1)
      assertEquals(body.data.items[0].deleteUrl.includes('X-Amz-Signature='), true)
    })
  },
  permissions: { env: true, net: true },
})
