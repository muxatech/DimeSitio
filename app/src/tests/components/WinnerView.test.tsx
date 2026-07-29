import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import WinnerView from '@/components/winner-view'
import { useFlowStore } from '@/store/flow-store'
import { TestWrapper } from '@/tests/helpers'
import type { Restaurant } from '@/types'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => <div {...props}>{children}</div>,
    a: ({ children, ...props }: Record<string, unknown>) => <a {...props}>{children}</a>,
    button: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children}</button>,
  },
}))

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: Record<string, unknown>) => <img alt={alt as string} {...props} />,
}))

vi.mock('@/lib/tracking', () => ({
  trackCall: vi.fn(),
}))

const demoRestaurant: Restaurant = {
  id: 'r-demo',
  owner_id: null,
  name: 'Demo Restaurant',
  description: null,
  phone: null,
  address: null,
  city: 'Valencia',
  lat: null,
  lng: null,
  price_level: 1,
  image_url: null,
  menu_url: null,
  reservations_url: null,
  zone: 'centro',
  active: true,
  is_demo: true,
  google_maps_url: null,
  instagram_url: null,
}

const founderRestaurant: Restaurant = {
  id: 'r-founder',
  owner_id: null,
  name: 'Founder Restaurant',
  description: null,
  phone: null,
  address: null,
  city: 'Valencia',
  lat: null,
  lng: null,
  price_level: 2,
  image_url: null,
  menu_url: null,
  reservations_url: null,
  zone: 'russafa',
  active: true,
  founder_rank: 42,
  google_maps_url: null,
  instagram_url: null,
}

const normalRestaurant: Restaurant = {
  id: 'r-normal',
  owner_id: null,
  name: 'Normal Restaurant',
  description: null,
  phone: null,
  address: null,
  city: 'Valencia',
  lat: null,
  lng: null,
  price_level: 3,
  image_url: null,
  menu_url: null,
  reservations_url: null,
  instagram_url: null,
  zone: 'cabanyal',
  active: true,
  google_maps_url: null,
}

const restaurantWithInstagram: Restaurant = {
  id: 'r-instagram',
  owner_id: null,
  name: 'IG Restaurant',
  description: null,
  phone: null,
  address: null,
  city: 'Valencia',
  lat: null,
  lng: null,
  price_level: 2,
  image_url: null,
  menu_url: null,
  reservations_url: null,
  instagram_url: 'https://instagram.com/myhandle',
  zone: 'cabanyal',
  active: true,
  google_maps_url: null,
}

describe('WinnerView', () => {
  beforeEach(() => {
    useFlowStore.setState({
      winner: null,
      step: 'winner',
    })
  })

  describe('Spanish (default)', () => {
    it('shows Demo badge for demo winner', () => {
      useFlowStore.setState({ winner: demoRestaurant })
      render(<WinnerView />, { wrapper: TestWrapper })
      expect(screen.getByText('Demo')).toBeInTheDocument()
    })

    it('shows Fundador badge for founder winner', () => {
      useFlowStore.setState({ winner: founderRestaurant })
      render(<WinnerView />, { wrapper: TestWrapper })
      expect(screen.getByText('Fundador')).toBeInTheDocument()
    })

    it('does not show badges for normal winner', () => {
      useFlowStore.setState({ winner: normalRestaurant })
      render(<WinnerView />, { wrapper: TestWrapper })
      expect(screen.queryByText('Fundador')).not.toBeInTheDocument()
      expect(screen.queryByText('Demo')).not.toBeInTheDocument()
    })

    it('Volver a empezar resets question state and goes to questions', () => {
      useFlowStore.setState({ winner: normalRestaurant, step: 'winner' })
      render(<WinnerView />, { wrapper: TestWrapper })

      const btn = screen.getByRole('button', { name: /volver a empezar/i })
      btn.click()

      const state = useFlowStore.getState()
      expect(state.step).toBe('questions')
      expect(state.winner).toBeNull()
      expect(state.qIndex).toBe(0)
    })

    it('shows Instagram link when winner has instagram_url', () => {
      useFlowStore.setState({ winner: restaurantWithInstagram })
      render(<WinnerView />, { wrapper: TestWrapper })
      const link = screen.getByText('Ver Instagram')
      expect(link).toBeInTheDocument()
      expect(link.closest('a')).toHaveAttribute('href', 'https://instagram.com/myhandle')
      expect(link.closest('a')).toHaveAttribute('target', '_blank')
    })

    it('does not show Instagram link when winner has no instagram_url', () => {
      useFlowStore.setState({ winner: normalRestaurant })
      render(<WinnerView />, { wrapper: TestWrapper })
      expect(screen.queryByText('Ver Instagram')).not.toBeInTheDocument()
    })

    it('shows error state when no winner', () => {
      useFlowStore.setState({ winner: null })
      render(<WinnerView />, { wrapper: TestWrapper })
      expect(screen.getByText('No se ha seleccionado ningún restaurante')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /volver a empezar/i })).toBeInTheDocument()
    })

    it('shows celebration text', () => {
      useFlowStore.setState({ winner: normalRestaurant })
      render(<WinnerView />, { wrapper: TestWrapper })
      expect(screen.getByText('Tu restaurante ideal')).toBeInTheDocument()
    })

    it('shows action buttons for call, directions, menu, reserve', () => {
      useFlowStore.setState({ winner: { ...normalRestaurant, phone: '123', address: 'Calle 1', menu_url: 'https://menu.com', reservations_url: 'https://res.com' } })
      render(<WinnerView />, { wrapper: TestWrapper })
      expect(screen.getByText('Llamar')).toBeInTheDocument()
      expect(screen.getByText('Cómo llegar')).toBeInTheDocument()
      expect(screen.getByText('Ver menú')).toBeInTheDocument()
      expect(screen.getByText('Reservar')).toBeInTheDocument()
    })
  })

  describe('English', () => {
    it('shows error state in English', () => {
      useFlowStore.setState({ winner: null })
      render(<WinnerView />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText('No restaurant was selected')).toBeInTheDocument()
      expect(screen.getByText('Start over and find your ideal restaurant.')).toBeInTheDocument()
    })

    it('shows celebration text in English', () => {
      useFlowStore.setState({ winner: normalRestaurant })
      render(<WinnerView />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText('Your ideal restaurant')).toBeInTheDocument()
    })

    it('shows Founder badge in English', () => {
      useFlowStore.setState({ winner: founderRestaurant })
      render(<WinnerView />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText('Founder')).toBeInTheDocument()
    })

    it('shows action buttons in English', () => {
      useFlowStore.setState({ winner: { ...normalRestaurant, phone: '123', address: 'Calle 1', menu_url: 'https://menu.com', reservations_url: 'https://res.com' } })
      render(<WinnerView />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText('Call')).toBeInTheDocument()
      expect(screen.getByText('Directions')).toBeInTheDocument()
      expect(screen.getByText('View menu')).toBeInTheDocument()
      expect(screen.getByText('Reserve')).toBeInTheDocument()
    })

    it('shows Instagram link in English', () => {
      useFlowStore.setState({ winner: restaurantWithInstagram })
      render(<WinnerView />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText('View Instagram')).toBeInTheDocument()
    })

    it('start over button works in English', () => {
      useFlowStore.setState({ winner: normalRestaurant, step: 'winner' })
      render(<WinnerView />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      const btn = screen.getByRole('button', { name: /start over/i })
      btn.click()
      const state = useFlowStore.getState()
      expect(state.step).toBe('questions')
      expect(state.winner).toBeNull()
    })
  })
})
