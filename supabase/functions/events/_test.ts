import { assertEquals, assertStringIncludes } from 'jsr:@std/assert'
import { assertSpyCalls, spy } from 'jsr:@std/testing/mock'

const env = new Map<string, string>([
  ['SUPABASE_URL', 'http://localhost:54321'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key'],
  ['PUBLIC_SITE_URL', 'https://dimesitio.es'],
])

const originalGet = Deno.env.get
const originalFetch = globalThis.fetch

Deno.test({
  name: 'events: rejects missing type and session_id',
  async fn() {
    Deno.env.get = (key: string) => env.get(key) ?? originalGet(key)
    const fetchSpy = spy(() => Promise.resolve(new Response('{}', { status: 200 })))
    globalThis.fetch = fetchSpy as unknown as typeof fetch

    const mod = await import('./index.ts')
    const handler = mod.handler

    const req = new Request('http://localhost/functions/v1/events', {
      method: 'POST',
      body: JSON.stringify({}),
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

Deno.test({
  name: 'events: rejects invalid event type',
  async fn() {
    Deno.env.get = (key: string) => env.get(key) ?? originalGet(key)
    const fetchSpy = spy(() => Promise.resolve(new Response('{}', { status: 200 })))
    globalThis.fetch = fetchSpy as unknown as typeof fetch

    const mod = await import('./index.ts')
    const handler = mod.handler

    const req = new Request('http://localhost/functions/v1/events', {
      method: 'POST',
      body: JSON.stringify({ type: 'invalid', session_id: 'sess-1', restaurant_id: '00000000-0000-0000-0000-000000000001' }),
    })
    const res = await handler(req)
    assertEquals(res.status, 400)
    const body = await res.json()
    assertStringIncludes(body.error, 'Invalid type')

    globalThis.fetch = originalFetch
    Deno.env.get = originalGet
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'events: rejects invalid UUID format',
  async fn() {
    Deno.env.get = (key: string) => env.get(key) ?? originalGet(key)
    const fetchSpy = spy(() => Promise.resolve(new Response('{}', { status: 200 })))
    globalThis.fetch = fetchSpy as unknown as typeof fetch

    const mod = await import('./index.ts')
    const handler = mod.handler

    const req = new Request('http://localhost/functions/v1/events', {
      method: 'POST',
      body: JSON.stringify({ type: 'impression', session_id: 'sess-1', restaurant_id: 'not-a-uuid' }),
    })
    const res = await handler(req)
    assertEquals(res.status, 400)
    const body = await res.json()
    assertStringIncludes(body.error, 'Invalid restaurant_id format')

    globalThis.fetch = originalFetch
    Deno.env.get = originalGet
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'events: requires restaurant_id for non-start types',
  async fn() {
    Deno.env.get = (key: string) => env.get(key) ?? originalGet(key)
    const fetchSpy = spy(() => Promise.resolve(new Response('{}', { status: 200 })))
    globalThis.fetch = fetchSpy as unknown as typeof fetch

    const mod = await import('./index.ts')
    const handler = mod.handler

    const req = new Request('http://localhost/functions/v1/events', {
      method: 'POST',
      body: JSON.stringify({ type: 'impression', session_id: 'sess-1' }),
    })
    const res = await handler(req)
    assertEquals(res.status, 400)
    const body = await res.json()
    assertStringIncludes(body.error, 'Missing required field: restaurant_id')

    globalThis.fetch = originalFetch
    Deno.env.get = originalGet
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'events: accepts start type without restaurant_id',
  async fn() {
    Deno.env.get = (key: string) => env.get(key) ?? originalGet(key)
    const fetchSpy = spy((_req: Request) => Promise.resolve(new Response('{}', { status: 200 })))
    globalThis.fetch = fetchSpy as unknown as typeof fetch

    const mod = await import('./index.ts')
    const handler = mod.handler

    const req = new Request('http://localhost/functions/v1/events', {
      method: 'POST',
      body: JSON.stringify({ type: 'start', session_id: 'sess-1' }),
    })
    const res = await handler(req)
    assertEquals(res.status, 200)
    assertSpyCalls(fetchSpy, 1)

    globalThis.fetch = originalFetch
    Deno.env.get = originalGet
  },
  permissions: { env: true, net: true },
})
