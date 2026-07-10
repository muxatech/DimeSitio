import { describe, it, expect, beforeEach } from 'vitest'
import { shuffle, getSessionId, getPriceLabel, cn, haversineDistance, normalizeInstagramUrl } from '@/lib/utils'

describe('shuffle', () => {
  it('returns an array of the same length', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input)
    expect(result).toHaveLength(input.length)
  })

  it('does not mutate the original array', () => {
    const input = [1, 2, 3, 4, 5]
    const copy = [...input]
    shuffle(input)
    expect(input).toEqual(copy)
  })

  it('contains the same elements after shuffling', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input)
    expect(result.sort()).toEqual(input.sort())
  })
})

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b', false && 'c', null, undefined, 'd')).toBe('a b d')
  })

  it('returns empty string for no classes', () => {
    expect(cn()).toBe('')
  })
})

describe('getSessionId', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('returns a string', () => {
    const id = getSessionId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('returns the same value on consecutive calls', () => {
    const a = getSessionId()
    const b = getSessionId()
    expect(a).toBe(b)
  })

  it('stores the id in sessionStorage', () => {
    const id = getSessionId()
    expect(sessionStorage.getItem('dimesitio_session')).toBe(id)
  })

  it('returns empty string when window is undefined', () => {
    const win = globalThis.window
    // @ts-expect-error testing server-side
    delete globalThis.window
    expect(getSessionId()).toBe('')
    globalThis.window = win
  })
})

describe('haversineDistance', () => {
  it('returns 0 for the same point', () => {
    expect(haversineDistance(39.4699, -0.3763, 39.4699, -0.3763)).toBe(0)
  })

  it('returns ~2km from Valencia center to Ruzafa', () => {
    const dist = haversineDistance(39.4699, -0.3763, 39.4575, -0.3682)
    expect(dist).toBeGreaterThan(1000)
    expect(dist).toBeLessThan(3000)
  })

  it('returns ~350km from Valencia to Madrid', () => {
    const dist = haversineDistance(39.4699, -0.3763, 40.4168, -3.7038)
    expect(dist).toBeGreaterThan(300000)
    expect(dist).toBeLessThan(400000)
  })

  it('is symmetric (A→B equals B→A)', () => {
    const a = haversineDistance(39.4699, -0.3763, 41.3851, 2.1734)
    const b = haversineDistance(41.3851, 2.1734, 39.4699, -0.3763)
    expect(a).toBeCloseTo(b, 6)
  })
})

describe('getPriceLabel', () => {
  it('returns correct label for level 1', () => {
    expect(getPriceLabel(1)).toBe('€')
  })

  it('returns correct label for level 2', () => {
    expect(getPriceLabel(2)).toBe('€€')
  })

  it('returns correct label for level 3', () => {
    expect(getPriceLabel(3)).toBe('€€€')
  })
})

describe('normalizeInstagramUrl', () => {
  it('converts @handle to full URL', () => {
    expect(normalizeInstagramUrl('@usuario')).toBe('https://instagram.com/usuario')
  })

  it('leaves https://instagram.com/handle unchanged', () => {
    expect(normalizeInstagramUrl('https://instagram.com/usuario')).toBe('https://instagram.com/usuario')
  })

  it('leaves http://instagram.com/handle unchanged', () => {
    expect(normalizeInstagramUrl('http://instagram.com/usuario')).toBe('http://instagram.com/usuario')
  })

  it('adds https:// to instagram.com/handle without protocol', () => {
    expect(normalizeInstagramUrl('instagram.com/usuario')).toBe('https://instagram.com/usuario')
  })

  it('trims whitespace before normalizing @handle', () => {
    expect(normalizeInstagramUrl('  @usuario  ')).toBe('https://instagram.com/usuario')
  })

  it('returns empty string for empty input', () => {
    expect(normalizeInstagramUrl('')).toBe('')
  })

  it('handles @handle with no prefix (just handle)', () => {
    expect(normalizeInstagramUrl('usuario')).toBe('https://instagram.com/usuario')
  })

  it('handles whitespace-only input', () => {
    expect(normalizeInstagramUrl('   ')).toBe('')
  })

  it('passes through non-Instagram URL with protocol', () => {
    expect(normalizeInstagramUrl('https://google.com')).toBe('https://google.com')
  })

  it('passes through http non-Instagram URL', () => {
    expect(normalizeInstagramUrl('http://example.com/page')).toBe('http://example.com/page')
  })

  it('does not double-wrap a URL that happens to contain instagram', () => {
    expect(normalizeInstagramUrl('https://evilsite.com/instagram.com')).toBe('https://evilsite.com/instagram.com')
  })

  it('adds https:// to www.instagram.com/handle', () => {
    expect(normalizeInstagramUrl('www.instagram.com/usuario')).toBe('https://www.instagram.com/usuario')
  })
})
