import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import PhotoCarousel from '@/components/photo-carousel'
import { TestWrapper } from '@/tests/helpers'

const photos = [
  'https://dimesitio.es/images/restaurants/a/1.webp',
  'https://dimesitio.es/images/restaurants/a/2.webp',
  'https://dimesitio.es/images/restaurants/a/3.webp',
]

describe('PhotoCarousel', () => {
  it('shows placeholder when there are no photos', () => {
    render(<PhotoCarousel photos={[]} name="Resto" />, { wrapper: TestWrapper })
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders a single photo without controls', () => {
    render(<PhotoCarousel photos={[photos[0]]} name="Resto" />, { wrapper: TestWrapper })
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.src).toBe(photos[0])
    expect(screen.queryByRole('button', { name: 'Foto 2' })).not.toBeInTheDocument()
  })

  it('shows dot controls with multiple photos', () => {
    render(<PhotoCarousel photos={photos} name="Resto" />, { wrapper: TestWrapper })
    expect(screen.getByRole('button', { name: 'Foto 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Foto 2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Foto 3' })).toBeInTheDocument()
  })

  it('renders side arrows only when showArrows is set', () => {
    const { unmount } = render(<PhotoCarousel photos={photos} name="Resto" />, { wrapper: TestWrapper })
    expect(screen.queryByRole('button', { name: 'Foto siguiente' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Foto anterior' })).not.toBeInTheDocument()
    unmount()

    render(<PhotoCarousel photos={photos} name="Resto" showArrows />, { wrapper: TestWrapper })
    expect(screen.getByRole('button', { name: 'Foto siguiente' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Foto anterior' })).toBeInTheDocument()
  })

  it('jumps to a photo when clicking a dot', () => {
    render(<PhotoCarousel photos={photos} name="Resto" />, { wrapper: TestWrapper })
    fireEvent.click(screen.getByRole('button', { name: 'Foto 3' }))
    expect((screen.getByRole('img') as HTMLImageElement).src).toBe(photos[2])
  })

  it('advances when swiping left', () => {
    render(<PhotoCarousel photos={photos} name="Resto" />, { wrapper: TestWrapper })
    const carousel = screen.getByTestId('photo-carousel')
    fireEvent.pointerDown(carousel, { clientX: 200, pointerId: 1 })
    fireEvent.pointerMove(carousel, { clientX: 100, pointerId: 1 })
    fireEvent.pointerUp(carousel, { clientX: 100, pointerId: 1 })
    expect((screen.getByRole('img') as HTMLImageElement).src).toBe(photos[1])
  })

  it('goes back when swiping right', () => {
    render(<PhotoCarousel photos={photos} name="Resto" />, { wrapper: TestWrapper })
    const carousel = screen.getByTestId('photo-carousel')
    fireEvent.pointerDown(carousel, { clientX: 100, pointerId: 1 })
    fireEvent.pointerMove(carousel, { clientX: 220, pointerId: 1 })
    fireEvent.pointerUp(carousel, { clientX: 220, pointerId: 1 })
    expect((screen.getByRole('img') as HTMLImageElement).src).toBe(photos[photos.length - 1])
  })

  it('does not change photo on a short drag', () => {
    render(<PhotoCarousel photos={photos} name="Resto" />, { wrapper: TestWrapper })
    const carousel = screen.getByTestId('photo-carousel')
    fireEvent.pointerDown(carousel, { clientX: 150, pointerId: 1 })
    fireEvent.pointerMove(carousel, { clientX: 170, pointerId: 1 })
    fireEvent.pointerUp(carousel, { clientX: 170, pointerId: 1 })
    expect((screen.getByRole('img') as HTMLImageElement).src).toBe(photos[0])
  })

  it('recovers after a cancelled drag (pointercancel)', () => {
    render(<PhotoCarousel photos={photos} name="Resto" />, { wrapper: TestWrapper })
    const carousel = screen.getByTestId('photo-carousel')
    fireEvent.pointerDown(carousel, { clientX: 200, pointerId: 1 })
    fireEvent.pointerMove(carousel, { clientX: 100, pointerId: 1 })
    fireEvent.pointerCancel(carousel, { clientX: 100, pointerId: 1 })
    expect((screen.getByRole('img') as HTMLImageElement).src).toBe(photos[0])
    fireEvent.click(screen.getByRole('button', { name: 'Foto 3' }))
    expect((screen.getByRole('img') as HTMLImageElement).src).toBe(photos[2])
  })

  it('opens fullscreen viewer when clicking the expand button', () => {
    render(<PhotoCarousel photos={photos} name="Resto" />, { wrapper: TestWrapper })
    fireEvent.click(screen.getByRole('button', { name: 'Ver fotos en grande' }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', photos[0])
  })

  it('expand button stays clickable after a pointer press and release', () => {
    render(<PhotoCarousel photos={photos} name="Resto" />, { wrapper: TestWrapper })
    const button = screen.getByRole('button', { name: 'Ver fotos en grande' })
    fireEvent.pointerDown(button, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerUp(button, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.click(button)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes fullscreen viewer when clicking the close button', () => {
    render(<PhotoCarousel photos={photos} name="Resto" />, { wrapper: TestWrapper })
    fireEvent.click(screen.getByRole('button', { name: 'Ver fotos en grande' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes fullscreen viewer when pressing Escape', () => {
    render(<PhotoCarousel photos={photos} name="Resto" />, { wrapper: TestWrapper })
    fireEvent.click(screen.getByRole('button', { name: 'Ver fotos en grande' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('navigates photos with the arrows in fullscreen', () => {
    render(<PhotoCarousel photos={photos} name="Resto" />, { wrapper: TestWrapper })
    fireEvent.click(screen.getByRole('button', { name: 'Ver fotos en grande' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', photos[0])
    fireEvent.click(within(dialog).getByRole('button', { name: 'Foto siguiente' }))
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', photos[1])
    fireEvent.click(within(dialog).getByRole('button', { name: 'Foto anterior' }))
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', photos[0])
  })
})
