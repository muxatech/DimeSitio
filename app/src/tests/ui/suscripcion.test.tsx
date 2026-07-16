import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SuscripcionPage from '@/app/[locale]/(panel)/suscripcion/page'
import { TestWrapper } from '../helpers'

const mockCreateCheckout = vi.fn()
const mockCreatePortal = vi.fn()
const mockReplace = vi.fn()

vi.mock('@/lib/panel/api', () => ({
  getMyRestaurants: vi.fn(),
  createCheckoutSession: (...args: unknown[]) => mockCreateCheckout(...args),
  createPortalSession: (...args: unknown[]) => mockCreatePortal(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  Link: ({ children, href }: React.PropsWithChildren<{ href: string }>) => <a href={href}>{children}</a>,
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <button {...props}>{children}</button>,
  },
}))

import { useQuery } from '@tanstack/react-query'

function mockQuery(data: unknown) {
  vi.mocked(useQuery).mockReturnValue({
    data,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useQuery>)
}

describe('SuscripcionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQuery([{ id: 'r-1', name: 'Mi Rest', subscription_status: 'inactive', role: 'owner' }])
  })

  it('shows Activar button for inactive subscription', () => {
    render(<TestWrapper><SuscripcionPage /></TestWrapper>)
    expect(screen.getByText('Activar')).toBeInTheDocument()
  })

  it('shows Gestionar button for active subscription', () => {
    mockQuery([{ id: 'r-1', name: 'Mi Rest', subscription_status: 'active', role: 'owner' }])
    render(<TestWrapper><SuscripcionPage /></TestWrapper>)
    expect(screen.getByText('Gestionar')).toBeInTheDocument()
  })

  it('shows Activa badge for active subscription', () => {
    mockQuery([{ id: 'r-1', name: 'Mi Rest', subscription_status: 'active', role: 'owner' }])
    render(<TestWrapper><SuscripcionPage /></TestWrapper>)
    expect(screen.getByText('Activa')).toBeInTheDocument()
  })

  it('shows Inactiva badge for inactive subscription', () => {
    render(<TestWrapper><SuscripcionPage /></TestWrapper>)
    expect(screen.getByText('Inactiva')).toBeInTheDocument()
  })

  it('disables Activar button while processing', async () => {
    mockCreateCheckout.mockImplementation(() => new Promise(() => {}))
    render(<TestWrapper><SuscripcionPage /></TestWrapper>)
    fireEvent.click(screen.getByText('Activar'))
    await waitFor(() => {
      expect(screen.getByText('Activar').closest('button')).toBeDisabled()
    })
  })

  it('disables Gestionar button while processing', async () => {
    mockCreatePortal.mockImplementation(() => new Promise(() => {}))
    mockQuery([{ id: 'r-1', name: 'Mi Rest', subscription_status: 'active', role: 'owner' }])
    render(<TestWrapper><SuscripcionPage /></TestWrapper>)
    fireEvent.click(screen.getByText('Gestionar'))
    await waitFor(() => {
      expect(screen.getByText('Gestionar').closest('button')).toBeDisabled()
    })
  })

  it('shows error message when checkout fails', async () => {
    mockCreateCheckout.mockRejectedValue(new Error('Error de conexión'))
    render(<TestWrapper><SuscripcionPage /></TestWrapper>)
    fireEvent.click(screen.getByText('Activar'))
    await waitFor(() => {
      expect(screen.getByText('Error de conexión')).toBeInTheDocument()
    })
  })

  it('shows error message when portal fails', async () => {
    mockCreatePortal.mockRejectedValue(new Error('Error al abrir portal'))
    mockQuery([{ id: 'r-1', name: 'Mi Rest', subscription_status: 'active', role: 'owner' }])
    render(<TestWrapper><SuscripcionPage /></TestWrapper>)
    fireEvent.click(screen.getByText('Gestionar'))
    await waitFor(() => {
      expect(screen.getByText('Error al abrir portal')).toBeInTheDocument()
    })
  })

  it('redirects to /login when session expired', async () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('NO_SESSION'),
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useQuery>)
    render(<TestWrapper><SuscripcionPage /></TestWrapper>)
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login')
    })
  })

  it('shows error UI for generic errors without redirect', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Error de red'),
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useQuery>)
    render(<TestWrapper><SuscripcionPage /></TestWrapper>)
    expect(screen.getByText('Vaya, algo salió mal')).toBeInTheDocument()
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
