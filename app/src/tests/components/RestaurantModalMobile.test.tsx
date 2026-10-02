import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RestaurantModal from '@/components/restaurant-modal'
import { TestWrapper } from '@/tests/helpers'
import type { Restaurant } from '@/types'

// Capturamos las props de cada motion.div para poder inspeccionar las
//keyframes de entrada/salida, que es justo lo que define la hoja de móvil.
const motionNodes: Record<string, unknown>[] = []

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get:
        () =>
        ({ children, ...props }: Record<string, unknown>) => {
          motionNodes.push(props)
          return <div data-motion-node={motionNodes.length} {...props}>{children}</div>
        },
    }
  ),
  AnimatePresence: ({ children }: Record<string, unknown>) => <>{children}</>,
}))

vi.mock('@/lib/tracking', () => ({ trackCta: vi.fn() }))

const base: Restaurant = {
  id: 'a', owner_id: null, name: 'Alfa', description: 'Cocina de autor',
  phone: null, address: 'Carrer de la Pau 1', city: 'Valencia',
  lat: null, lng: null, price_level: 2, image_url: 'https://x.test/cover.webp',
  menu_url: null, reservations_url: null,
  instagram_url: 'https://instagram.com/alfa', google_maps_url: null,
  zone: 'russafa', active: true, founder_rank: 3, is_demo: false,
}

function setViewport(isMobile: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: isMobile,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }),
  })
}

describe('RestaurantModal mobile sheet', () => {
  beforeEach(() => {
    motionNodes.length = 0
  })

  // El primer render usa el valor conservador (false) y el layout effect
  // vuelve a renderizar con el valor real. Lo que llega al navegador es el
  // último render de cada nodo, así que guardamos el último de cada uno.
  // No nos fiamos de la posición: PhotoCarousel también crea nodos motion.
  function lastPanel() {
    const panels = motionNodes.filter((n) => n.className?.toString().includes('rounded-t-3xl'))
    return panels.at(-1)
  }
  function lastBackdrop() {
    const backdrops = motionNodes.filter((n) => n.style?.backgroundColor)
    return backdrops.at(-1)
  }

  it('slides the sheet up from the bottom edge on mobile', () => {
    setViewport(true)
    render(<RestaurantModal restaurant={base} onClose={() => {}} />, { wrapper: TestWrapper })

    const panel = lastPanel()!
    expect(panel.initial).toMatchObject({ y: '100%', scale: 1 })
    expect(panel.exit).toMatchObject({ y: '100%', scale: 1 })
    expect(panel.animate).toMatchObject({ y: 0, scale: 1 })
    // Sin escala: una hoja nativa no encoge al entrar.
    expect(panel.initial).not.toMatchObject({ scale: 0.98 })
    expect(lastBackdrop()!.style.backgroundColor).toContain('0.72')
  })

  it('keeps the centered pop animation on desktop', () => {
    setViewport(false)
    render(<RestaurantModal restaurant={base} onClose={() => {}} />, { wrapper: TestWrapper })

    const panel = lastPanel()!
    expect(panel.initial).toMatchObject({ y: 40, scale: 0.98 })
    expect(panel.exit).toMatchObject({ y: 40, scale: 0.98 })
    expect(lastBackdrop()!.style.backgroundColor).toContain('0.6')
  })

  it('pins the body on mobile and restores the scroll position on close', () => {
    setViewport(true)
    window.scrollTo = vi.fn()
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 240 })

    const { rerender } = render(<RestaurantModal restaurant={base} onClose={() => {}} />, { wrapper: TestWrapper })
    expect(document.body.style.position).toBe('fixed')
    expect(document.body.style.top).toBe('-240px')
    expect(document.body.style.overflow).toBe('hidden')

    rerender(<RestaurantModal restaurant={null} onClose={() => {}} />)
    expect(document.body.style.position).toBe('')
    expect(document.body.style.top).toBe('')
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(window.scrollTo).toHaveBeenCalledWith(0, 240)
  })

  it('does not pin the body on desktop', () => {
    setViewport(false)
    const { rerender } = render(<RestaurantModal restaurant={base} onClose={() => {}} />, { wrapper: TestWrapper })
    expect(document.body.style.position).toBe('')

    rerender(<RestaurantModal restaurant={null} onClose={() => {}} />)
    expect(document.body.style.position).toBe('')
  })

  it('still closes with the backdrop and Escape on mobile', () => {
    setViewport(true)
    const onClose = vi.fn()
    const { rerender } = render(<RestaurantModal restaurant={base} onClose={onClose} />, { wrapper: TestWrapper })

    fireEvent.click(screen.getByTestId('restaurant-modal'))
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(2)

    rerender(<RestaurantModal restaurant={null} onClose={onClose} />)
  })
})