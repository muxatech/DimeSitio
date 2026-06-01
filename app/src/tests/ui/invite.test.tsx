import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import AuthInvitePage from '@/app/auth/invite/page'

const mockSetSession = vi.fn()
const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

describe('AuthInvitePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.location.hash = ''
  })

  it('shows processing state initially', () => {
    window.location.hash = '#access_token=test&type=invite'
    vi.mock('@/lib/supabase', () => ({
      supabase: { auth: { setSession: mockSetSession } },
    }))
    render(<AuthInvitePage />)
    expect(screen.getByText('Procesando...')).toBeInTheDocument()
  })

  it('shows error when no hash is present', async () => {
    render(<AuthInvitePage />)
    await waitFor(() => {
      expect(screen.getByText('Enlace inválido.')).toBeInTheDocument()
    })
  })

  it('shows error when hash has no access_token', async () => {
    window.location.hash = '#some=value'
    render(<AuthInvitePage />)
    await waitFor(() => {
      expect(screen.getByText('Enlace inválido.')).toBeInTheDocument()
    })
  })

  it('redirects to /set-password on successful invite', async () => {
    window.location.hash = '#access_token=valid-token&refresh_token=valid-refresh&type=invite'
    mockSetSession.mockResolvedValue({ error: null })

    render(<AuthInvitePage />)
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/set-password')
    })
  })

  it('redirects to /dashboard for non-invite type', async () => {
    window.location.hash = '#access_token=valid-token&refresh_token=valid-refresh&type=signup'
    mockSetSession.mockResolvedValue({ error: null })

    render(<AuthInvitePage />)
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows expired link message when error is expired', async () => {
    window.location.hash = '#access_token=expired-token&type=invite'
    mockSetSession.mockResolvedValue({ error: new Error('Token expired') })

    render(<AuthInvitePage />)
    await waitFor(() => {
      expect(screen.getByText(/ha expirado/)).toBeInTheDocument()
    })
  })

  it('shows custom error message for non-expired errors', async () => {
    window.location.hash = '#access_token=bad-token&type=invite'
    mockSetSession.mockResolvedValue({ error: new Error('User not found') })

    render(<AuthInvitePage />)
    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument()
    })
  })
})
