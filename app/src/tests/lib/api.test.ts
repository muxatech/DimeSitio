import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockGetSession, mockRefreshSession, mockInvoke } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockRefreshSession: vi.fn(),
  mockInvoke: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getSession: mockGetSession, refreshSession: mockRefreshSession },
    functions: { invoke: mockInvoke },
  },
}))

import { getMyRestaurants } from '@/lib/panel/api'

describe('api - session expiry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getMyRestaurants throws No hay sesión activa when no session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    await expect(getMyRestaurants()).rejects.toThrow('No hay sesión activa')
    expect(mockInvoke).not.toHaveBeenCalled()
  })

  it('getMyRestaurants calls invoke when session exists', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { access_token: 'test-token' } } })
    mockInvoke.mockResolvedValue({ data: { success: true, data: [] }, error: null })
    const result = await getMyRestaurants()
    expect(result).toEqual([])
    expect(mockInvoke).toHaveBeenCalled()
  })

  it('retries with refreshed token on 401', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { access_token: 'stale-token' } } })
    mockRefreshSession.mockResolvedValue({
      data: { session: { access_token: 'fresh-token' } },
      error: null,
    })
    mockInvoke
      .mockResolvedValueOnce({ data: null, error: { message: 'Unauthorized' } })
      .mockResolvedValueOnce({ data: { success: true, data: [] }, error: null })

    const result = await getMyRestaurants()
    expect(result).toEqual([])
    expect(mockInvoke).toHaveBeenCalledTimes(2)
    expect(mockInvoke.mock.calls[0][1]!.headers.Authorization).toBe('Bearer stale-token')
    expect(mockInvoke.mock.calls[1][1]!.headers.Authorization).toBe('Bearer fresh-token')
  })
})
