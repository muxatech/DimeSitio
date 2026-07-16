import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import AuthInvitePage from '@/app/[locale]/auth/invite/page'
import { TestWrapper } from '../helpers'

const mockSetSession = vi.fn()
const mockReplace = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { setSession: (...args: unknown[]) => mockSetSession(...args) } },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

describe('AuthInvitePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.location.hash = ''
  })

  it('shows processing state in Spanish', () => {
    window.location.hash = '#access_token=test&type=invite'
    mockSetSession.mockResolvedValue({ error: null })
    render(<AuthInvitePage />, { wrapper: TestWrapper })
    expect(screen.getByText('Procesando...')).toBeInTheDocument()
  })

  it('shows processing state in English', () => {
    window.location.hash = '#access_token=test&type=invite'
    mockSetSession.mockResolvedValue({ error: null })
    render(<AuthInvitePage />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
    expect(screen.getByText('Processing...')).toBeInTheDocument()
  })

  it('shows error when no hash is present (Spanish)', async () => {
    render(<AuthInvitePage />, { wrapper: TestWrapper })
    await waitFor(() => {
      expect(screen.getByText('Enlace inválido.')).toBeInTheDocument()
    })
  })

  it('shows error when no hash is present (English)', async () => {
    render(<AuthInvitePage />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
    await waitFor(() => {
      expect(screen.getByText('Invalid link.')).toBeInTheDocument()
    })
  })

  it('shows error when hash has no access_token', async () => {
    window.location.hash = '#some=value'
    render(<AuthInvitePage />, { wrapper: TestWrapper })
    await waitFor(() => {
      expect(screen.getByText('Enlace inválido.')).toBeInTheDocument()
    })
  })

  it('redirects to /set-password on successful invite', async () => {
    window.location.hash = '#access_token=valid-token&refresh_token=valid-refresh&type=invite'
    mockSetSession.mockResolvedValue({ error: null })

    render(<AuthInvitePage />, { wrapper: TestWrapper })
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/set-password')
    })
  })

  it('redirects to /dashboard for non-invite type', async () => {
    window.location.hash = '#access_token=valid-token&refresh_token=valid-refresh&type=signup'
    mockSetSession.mockResolvedValue({ error: null })

    render(<AuthInvitePage />, { wrapper: TestWrapper })
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows expired link message (Spanish)', async () => {
    window.location.hash = '#access_token=expired-token&type=invite'
    mockSetSession.mockResolvedValue({ error: new Error('Token expired') })

    render(<AuthInvitePage />, { wrapper: TestWrapper })
    await waitFor(() => {
      expect(screen.getByText(/ha expirado/)).toBeInTheDocument()
    })
  })

  it('shows expired link message (English)', async () => {
    window.location.hash = '#access_token=expired-token&type=invite'
    mockSetSession.mockResolvedValue({ error: new Error('Token expired') })

    render(<AuthInvitePage />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
    await waitFor(() => {
      expect(screen.getByText(/expired/i)).toBeInTheDocument()
    })
  })

  it('shows custom error message for non-expired errors', async () => {
    window.location.hash = '#access_token=bad-token&type=invite'
    mockSetSession.mockResolvedValue({ error: new Error('User not found') })

    render(<AuthInvitePage />, { wrapper: TestWrapper })
    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument()
    })
  })
})
