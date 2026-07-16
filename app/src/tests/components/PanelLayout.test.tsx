import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import PanelLayout from '@/app/[locale]/(panel)/layout'
import { TestWrapper } from '@/tests/helpers'

const mockReplace = vi.fn()
const mockUsePathname = vi.fn(() => '/forgot-password')

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => mockUsePathname(),
}))

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => mockUsePathname(),
  Link: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => <a href={href} {...props}>{children}</a>,
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: Record<string, unknown>) => (
    <a href={href as string} {...props}>{children}</a>
  ),
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
      </PanelLayout>,
      { wrapper: TestWrapper }
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
      </PanelLayout>,
      { wrapper: TestWrapper }
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
      </PanelLayout>,
      { wrapper: TestWrapper }
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login')
    })
  })
})
