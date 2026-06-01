import { assertEquals, assertStringIncludes } from 'jsr:@std/assert'
import { assertSpyCalls, spy } from 'jsr:@std/testing/mock'

const env = new Map<string, string>([
  ['SUPABASE_URL', 'http://localhost:54321'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key'],
  ['RESEND_API_KEY', 're_test_mock'],
  ['RESEND_FROM', 'DimeSitio <test@dimesitio.es>'],
])

const originalGet = Deno.env.get
const originalFetch = globalThis.fetch

Deno.test({
  name: 'send-email: rejects OPTIONS correctly',
  async fn() {
    Deno.env.get = (key: string) => env.get(key) ?? originalGet(key)
    const mod = await import('./index.ts')
    const handler = mod.handler
    const req = new Request('http://localhost/functions/v1/send-email', { method: 'OPTIONS' })
    const res = await handler(req)
    assertEquals(res.status, 204)
    Deno.env.get = originalGet
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'send-email: rejects GET with method not allowed',
  async fn() {
    Deno.env.get = (key: string) => env.get(key) ?? originalGet(key)
    const mod = await import('./index.ts')
    const handler = mod.handler
    const req = new Request('http://localhost/functions/v1/send-email', { method: 'GET' })
    const res = await handler(req)
    assertEquals(res.status, 405)
    Deno.env.get = originalGet
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'send-email: rejects request without auth header',
  async fn() {
    Deno.env.get = (key: string) => env.get(key) ?? originalGet(key)
    const mod = await import('./index.ts')
    const handler = mod.handler
    const req = new Request('http://localhost/functions/v1/send-email', {
      method: 'POST',
      body: JSON.stringify({ to: 'test@test.com', subject: 'test', html: '<p>test</p>', type: 'test' }),
    })
    const res = await handler(req)
    assertEquals(res.status, 401)
    Deno.env.get = originalGet
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'send-email: rejects request with wrong bearer token',
  async fn() {
    Deno.env.get = (key: string) => env.get(key) ?? originalGet(key)
    const mod = await import('./index.ts')
    const handler = mod.handler
    const req = new Request('http://localhost/functions/v1/send-email', {
      method: 'POST',
      headers: { Authorization: 'Bearer wrong-token' },
      body: JSON.stringify({ to: 'test@test.com', subject: 'test', html: '<p>test</p>', type: 'test' }),
    })
    const res = await handler(req)
    assertEquals(res.status, 401)
    Deno.env.get = originalGet
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'send-email: rejects missing required fields',
  async fn() {
    Deno.env.get = (key: string) => env.get(key) ?? originalGet(key)
    const fetchSpy = spy((_req: Request) => Promise.resolve(new Response('{}', { status: 200 })))
    globalThis.fetch = fetchSpy as unknown as typeof fetch

    const mod = await import('./index.ts')
    const handler = mod.handler
    const req = new Request('http://localhost/functions/v1/send-email', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.get('SUPABASE_SERVICE_ROLE_KEY')}` },
      body: JSON.stringify({ subject: 'test', html: '<p>test</p>', type: 'test' }),
    })
    const res = await handler(req)
    assertEquals(res.status, 400)
    const body = await res.json()
    assertStringIncludes(body.error, 'Missing required fields')

    globalThis.fetch = originalFetch
    Deno.env.get = originalGet
  },
  permissions: { env: true, net: true },
})
