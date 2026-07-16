import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotFound from '@/app/not-found'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: Record<string, unknown>) => (
    <a href={href as string} {...props}>{children}</a>
  ),
}))

vi.mock('next-intl/server', () => ({
  getTranslations: async () => {
    const es = await import('../../../messages/es.json')
    const t = (key: string) => es.default.NotFound[key as keyof typeof es.default.NotFound] || key
    return t
  },
}))

describe('NotFound page', () => {
  it('renders 404, title, description and back link', async () => {
    render(await NotFound())
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument()
    expect(screen.getByText(/La página que buscas no existe/)).toBeInTheDocument()
    expect(screen.getByText('Volver al inicio')).toBeInTheDocument()
  })
})
