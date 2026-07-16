import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@/tests/helpers'
import RestaurantPanelCard from '@/components/restaurant-panel-card'
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
  zone: 'centro',
  active: true,
  role: 'owner',
  subscription_status: 'active',
  stats: { impressions: 10, selections: 5, calls: 2 },
}

describe('RestaurantPanelCard i18n', () => {
  it('renders Spanish status labels by default', () => {
    render(<RestaurantPanelCard restaurant={{ ...base, founder_rank: 1 }} showActions />, { wrapper: TestWrapper })
    expect(screen.getByText('Fundador')).toBeInTheDocument()
    expect(screen.getByText('Activo')).toBeInTheDocument()
    expect(screen.getByLabelText('Editar')).toBeInTheDocument()
    expect(screen.getByLabelText('Eliminar')).toBeInTheDocument()
  })

  it('renders English status labels when locale is en', () => {
    render(
      <RestaurantPanelCard restaurant={{ ...base, founder_rank: 1 }} showActions />,
      { wrapper: (p) => <TestWrapper locale="en" {...p} /> }
    )
    expect(screen.getByText('Founder')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByLabelText('Edit')).toBeInTheDocument()
    expect(screen.getByLabelText('Delete')).toBeInTheDocument()
  })

  it('renders "Oculto" / "Hidden" when active but no subscription', () => {
    const { unmount } = render(
      <RestaurantPanelCard restaurant={{ ...base, active: false, subscription_status: 'active' }} />,
      { wrapper: TestWrapper }
    )
    expect(screen.getByText('Oculto')).toBeInTheDocument()
    unmount()

    render(
      <RestaurantPanelCard restaurant={{ ...base, active: false, subscription_status: 'active' }} />,
      { wrapper: (p) => <TestWrapper locale="en" {...p} /> }
    )
    expect(screen.getByText('Hidden')).toBeInTheDocument()
  })

  it('renders "Sin suscripción" / "No subscription" when no subscription', () => {
    const { unmount } = render(
      <RestaurantPanelCard restaurant={{ ...base, active: false, subscription_status: 'inactive' }} />,
      { wrapper: TestWrapper }
    )
    expect(screen.getByText('Sin suscripción')).toBeInTheDocument()
    unmount()

    render(
      <RestaurantPanelCard restaurant={{ ...base, active: false, subscription_status: 'inactive' }} />,
      { wrapper: (p) => <TestWrapper locale="en" {...p} /> }
    )
    expect(screen.getByText('No subscription')).toBeInTheDocument()
  })
})
