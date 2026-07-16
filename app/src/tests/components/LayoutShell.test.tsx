import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LayoutShell from '@/components/layout-shell'

const mockUsePathname = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

vi.mock('@/components/navbar', () => ({
  default: () => <div>Navbar</div>,
}))

vi.mock('@/components/footer', () => ({
  default: () => <div>Footer</div>,
}))

describe('LayoutShell - panel path detection', () => {
  it('hides navbar/footer for /forgot-password', () => {
    mockUsePathname.mockReturnValue('/forgot-password')
    render(<LayoutShell><div>Panel content</div></LayoutShell>)
    expect(screen.getByText('Panel content')).toBeInTheDocument()
    expect(screen.queryByText('Navbar')).not.toBeInTheDocument()
    expect(screen.queryByText('Footer')).not.toBeInTheDocument()
  })

  it('hides navbar/footer for /set-password', () => {
    mockUsePathname.mockReturnValue('/set-password')
    render(<LayoutShell><div>Panel content</div></LayoutShell>)
    expect(screen.getByText('Panel content')).toBeInTheDocument()
    expect(screen.queryByText('Navbar')).not.toBeInTheDocument()
    expect(screen.queryByText('Footer')).not.toBeInTheDocument()
  })

  it('hides navbar/footer for /login', () => {
    mockUsePathname.mockReturnValue('/login')
    render(<LayoutShell><div>Panel content</div></LayoutShell>)
    expect(screen.getByText('Panel content')).toBeInTheDocument()
    expect(screen.queryByText('Navbar')).not.toBeInTheDocument()
  })

  it('shows navbar/footer for public /terminos', () => {
    mockUsePathname.mockReturnValue('/terminos')
    render(<LayoutShell><div>Legal content</div></LayoutShell>)
    expect(screen.getByText('Navbar')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('shows navbar/footer for public /', () => {
    mockUsePathname.mockReturnValue('/')
    render(<LayoutShell><div>Home</div></LayoutShell>)
    expect(screen.getByText('Navbar')).toBeInTheDocument()
  })
})
