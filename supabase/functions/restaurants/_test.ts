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

Deno.test({
  name: 'restaurants: isValidPhotoUrl accepts r2.dev photo urls',
  async fn() {
    const mod = await import('./index.ts')
    assertEquals(mod.isValidPhotoUrl('https://bucket.r2.dev/restaurants/a/1.webp'), true)
    assertEquals(mod.isValidPhotoUrl('http://bucket.r2.dev/restaurants/1.webp'), true)
    assertEquals(mod.isValidPhotoUrl('https://sub.bucket.r2.dev/restaurants/x.png'), true)
  },
})

Deno.test({
  name: 'restaurants: isValidPhotoUrl rejects non-r2 hosts and bad paths',
  async fn() {
    const mod = await import('./index.ts')
    assertEquals(mod.isValidPhotoUrl('https://example.com/restaurants/1.webp'), false)
    assertEquals(mod.isValidPhotoUrl('https://bucket.r2.dev/restaurant/1.webp'), false)
    assertEquals(mod.isValidPhotoUrl('https://bucket.r2.dev/other/1.webp'), false)
    assertEquals(mod.isValidPhotoUrl('ftp://bucket.r2.dev/restaurants/1.webp'), false)
    assertEquals(mod.isValidPhotoUrl('https://r2.dev.evil.com/restaurants/1.webp'), false)
  },
})

Deno.test({
  name: 'restaurants: isValidPhotoUrl rejects non-strings, empty and oversized',
  async fn() {
    const mod = await import('./index.ts')
    assertEquals(mod.isValidPhotoUrl(''), false)
    assertEquals(mod.isValidPhotoUrl(42), false)
    assertEquals(mod.isValidPhotoUrl(null), false)
    assertEquals(mod.isValidPhotoUrl('x'.repeat(501)), false)
    assertEquals(mod.isValidPhotoUrl('not a url'), false)
  },
})

Deno.test({
  name: 'restaurants: validatePhotos accepts valid arrays and rejects bad input',
  async fn() {
    const mod = await import('./index.ts')
    const valid = 'https://bucket.r2.dev/restaurants/1.webp'
    assertEquals(mod.validatePhotos([]), null)
    assertEquals(mod.validatePhotos([valid]), null)
    assertEquals(mod.validatePhotos(Array(8).fill(valid)), null)
    assertEquals(mod.validatePhotos('nope'), 'photos must be an array')
    assertEquals(mod.validatePhotos(Array(9).fill(valid)), 'photos must have at most 8 items')
    assertEquals(mod.validatePhotos([valid, 'https://evil.com/x.jpg']), 'photos must contain valid image URLs')
  },
})
