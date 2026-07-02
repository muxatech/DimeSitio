import { describe, it, expect } from 'vitest'
import { QUESTIONS } from '@/lib/constants'

describe('QUESTIONS', () => {
  it('has 3 questions', () => {
    expect(QUESTIONS).toHaveLength(3)
  })

  it('first question is categories', () => {
    expect(QUESTIONS[0].key).toBe('categories')
  })

  it('second question is price', () => {
    expect(QUESTIONS[1].key).toBe('price')
  })

  it('third question is location', () => {
    expect(QUESTIONS[2].key).toBe('location')
  })
})
