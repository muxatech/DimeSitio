import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockRefreshSession, mockInvoke } = vi.hoisted(() => ({
  mockRefreshSession: vi.fn(),
  mockInvoke: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { refreshSession: mockRefreshSession },
    functions: { invoke: mockInvoke },
  },
}))

import { createCheckoutSession, createPortalSession } from '@/lib/panel/api'

describe('stripe API integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRefreshSession.mockResolvedValue({ data: { session: { access_token: 'test-token' } }, error: null })
  })

  describe('createCheckoutSession', () => {
    it('creates a checkout session and returns the URL', async () => {
      mockInvoke.mockResolvedValue({
        data: { success: true, data: { url: 'https://checkout.stripe.com/c/pay_cs_test_123' } },
        error: null,
      })

      const url = await createCheckoutSession('rest-123')

      expect(url).toBe('https://checkout.stripe.com/c/pay_cs_test_123')
      expect(mockInvoke).toHaveBeenCalledWith('stripe/create-checkout', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ restaurant_id: 'rest-123', locale: 'es' }),
      }))
    })

    it('throws when invoke fails', async () => {
      mockInvoke.mockResolvedValue({
        data: null,
        error: { message: 'Stripe error', context: { status: 500 } },
      })

      await expect(createCheckoutSession('rest-123')).rejects.toThrow()
    })
  })

  describe('createPortalSession', () => {
    it('creates a portal session and returns the URL', async () => {
      mockInvoke.mockResolvedValue({
        data: { success: true, data: { url: 'https://billing.stripe.com/p/session_test_456' } },
        error: null,
      })

      const url = await createPortalSession('rest-123')

      expect(url).toBe('https://billing.stripe.com/p/session_test_456')
      expect(mockInvoke).toHaveBeenCalledWith('stripe/create-portal', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ restaurant_id: 'rest-123', locale: 'es' }),
      }))
    })
  })
})
