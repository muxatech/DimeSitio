import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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
    expect(screen.queryByRole('button', { name: 'Foto siguiente' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Foto anterior' })).not.toBeInTheDocument()
  })

  it('shows next/previous controls with multiple photos', () => {
    render(<PhotoCarousel photos={photos} name="Resto" />, { wrapper: TestWrapper })
    expect(screen.getByRole('button', { name: 'Foto siguiente' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Foto anterior' })).toBeInTheDocument()
  })

  it('advances to the next photo when clicking next', () => {
    render(<PhotoCarousel photos={photos} name="Resto" />, { wrapper: TestWrapper })
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.src).toBe(photos[0])
    fireEvent.click(screen.getByRole('button', { name: 'Foto siguiente' }))
    expect((screen.getByRole('img') as HTMLImageElement).src).toBe(photos[1])
  })

  it('wraps around when clicking previous on the first photo', () => {
    render(<PhotoCarousel photos={photos} name="Resto" />, { wrapper: TestWrapper })
    fireEvent.click(screen.getByRole('button', { name: 'Foto anterior' }))
    expect((screen.getByRole('img') as HTMLImageElement).src).toBe(photos[photos.length - 1])
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
})
