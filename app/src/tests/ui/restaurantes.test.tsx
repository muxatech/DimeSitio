import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RestaurantesPage from '@/app/restaurantes/page'

vi.mock('framer-motion', async () => {
  const React = await import('react')
  const create = (tag: string) =>
    ({ children, ...props }: Record<string, unknown>) =>
      React.createElement(tag, props, children)
  return {
    motion: new Proxy({} as Record<string, React.FC<Record<string, unknown>>>, {
      get: (_target, tag) => create(tag as string),
    }),
  }
})

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: Record<string, unknown>) => <a href={href as string} {...props}>{children}</a>,
}))

describe('RestaurantesPage founder section', () => {
  it('shows the founder section title', () => {
    render(<RestaurantesPage />)
    expect(screen.getByText(/100 restaurantes fundadores/)).toBeInTheDocument()
  })

  it('shows the founder badge text in the section', () => {
    render(<RestaurantesPage />)
    expect(screen.getAllByText('Fundador').length).toBeGreaterThan(0)
  })

  it('shows the benefit text about appearing first', () => {
    render(<RestaurantesPage />)
    expect(screen.getByText(/aparecen siempre antes/)).toBeInTheDocument()
  })
})
