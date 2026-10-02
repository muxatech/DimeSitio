import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import RestaurantModal from '@/components/restaurant-modal'
import { TestWrapper } from '@/tests/helpers'
import type { Restaurant } from '@/types'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => <div {...props}>{children}</div>,
    a: ({ children, ...props }: Record<string, unknown>) => <a {...props}>{children}</a>,
  },
  AnimatePresence: ({ children }: Record<string, unknown>) => <>{children}</>,
}))

vi.mock('@/lib/tracking', () => ({
  trackCall: vi.fn(),
  trackCta: vi.fn(),
}))

const base: Restaurant = {
  id: 'a', owner_id: null, name: 'Alfa', description: 'Cocina de autor',
  phone: '963000000', address: 'Carrer de la Pau 1', city: 'Valencia',
  lat: null, lng: null, price_level: 2, image_url: 'https://x.test/cover.webp',
  menu_url: 'https://x.test/menu', reservations_url: 'https://x.test/reservas',
  instagram_url: 'https://instagram.com/alfa', google_maps_url: 'https://maps.google.com/?q=1',
  zone: 'russafa', active: true, founder_rank: 3, is_demo: false,
}

const photos = ['https://x.test/1.webp', 'https://x.test/2.webp', 'https://x.test/3.webp']

describe('RestaurantModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when there is no restaurant', () => {
    render(<RestaurantModal restaurant={null} onClose={() => {}} />, { wrapper: TestWrapper })
    expect(screen.queryByTestId('restaurant-modal')).not.toBeInTheDocument()
  })

  it('renders as an accessible dialog', () => {
    render(<RestaurantModal restaurant={base} onClose={() => {}} />, { wrapper: TestWrapper })
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', 'Alfa')
  })

  it('swipes between photos', () => {
    render(<RestaurantModal restaurant={{ ...base, photos }} onClose={() => {}} />, { wrapper: TestWrapper })
    const carousel = within(screen.getByTestId('restaurant-modal')).getByTestId('photo-carousel')
    fireEvent.pointerDown(carousel, { clientX: 200, clientY: 200, pointerId: 1 })
    fireEvent.pointerMove(carousel, { clientX: 100, clientY: 200, pointerId: 1 })
    fireEvent.pointerUp(carousel, { clientX: 100, clientY: 200, pointerId: 1 })

    const modal = screen.getByTestId('restaurant-modal')
    expect(within(modal).getAllByRole('img').some((i) => i.getAttribute('src') === photos[1])).toBe(true)
  })

  it('falls back to image_url when there are no photos', () => {
    render(<RestaurantModal restaurant={base} onClose={() => {}} />, { wrapper: TestWrapper })
    const img = within(screen.getByTestId('restaurant-modal')).getByRole('img')
    expect(img).toHaveAttribute('src', 'https://x.test/cover.webp')
  })

  it('shows a fullscreen button', () => {
    render(<RestaurantModal restaurant={{ ...base, photos }} onClose={() => {}} />, { wrapper: TestWrapper })
    expect(within(screen.getByTestId('restaurant-modal')).getByRole('button', { name: 'Ver fotos en grande' })).toBeInTheDocument()
  })

  it('shows name, description, address, zone and price', () => {
    render(<RestaurantModal restaurant={base} onClose={() => {}} />, { wrapper: TestWrapper })
    const modal = screen.getByTestId('restaurant-modal')
    expect(within(modal).getByRole('heading', { name: 'Alfa' })).toBeInTheDocument()
    expect(within(modal).getByText('Cocina de autor')).toBeInTheDocument()
    expect(within(modal).getByText('Carrer de la Pau 1')).toBeInTheDocument()
    expect(within(modal).getByText('russafa')).toBeInTheDocument()
    expect(within(modal).getByText('€€')).toBeInTheDocument()
  })

  it('shows the founder and demo badges', () => {
    render(<RestaurantModal restaurant={base} onClose={() => {}} />, { wrapper: TestWrapper })
    expect(screen.getByText('Fundador')).toBeInTheDocument()

    render(<RestaurantModal restaurant={{ ...base, id: 'z', is_demo: true }} onClose={() => {}} />, { wrapper: TestWrapper })
    expect(screen.getAllByText('Demo').length).toBeGreaterThanOrEqual(1)
  })

  it('shows every available action', () => {
    render(<RestaurantModal restaurant={base} onClose={() => {}} />, { wrapper: TestWrapper })
    const modal = screen.getByTestId('restaurant-modal')
    expect(within(modal).getByRole('link', { name: /Llamar/ })).toHaveAttribute('href', 'tel:963000000')
    expect(within(modal).getByRole('link', { name: /Cómo llegar/ })).toHaveAttribute('href', 'https://maps.google.com/?q=1')
    expect(within(modal).getByRole('link', { name: /Ver menú/ })).toHaveAttribute('href', 'https://x.test/menu')
    expect(within(modal).getByRole('link', { name: /Reservar/ })).toHaveAttribute('href', 'https://x.test/reservas')
    expect(within(modal).getByRole('link', { name: /Ver Instagram/ })).toHaveAttribute('href', 'https://instagram.com/alfa')
  })

  it('builds a maps link from the address when there is no google_maps_url', () => {
    render(<RestaurantModal restaurant={{ ...base, google_maps_url: null }} onClose={() => {}} />, { wrapper: TestWrapper })
    const link = within(screen.getByTestId('restaurant-modal')).getByRole('link', { name: /Cómo llegar/ })
    expect(link.getAttribute('href')).toContain('google.com/maps')
  })

  it('hides actions that are not configured', () => {
    const bare: Restaurant = { ...base, phone: null, menu_url: null, reservations_url: null, instagram_url: null, google_maps_url: null, address: null }
    render(<RestaurantModal restaurant={bare} onClose={() => {}} />, { wrapper: TestWrapper })
    const modal = screen.getByTestId('restaurant-modal')
    expect(within(modal).queryByRole('link', { name: /Llamar/ })).not.toBeInTheDocument()
    expect(within(modal).queryByRole('link', { name: /Ver menú/ })).not.toBeInTheDocument()
    expect(within(modal).queryByRole('link', { name: /Reservar/ })).not.toBeInTheDocument()
    expect(within(modal).queryByRole('link', { name: /Ver Instagram/ })).not.toBeInTheDocument()
    expect(within(modal).queryByRole('link', { name: /Cómo llegar/ })).not.toBeInTheDocument()
  })

  it('opens external links in a new tab and tel links in place', () => {
    render(<RestaurantModal restaurant={base} onClose={() => {}} />, { wrapper: TestWrapper })
    const modal = screen.getByTestId('restaurant-modal')
    const call = within(modal).getByRole('link', { name: /Llamar/ })
    expect(call).not.toHaveAttribute('target')
    const ig = within(modal).getByRole('link', { name: /Ver Instagram/ })
    expect(ig).toHaveAttribute('target', '_blank')
    expect(ig).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('closes on the close button, the backdrop and Escape', () => {
    const onClose = vi.fn()
    const { rerender } = render(<RestaurantModal restaurant={base} onClose={onClose} />, { wrapper: TestWrapper })

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTestId('restaurant-modal'))
    expect(onClose).toHaveBeenCalledTimes(2)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(3)

    rerender(<RestaurantModal restaurant={null} onClose={onClose} />)
  })

  it('does not close when clicking inside the panel', () => {
    const onClose = vi.fn()
    render(<RestaurantModal restaurant={base} onClose={onClose} />, { wrapper: TestWrapper })
    fireEvent.click(screen.getByRole('heading', { name: 'Alfa' }))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('locks body scroll while open and restores it on close', () => {
    // Cada test parte de un body sin overflow propio: si un test anterior dejo
    // la Modal montada, su cleanup es lo que restaura el valor aqui.
    const before = document.body.style.overflow
    const { rerender } = render(<RestaurantModal restaurant={base} onClose={() => {}} />, { wrapper: TestWrapper })
    expect(document.body.style.overflow).toBe('hidden')

    rerender(<RestaurantModal restaurant={null} onClose={() => {}} />)
    expect(document.body.style.overflow).toBe(before)
  })

  it('renders in English', () => {
    render(
      <RestaurantModal restaurant={base} onClose={() => {}} />,
      { wrapper: (p) => <TestWrapper locale="en" {...p} /> }
    )
    const modal = screen.getByTestId('restaurant-modal')
    expect(within(modal).getByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(within(modal).getByRole('link', { name: /View Instagram/ })).toBeInTheDocument()
  })
})
