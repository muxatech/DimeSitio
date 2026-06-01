import { describe, it, expect, vi, beforeEach } from 'vitest'
import { trackStart, trackImpression, trackSelection, trackCall } from '@/lib/tracking'

const mockInvoke = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
  },
}))

describe('tracking', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it('trackStart invokes events with type=start', async () => {
    mockInvoke.mockResolvedValueOnce({ error: null })
    await trackStart('session-1')
    expect(mockInvoke).toHaveBeenCalledWith('events', {
      body: { type: 'start', session_id: 'session-1' },
    })
  })

  it('trackImpression invokes events with type=impression', async () => {
    mockInvoke.mockResolvedValueOnce({ error: null })
    await trackImpression('rest-1', 'session-1')
    expect(mockInvoke).toHaveBeenCalledWith('events', {
      body: { type: 'impression', restaurant_id: 'rest-1', session_id: 'session-1' },
    })
  })

  it('trackSelection invokes events with type=selection and round', async () => {
    mockInvoke.mockResolvedValueOnce({ error: null })
    await trackSelection('rest-1', 'session-1', 2)
    expect(mockInvoke).toHaveBeenCalledWith('events', {
      body: { type: 'selection', restaurant_id: 'rest-1', session_id: 'session-1', round: 2 },
    })
  })

  it('trackCall invokes events with type=call', async () => {
    mockInvoke.mockResolvedValueOnce({ error: null })
    await trackCall('rest-1', 'session-1')
    expect(mockInvoke).toHaveBeenCalledWith('events', {
      body: { type: 'call', restaurant_id: 'rest-1', session_id: 'session-1' },
    })
  })

  it('does not throw when invoke returns error object', async () => {
    mockInvoke.mockResolvedValueOnce({ error: new Error('api error') })
    await expect(trackStart('session-1')).resolves.toBeUndefined()
  })
})
