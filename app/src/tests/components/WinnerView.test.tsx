import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import WinnerView from '@/components/winner-view'
import { useFlowStore } from '@/store/flow-store'
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
  zone: 'centro',
  active: true,
}

describe('WinnerView', () => {
  beforeEach(() => {
    useFlowStore.setState({
      winner: null,
      step: 'winner',
    })
  })

  it('shows Demo badge for demo winner', () => {
    useFlowStore.setState({ winner: demoRestaurant })
    render(<WinnerView />)
    expect(screen.getByText('Demo')).toBeInTheDocument()
  })

  it('shows Fundador badge for founder winner', () => {
    useFlowStore.setState({ winner: founderRestaurant })
    render(<WinnerView />)
    expect(screen.getByText('Fundador')).toBeInTheDocument()
  })

  it('does not show badges for normal winner', () => {
    useFlowStore.setState({ winner: normalRestaurant })
    render(<WinnerView />)
    expect(screen.queryByText('Fundador')).not.toBeInTheDocument()
    expect(screen.queryByText('Demo')).not.toBeInTheDocument()
  })

  it('Volver a empezar resets question state and goes to questions', () => {
    useFlowStore.setState({ winner: normalRestaurant, step: 'winner' })
    render(<WinnerView />)

    const btn = screen.getByRole('button', { name: /volver a empezar/i })
    btn.click()

    const state = useFlowStore.getState()
    expect(state.step).toBe('questions')
    expect(state.winner).toBeNull()
    expect(state.qIndex).toBe(0)
  })

  it('shows Instagram link when winner has instagram_url', () => {
    useFlowStore.setState({ winner: restaurantWithInstagram })
    render(<WinnerView />)
    const link = screen.getByText('Ver Instagram')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', 'https://instagram.com/myhandle')
    expect(link.closest('a')).toHaveAttribute('target', '_blank')
  })

  it('does not show Instagram link when winner has no instagram_url', () => {
    useFlowStore.setState({ winner: normalRestaurant })
    render(<WinnerView />)
    expect(screen.queryByText('Ver Instagram')).not.toBeInTheDocument()
  })

  it('shows error state when no winner', () => {
    useFlowStore.setState({ winner: null })
    render(<WinnerView />)
    expect(screen.getByText('No se ha seleccionado ningún restaurante')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /volver a empezar/i })).toBeInTheDocument()
  })
})
