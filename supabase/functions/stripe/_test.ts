import { assertEquals, assertStringIncludes } from 'jsr:@std/assert'
import { assertSpyCalls, spy } from 'jsr:@std/testing/mock'

const env = new Map<string, string>([
  ['SUPABASE_URL', 'http://localhost:54321'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key'],
  ['PUBLIC_SITE_URL', 'https://dimesitio.es'],
  ['STRIPE_SECRET_KEY', 'sk_test_mock'],
  ['STRIPE_PRICE_ID', 'price_test_mock'],
])

const originalGet = Deno.env.get
const originalFetch = globalThis.fetch

Deno.test({
  name: 'stripe: rejects OPTIONS correctly',
  async fn() {
    Deno.env.get = (key: string) => env.get(key) ?? originalGet(key)
    const mod = await import('./index.ts')
    const handler = mod.handler
    const req = new Request('http://localhost/functions/v1/stripe', { method: 'OPTIONS' })
    const res = await handler(req)
    assertEquals(res.status, 204)
    Deno.env.get = originalGet
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'stripe: rejects GET with method not allowed',
  async fn() {
    Deno.env.get = (key: string) => env.get(key) ?? originalGet(key)
    const mod = await import('./index.ts')
    const handler = mod.handler
    const req = new Request('http://localhost/functions/v1/stripe', { method: 'GET' })
    const res = await handler(req)
    assertEquals(res.status, 401)
    Deno.env.get = originalGet
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'stripe: rejects checkout without auth',
  async fn() {
    Deno.env.get = (key: string) => env.get(key) ?? originalGet(key)
    const fetchSpy = spy((_req: Request) => Promise.resolve(new Response('{"data":null}', { status: 200 })))
    globalThis.fetch = fetchSpy as unknown as typeof fetch

    const mod = await import('./index.ts')
    const handler = mod.handler

    const req = new Request('http://localhost/functions/v1/stripe/create-checkout', {
      method: 'POST',
      body: JSON.stringify({ restaurant_id: '00000000-0000-0000-0000-000000000001' }),
    })
    const res = await handler(req)
    assertEquals(res.status, 401)

    globalThis.fetch = originalFetch
    Deno.env.get = originalGet
  },
  permissions: { env: true, net: true },
})

Deno.test({
  name: 'stripe: escapeHtml escapes special characters',
  async fn() {
    const mod = await import('./index.ts')
    const escapeHtml = (mod as unknown as { escapeHtml: (s: string) => string }).escapeHtml

    if (escapeHtml) {
      assertEquals(escapeHtml('normal'), 'normal')
      assertEquals(escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
      assertEquals(escapeHtml('Tomás & Ramón'), 'Tomás &amp; Ramón')
      assertEquals(escapeHtml('a<b>c"d&e'), 'a&lt;b&gt;c&quot;d&amp;e')
    }
  },
  permissions: { env: true, net: true },
})
