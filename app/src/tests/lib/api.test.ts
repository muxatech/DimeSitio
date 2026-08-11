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

import { getMyRestaurants, getUploadUrls, getDeleteUrls } from '@/lib/panel/api'
import { NO_SESSION_ERROR } from '@/lib/constants'

describe('api - session expiry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getMyRestaurants throws NO_SESSION when no session', async () => {
    mockRefreshSession.mockResolvedValue({ data: { session: null }, error: null })
    await expect(getMyRestaurants()).rejects.toThrow(NO_SESSION_ERROR)
    expect(mockInvoke).not.toHaveBeenCalled()
  })

  it('getMyRestaurants calls invoke when session exists', async () => {
    mockRefreshSession.mockResolvedValue({ data: { session: { access_token: 'test-token' } }, error: null })
    mockInvoke.mockResolvedValue({ data: { success: true, data: [] }, error: null })
    const result = await getMyRestaurants()
    expect(result).toEqual([])
    expect(mockInvoke).toHaveBeenCalled()
  })

  it('retries with refreshed token on 401', async () => {
    mockRefreshSession
      .mockResolvedValueOnce({ data: { session: { access_token: 'stale-token' } }, error: null })
      .mockResolvedValueOnce({ data: { session: { access_token: 'fresh-token' } }, error: null })
    mockInvoke
      .mockResolvedValueOnce({
        data: null,
        error: { message: '{"error":"Unauthorized"}', context: { status: 401 } },
      })
      .mockResolvedValueOnce({ data: { success: true, data: [] }, error: null })

    const result = await getMyRestaurants()
    expect(result).toEqual([])
    expect(mockInvoke).toHaveBeenCalledTimes(2)
    expect(mockInvoke.mock.calls[0][1]!.headers.Authorization).toBe('Bearer stale-token')
    expect(mockInvoke.mock.calls[1][1]!.headers.Authorization).toBe('Bearer fresh-token')
  })
})

describe('api - photos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRefreshSession.mockResolvedValue({ data: { session: { access_token: 'test-token' } }, error: null })
  })

  it('getUploadUrls posts files to the photos presign-upload endpoint', async () => {
    mockInvoke.mockResolvedValue({
      data: {
        success: true,
        data: {
          items: [
            { key: 'restaurants/x.webp', uploadUrl: 'https://upload.example/x', publicUrl: 'https://r2.example/restaurants/x.webp' },
          ],
        },
      },
      error: null,
    })

    const items = await getUploadUrls([{ ext: 'webp' }])
    expect(items).toEqual([
      { key: 'restaurants/x.webp', uploadUrl: 'https://upload.example/x', publicUrl: 'https://r2.example/restaurants/x.webp' },
    ])
    expect(mockInvoke).toHaveBeenCalledWith(
      'photos/presign-upload',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer test-token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: [{ ext: 'webp' }] }),
      })
    )
  })

  it('getDeleteUrls posts keys to the photos presign-delete endpoint', async () => {
    mockInvoke.mockResolvedValue({
      data: {
        success: true,
        data: { items: [{ key: 'restaurants/a.webp', deleteUrl: 'https://delete.example/a' }] },
      },
      error: null,
    })

    const items = await getDeleteUrls(['restaurants/a.webp'])
    expect(items).toEqual([{ key: 'restaurants/a.webp', deleteUrl: 'https://delete.example/a' }])
    expect(mockInvoke).toHaveBeenCalledWith(
      'photos/presign-delete',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer test-token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: ['restaurants/a.webp'] }),
      })
    )
  })

  it('getUploadUrls propagates invoke errors', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'ups', context: { status: 500 } } })
    await expect(getUploadUrls([{ ext: 'webp' }])).rejects.toThrow('ups')
  })

  it('getDeleteUrls propagates invoke errors', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'ups', context: { status: 500 } } })
    await expect(getDeleteUrls(['restaurants/a.webp'])).rejects.toThrow('ups')
  })
})
