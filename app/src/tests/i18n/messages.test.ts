import { describe, it, expect } from 'vitest'
import es from '../../../messages/es.json'
import en from '../../../messages/en.json'

describe('messages', () => {
  it('es and en have identical top-level keys', () => {
    const esKeys = Object.keys(es).sort()
    const enKeys = Object.keys(en).sort()
    expect(esKeys).toEqual(enKeys)
  })

  it('has Common namespace', () => {
    expect(es).toHaveProperty('Common')
    expect(en).toHaveProperty('Common')
  })

  it('Common.loading is defined in both locales', () => {
    expect((es as any).Common.loading).toBeDefined()
    expect((en as any).Common.loading).toBeDefined()
  })

  it('Common.loading differs between locales (not just copied)', () => {
    expect((es as any).Common.loading).not.toBe((en as any).Common.loading)
  })

  it('every es key has a corresponding en key (recursive)', () => {
    function getLeafKeys(obj: Record<string, any>, prefix = ''): string[] {
      return Object.entries(obj).flatMap(([key, val]) => {
        const path = prefix ? `${prefix}.${key}` : key
        if (typeof val === 'object' && val !== null) {
          return getLeafKeys(val, path)
        }
        return [path]
      })
    }

    const esLeaves = getLeafKeys(es as Record<string, any>)
    const enLeaves = getLeafKeys(en as Record<string, any>)

    const missingInEn = esLeaves.filter((k) => !enLeaves.includes(k))
    const missingInEs = enLeaves.filter((k) => !esLeaves.includes(k))

    expect(missingInEn).toEqual([])
    expect(missingInEs).toEqual([])
  })
})
