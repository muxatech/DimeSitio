import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { motion } from 'framer-motion'
import Top5Grid from '@/components/top5-grid'
import { useFlowStore } from '@/store/flow-store'
import { TestWrapper } from '@/tests/helpers'
import type { Restaurant } from '@/types'

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: Record<string, unknown>) => <img alt={alt as string} {...props} />,
}))

vi.mock('@/lib/tracking', () => ({
  trackSelection: vi.fn(),
  trackCta: vi.fn(),
}))

function makeRestaurant(id: string, overrides: Partial<Restaurant> = {}): Restaurant {
  return {
    id,
    owner_id: null,
    name: `Resto ${id}`,
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
    instagram_url: null,
    google_maps_url: null,
    zone: 'centro',
    active: true,
    ...overrides,
  }
}

const r1 = makeRestaurant('a', { name: 'Alfa', price_level: 1 })
const r2 = makeRestaurant('b', { name: 'Beta', price_level: 2 })
const r3 = makeRestaurant('c', { name: 'Gamma', price_level: 3 })
const r4 = makeRestaurant('d', { name: 'Delta' })
const r5 = makeRestaurant('e', { name: 'Epsilon' })
const all = [r1, r2, r3, r4, r5]

describe('Top5Grid', () => {
  beforeEach(() => {
    useFlowStore.setState({
      step: 'top5',
      top5: [],
      favoriteId: null,
      winner: null,
    })
  })

  describe('empty state', () => {
    it('shows the empty state when there are no finalists', () => {
      render(<Top5Grid />, { wrapper: TestWrapper })
      expect(screen.getByText('No encontramos restaurantes con esos filtros')).toBeInTheDocument()
      expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
    })

    it('returns to questions from the empty state', () => {
      render(<Top5Grid />, { wrapper: TestWrapper })
      fireEvent.click(screen.getByRole('button', { name: /cambiar filtros/i }))
      expect(useFlowStore.getState().step).toBe('questions')
    })
  })

  describe('rendering', () => {
    beforeEach(() => {
      useFlowStore.setState({ top5: all })
    })

    it('renders every finalist', () => {
      render(<Top5Grid />, { wrapper: TestWrapper })
      expect(screen.getAllByRole('radio')).toHaveLength(5)
      for (const name of ['Alfa', 'Beta', 'Gamma', 'Delta', 'Epsilon']) {
        expect(screen.getByText(name)).toBeInTheDocument()
      }
    })

    it('exposes the cards as a radio group', () => {
      render(<Top5Grid />, { wrapper: TestWrapper })
      expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    })

    it('shows price level on each card', () => {
      render(<Top5Grid />, { wrapper: TestWrapper })
      const metas = screen.getAllByRole('radio').map((card) => card.textContent ?? '')
      expect(metas.some((m) => m.includes('€€€'))).toBe(true)
      expect(metas.some((m) => m.includes('€€'))).toBe(true)
      expect(metas.some((m) => /€(?!\€)/.test(m))).toBe(true)
    })

    

    it('shows the founder badge', () => {
      useFlowStore.setState({ top5: [makeRestaurant('f', { founder_rank: 1 })] })
      render(<Top5Grid />, { wrapper: TestWrapper })
      expect(screen.getByText('Fundador')).toBeInTheDocument()
    })

    it('shows the demo badge', () => {
      useFlowStore.setState({ top5: [makeRestaurant('d', { is_demo: true })] })
      render(<Top5Grid />, { wrapper: TestWrapper })
      expect(screen.getByText('Demo')).toBeInTheDocument()
    })

    it('renders with a single finalist', () => {
      useFlowStore.setState({ top5: [r1] })
      render(<Top5Grid />, { wrapper: TestWrapper })
      expect(screen.getAllByRole('radio')).toHaveLength(1)
    })
  })

  describe('selection', () => {
    beforeEach(() => {
      useFlowStore.setState({ top5: all })
    })

    it('has nothing selected initially', () => {
      render(<Top5Grid />, { wrapper: TestWrapper })
      expect(screen.getAllByRole('radio').every((r) => r.getAttribute('aria-checked') === 'false')).toBe(true)
    })

    it('selects a card on click', () => {
      render(<Top5Grid />, { wrapper: TestWrapper })
      fireEvent.click(screen.getByText('Gamma'))
      expect(useFlowStore.getState().favoriteId).toBe('c')
      expect(screen.getByText('Gamma').closest('[role="radio"]')).toHaveAttribute('aria-checked', 'true')
    })

    it('replaces the selection when another card is clicked', () => {
      render(<Top5Grid />, { wrapper: TestWrapper })
      fireEvent.click(screen.getByText('Alfa'))
      fireEvent.click(screen.getByText('Gamma'))
      expect(useFlowStore.getState().favoriteId).toBe('c')
      expect(screen.getAllByRole('radio').filter((r) => r.getAttribute('aria-checked') === 'true')).toHaveLength(1)
    })

    it('deselects when tapping the selected card again', () => {
      render(<Top5Grid />, { wrapper: TestWrapper })
      fireEvent.click(screen.getByText('Gamma'))
      fireEvent.click(screen.getByText('Gamma'))
      expect(useFlowStore.getState().favoriteId).toBeNull()
    })

    it('selects a card with the keyboard', () => {
      render(<Top5Grid />, { wrapper: TestWrapper })
      const card = screen.getByText('Beta').closest('[role="radio"]') as HTMLElement
      fireEvent.keyDown(card, { key: 'Enter' })
      expect(useFlowStore.getState().favoriteId).toBe('b')
    })
  })

  describe('confirm', () => {
    beforeEach(() => {
      useFlowStore.setState({ top5: all })
    })

    it('is disabled until a card is selected', () => {
      render(<Top5Grid />, { wrapper: TestWrapper })
      expect(screen.getByRole('button', { name: /elige uno para continuar/i })).toBeDisabled()
    })

    it('does not advance to the winner step without a selection', () => {
      render(<Top5Grid />, { wrapper: TestWrapper })
      const btn = screen.getByRole('button', { name: /elige uno para continuar/i })
      fireEvent.click(btn)
      expect(useFlowStore.getState().step).toBe('top5')
    })

    it('declares the selected finalist as winner', () => {
      render(<Top5Grid />, { wrapper: TestWrapper })
      fireEvent.click(screen.getByText('Epsilon'))
      fireEvent.click(screen.getByRole('button', { name: /elegir epsilon/i }))

      const state = useFlowStore.getState()
      expect(state.step).toBe('winner')
      expect(state.winner?.id).toBe('e')
    })

    it('names the selection in the button', () => {
      render(<Top5Grid />, { wrapper: TestWrapper })
      fireEvent.click(screen.getByText('Alfa'))
      expect(screen.getByRole('button', { name: 'Elegir Alfa' })).toBeEnabled()
    })
  })

  describe('going back', () => {
    it('returns to questions and keeps the selection so the user can change it', () => {
      useFlowStore.setState({ top5: all, favoriteId: 'c' })
      render(<Top5Grid />, { wrapper: TestWrapper })
      fireEvent.click(screen.getByRole('button', { name: /cambiar filtros/i }))

      expect(useFlowStore.getState().step).toBe('questions')
      expect(useFlowStore.getState().favoriteId).toBe('c')
    })
  })

  describe('English', () => {
    it('renders the picker in English', () => {
      useFlowStore.setState({ top5: all })
      render(<Top5Grid />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText('Tap the one you like most.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /pick one to continue/i })).toBeInTheDocument()
    })

    it('confirms in English', () => {
      useFlowStore.setState({ top5: all })
      render(<Top5Grid />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      fireEvent.click(screen.getByText('Beta'))
      fireEvent.click(screen.getByRole('button', { name: 'Choose Beta' }))
      expect(useFlowStore.getState().winner?.id).toBe('b')
    })

    it('shows the empty state in English', () => {
      render(<Top5Grid />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText('No restaurants found with those filters')).toBeInTheDocument()
    })
  })

  it('renders without crashing under framer-motion real implementation', () => {
    useFlowStore.setState({ top5: all })
    expect(motion.div).toBeDefined()
    render(<Top5Grid />, { wrapper: TestWrapper })
    expect(screen.getAllByRole('radio')).toHaveLength(5)
  })
})