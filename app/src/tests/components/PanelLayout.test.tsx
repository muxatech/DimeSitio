import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import PanelLayout from '@/app/(panel)/layout'

const mockReplace = vi.fn()
const mockUsePathname = vi.fn(() => '/forgot-password')

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => mockUsePathname(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}))

import { supabase } from '@/lib/supabase'

describe('PanelLayout - forgot-password redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue('/forgot-password')
  })

  it('allows /forgot-password without session (no redirect)', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    })

    render(
      <PanelLayout>
        <div>Forgot password content</div>
      </PanelLayout>
    )

    await waitFor(() => {
      expect(screen.getByText('Forgot password content')).toBeInTheDocument()
    })
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('allows /login without session (no redirect)', async () => {
    mockUsePathname.mockReturnValue('/login')
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    })

    render(
      <PanelLayout>
        <div>Login content</div>
      </PanelLayout>
    )

    await waitFor(() => {
      expect(screen.getByText('Login content')).toBeInTheDocument()
    })
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('redirects /dashboard to /login when no session', async () => {
    mockUsePathname.mockReturnValue('/dashboard')
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    })

    render(
      <PanelLayout>
        <div>Dashboard content</div>
      </PanelLayout>
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login')
    })
  })
})
