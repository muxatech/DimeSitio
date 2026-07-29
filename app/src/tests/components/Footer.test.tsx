import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '@/components/footer'
import { TestWrapper } from '@/tests/helpers'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: Record<string, unknown>) => <a href={href as string} {...props}>{children}</a>,
}))

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: Record<string, unknown>) => <a href={href as string} {...props}>{children}</a>,
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      appName: 'DimeSitio',
      tagline: 'Encuentra tu próximo plan gastronómico',
      links: 'Links',
      home: 'Inicio',
      forRestaurants: 'Para restaurantes',
      contact: 'Contacto',
      legal: 'Legal',
      terms: 'Términos y Condiciones',
      privacy: 'Política de Privacidad',
      legalNotice: 'Aviso Legal',
      allRightsReserved: 'Todos los derechos reservados.',
      madeInValencia: 'Hecho en Valencia',
    }
    return map[key] || key
  },
}))

describe('Footer legal links', () => {
  describe('Spanish (default)', () => {
    it('renders legal section heading', async () => {
      await render(await Footer())
      expect(screen.getByText('Legal')).toBeInTheDocument()
    })

    it('renders link to Términos y Condiciones', async () => {
      await render(await Footer())
      const link = screen.getByText('Términos y Condiciones')
      expect(link).toBeInTheDocument()
      expect(link.closest('a')).toHaveAttribute('href', '/terminos')
    })

    it('renders link to Política de Privacidad', async () => {
      await render(await Footer())
      const link = screen.getByText('Política de Privacidad')
      expect(link).toBeInTheDocument()
      expect(link.closest('a')).toHaveAttribute('href', '/privacidad')
    })

    it('renders link to Aviso Legal', async () => {
      await render(await Footer())
      const link = screen.getByText('Aviso Legal')
      expect(link).toBeInTheDocument()
      expect(link.closest('a')).toHaveAttribute('href', '/aviso-legal')
    })
  })
})
