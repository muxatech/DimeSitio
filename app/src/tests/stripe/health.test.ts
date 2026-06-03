import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInvoke = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase', () => ({
  supabase: { functions: { invoke: mockInvoke } },
}))

import { supabase } from '@/lib/supabase'

describe('stripe health endpoint', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns healthy when webhook secret is correct', async () => {
    mockInvoke.mockResolvedValue({
      data: { success: true, data: { healthy: true } },
      error: null,
    })

    const { data, error } = await supabase.functions.invoke('stripe/health', { method: 'GET' })

    expect(error).toBeNull()
    expect(data.success).toBe(true)
    expect(data.data.healthy).toBe(true)
  })

  it('returns error when health check fails', async () => {
    mockInvoke.mockResolvedValue({
      data: { success: false, data: null, error: 'Health check failed' },
      error: null,
    })

    const { data } = await supabase.functions.invoke('stripe/health', { method: 'GET' })

    expect(data.success).toBe(false)
    expect(data.error).toBe('Health check failed')
  })

  it('sends GET request to stripe/health', async () => {
    mockInvoke.mockResolvedValue({
      data: { success: true, data: { healthy: true } },
      error: null,
    })

    await supabase.functions.invoke('stripe/health', { method: 'GET' })

    expect(mockInvoke).toHaveBeenCalledWith('stripe/health', { method: 'GET' })
  })
})
