import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '@/components/footer'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: Record<string, unknown>) => <a href={href as string} {...props}>{children}</a>,
}))

describe('Footer legal links', () => {
  it('renders legal section heading', () => {
    render(<Footer />)
    expect(screen.getByText('Legal')).toBeInTheDocument()
  })

  it('renders link to Términos y Condiciones', () => {
    render(<Footer />)
    const link = screen.getByText('Términos y Condiciones')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/terminos')
  })

  it('renders link to Política de Privacidad', () => {
    render(<Footer />)
    const link = screen.getByText('Política de Privacidad')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/privacidad')
  })

  it('renders link to Aviso Legal', () => {
    render(<Footer />)
    const link = screen.getByText('Aviso Legal')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/aviso-legal')
  })
})
