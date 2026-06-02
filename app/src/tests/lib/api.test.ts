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

import { getMyRestaurants } from '@/lib/panel/api'

describe('api - session expiry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getMyRestaurants throws No hay sesión activa when no session', async () => {
    mockRefreshSession.mockResolvedValue({ data: { session: null }, error: null })
    await expect(getMyRestaurants()).rejects.toThrow('No hay sesión activa')
    expect(mockInvoke).not.toHaveBeenCalled()
  })

  it('getMyRestaurants calls invoke when session exists', async () => {
    mockRefreshSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
      error: null,
    })
    mockInvoke.mockResolvedValue({ data: [], error: null })
    const result = await getMyRestaurants()
    expect(result).toEqual([])
    expect(mockInvoke).toHaveBeenCalled()
  })
})
