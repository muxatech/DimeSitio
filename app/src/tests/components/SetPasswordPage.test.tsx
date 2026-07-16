import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import SetPasswordPage from '@/app/[locale]/(panel)/set-password/page'
import { TestWrapper } from '../helpers'

const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  Link: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => <a href={href} {...props}>{children}</a>,
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}))

import { supabase } from '@/lib/supabase'

describe('SetPasswordPage - blank page fix', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows spinner while loading session', () => {
    vi.mocked(supabase.auth.getSession).mockReturnValue(new Promise(() => {}))
    render(<SetPasswordPage />, { wrapper: TestWrapper })
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows spinner when session is null (prevents blank page)', () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    })
    render(<SetPasswordPage />, { wrapper: TestWrapper })
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    expect(screen.queryByText('Establece tu contraseña')).not.toBeInTheDocument()
  })

  it('shows password form in Spanish when session exists', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: { email: 'test@test.com' } } },
      error: null,
    })
    render(<SetPasswordPage />, { wrapper: TestWrapper })
    expect(await screen.findByText('Establece tu contraseña')).toBeInTheDocument()
  })

  it('shows password form in English when session exists', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: { email: 'test@test.com' } } },
      error: null,
    })
    render(<SetPasswordPage />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
    expect(await screen.findByText('Set your password')).toBeInTheDocument()
  })
})
