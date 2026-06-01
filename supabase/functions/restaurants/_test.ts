import { assertEquals, assertStringIncludes } from 'jsr:@std/assert'

const env = new Map<string, string>([
  ['SUPABASE_URL', 'http://localhost:54321'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key'],
])

const originalGet = Deno.env.get

Deno.test({
  name: 'restaurants: rejects OPTIONS correctly',
  async fn() {
    Deno.env.get = (key: string) => env.get(key) ?? originalGet(key)
    const mod = await import('./index.ts')
    const handler = mod.handler
    const req = new Request('http://localhost/functions/v1/restaurants', { method: 'OPTIONS' })
    const res = await handler(req)
    assertEquals(res.status, 204)
    Deno.env.get = originalGet
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'restaurants: rejects create without auth',
  async fn() {
    Deno.env.get = (key: string) => env.get(key) ?? originalGet(key)
    const mod = await import('./index.ts')
    const handler = mod.handler
    const req = new Request('http://localhost/functions/v1/restaurants', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', price_level: 2, zone: 'centro' }),
    })
    const res = await handler(req)
    assertEquals(res.status, 401)
    Deno.env.get = originalGet
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'restaurants: rejects invalid method',
  async fn() {
    Deno.env.get = (key: string) => env.get(key) ?? originalGet(key)
    const mod = await import('./index.ts')
    const handler = mod.handler
    const req = new Request('http://localhost/functions/v1/restaurants', { method: 'PUT' })
    const res = await handler(req)
    assertEquals(res.status, 404)
    Deno.env.get = originalGet
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'restaurants: rejects create with missing name',
  async fn() {
    Deno.env.get = (key: string) => env.get(key) ?? originalGet(key)
    const fetchSpy = (() => Promise.resolve(new Response('{"data":null}', { status: 200 }))) as unknown as typeof fetch
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchSpy

    const mod = await import('./index.ts')
    const handler = mod.handler
    const req = new Request('http://localhost/functions/v1/restaurants', {
      method: 'POST',
      headers: { Authorization: 'Bearer mock-token' },
      body: JSON.stringify({ price_level: 2, zone: 'centro' }),
    })
    const res = await handler(req)
    assertEquals(res.status, 400)

    globalThis.fetch = originalFetch
    Deno.env.get = originalGet
  },
  permissions: { env: true, net: true },
})
