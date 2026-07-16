import { describe, it, expect } from 'vitest'

describe('i18n routing', () => {
  it('supports es and en locales', async () => {
    const { routing } = await import('@/i18n/routing')
    expect(routing.locales).toContain('es')
    expect(routing.locales).toContain('en')
  })

  it('has exactly 2 locales', async () => {
    const { routing } = await import('@/i18n/routing')
    expect(routing.locales).toHaveLength(2)
  })

  it('defaults to es', async () => {
    const { routing } = await import('@/i18n/routing')
    expect(routing.defaultLocale).toBe('es')
  })

  it('uses always prefix for SEO equality', async () => {
    const { routing } = await import('@/i18n/routing')
    expect(routing.localePrefix).toBe('always')
  })
})
