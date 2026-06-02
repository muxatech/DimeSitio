import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Top5Grid from '@/components/top5-grid'
import { useFlowStore } from '@/store/flow-store'
import type { Restaurant } from '@/types'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: Record<string, unknown>) => <>{children}</>,
}))

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: Record<string, unknown>) => <img alt={alt as string} {...props} />,
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
  zone: 'cabanyal',
  active: true,
}

describe('Top5Grid badges', () => {
  beforeEach(() => {
    useFlowStore.setState({
      top5: [],
      step: 'top5',
    })
  })

  it('shows Demo badge for demo restaurants', () => {
    useFlowStore.setState({ top5: [demoRestaurant] })
    render(<Top5Grid />)
    expect(screen.getByText('Demo')).toBeInTheDocument()
  })

  it('shows Fundador badge on card for founder restaurants', () => {
    useFlowStore.setState({ top5: [founderRestaurant] })
    render(<Top5Grid />)
    expect(screen.getByText('Fundador')).toBeInTheDocument()
  })

  it('does not show Demo badge for normal restaurants', () => {
    useFlowStore.setState({ top5: [normalRestaurant] })
    render(<Top5Grid />)
    expect(screen.queryByText('Demo')).not.toBeInTheDocument()
  })

  it('shows both badges on card when applicable', () => {
    const both: Restaurant = { ...founderRestaurant, is_demo: true }
    useFlowStore.setState({ top5: [both] })
    render(<Top5Grid />)
    expect(screen.getByText('Demo')).toBeInTheDocument()
    expect(screen.getByText('Fundador')).toBeInTheDocument()
  })
})


