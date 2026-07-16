import { describe, it, expect } from 'vitest'

describe('i18n/request config', () => {
  it('exports a default function', async () => {
    const mod = await import('@/i18n/request')
    expect(typeof mod.default).toBe('function')
  })
})
