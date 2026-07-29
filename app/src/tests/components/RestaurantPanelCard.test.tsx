import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RestaurantPanelCard from '@/components/restaurant-panel-card'
import { TestWrapper } from '@/tests/helpers'
import type { RestaurantWithRole } from '@/types'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => <div {...props}>{children}</div>,
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

vi.mock('@/i18n/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: Record<string, unknown>) => <img alt={alt as string} {...props} />,
}))

const base: RestaurantWithRole = {
  id: 'r-1',
  owner_id: null,
  name: 'Test Restaurant',
  description: 'A test restaurant',
  phone: '+34 666 66 66 66',
  address: 'C/ Test, 1',
  city: 'Valencia',
  lat: null,
  lng: null,
  price_level: 2,
  image_url: null,
  menu_url: null,
  reservations_url: null,
  instagram_url: null,
  google_maps_url: null,
  zone: 'centro',
  active: true,
  role: 'owner',
  subscription_status: 'active',
  stats: { impressions: 10, selections: 5, calls: 2 },
}

describe('RestaurantPanelCard founder/demo badges', () => {
  it('shows Fundador badge when founder_rank is set', () => {
    render(<RestaurantPanelCard restaurant={{ ...base, founder_rank: 1 }} />, { wrapper: TestWrapper })
    expect(screen.getByText('Fundador')).toBeInTheDocument()
  })

  it('does not show Fundador badge when founder_rank is null', () => {
    render(<RestaurantPanelCard restaurant={base} />, { wrapper: TestWrapper })
    expect(screen.queryByText('Fundador')).not.toBeInTheDocument()
  })

  it('shows Demo badge when is_demo is true', () => {
    render(<RestaurantPanelCard restaurant={{ ...base, is_demo: true }} />, { wrapper: TestWrapper })
    expect(screen.getByText('Demo')).toBeInTheDocument()
  })

  it('does not show Demo badge when is_demo is false', () => {
    render(<RestaurantPanelCard restaurant={base} />, { wrapper: TestWrapper })
    expect(screen.queryByText('Demo')).not.toBeInTheDocument()
  })

  it('shows both badges when both conditions are met', () => {
    render(<RestaurantPanelCard restaurant={{ ...base, is_demo: true, founder_rank: 5 }} />, { wrapper: TestWrapper })
    expect(screen.getByText('Fundador')).toBeInTheDocument()
    expect(screen.getByText('Demo')).toBeInTheDocument()
  })
})
