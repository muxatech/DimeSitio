import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@/tests/helpers'
import PagoExitosoPage from '@/app/[locale]/pago-exitoso/page'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: Record<string, unknown>) => (
    <a href={href as string} {...props}>{children}</a>
  ),
}))

describe('PagoExitoso page', () => {
  it('renders Spanish text by default', () => {
    render(<PagoExitosoPage />, { wrapper: TestWrapper })
    expect(screen.getByText('Pago completado')).toBeInTheDocument()
    expect(screen.getByText('Ir al panel')).toBeInTheDocument()
    expect(screen.getByText(/Revisa tu bandeja de entrada/)).toBeInTheDocument()
    expect(screen.getByText(/Revisa la carpeta de spam/)).toBeInTheDocument()
  })

  it('renders English text when locale is en', () => {
    render(<PagoExitosoPage />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
    expect(screen.getByText('Payment completed')).toBeInTheDocument()
    expect(screen.getByText('Go to dashboard')).toBeInTheDocument()
    expect(screen.getByText(/Check your inbox/)).toBeInTheDocument()
    expect(screen.getByText(/Check your spam folder/)).toBeInTheDocument()
  })
})
