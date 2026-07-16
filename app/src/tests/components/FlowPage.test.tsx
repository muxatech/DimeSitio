import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import FlowPage from '@/components/flow-page'
import { useFlowStore } from '@/store/flow-store'
import { TestWrapper } from '@/tests/helpers'
import type { Restaurant } from '@/types'

const { mockUseQuery } = vi.hoisted(() => ({
  mockUseQuery: vi.fn(),
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: mockUseQuery,
  useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: Record<string, unknown>) => <>{children}</>,
}))

vi.mock('next/dynamic', () => ({
  default: () => {
    const LazyComp = (props: Record<string, unknown>) => <div data-testid="question-location" {...props} />
    LazyComp.displayName = 'DynamicQuestionLocation'
    return LazyComp
  },
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {},
}))

vi.mock('@/components/landing-hero', () => ({
  default: () => <div data-testid="landing-hero" />,
}))

vi.mock('@/lib/tracking', () => ({
  trackCall: vi.fn(),
}))

const mockRestaurants: Restaurant[] = [
  {
    id: 'r-1', owner_id: null, name: 'Rest A', description: null, phone: null,
    address: null, city: 'Valencia', lat: null, lng: null, price_level: 2,
    image_url: null, menu_url: null, reservations_url: null, instagram_url: null,
    zone: 'centro', active: true,
    restaurant_categories: [{ category_id: 'cat-1' }],
  },
  {
    id: 'r-2', owner_id: null, name: 'Rest B', description: null, phone: null,
    address: null, city: 'Valencia', lat: null, lng: null, price_level: 1,
    image_url: null, menu_url: null, reservations_url: null, instagram_url: null,
    zone: 'russafa', active: true,
    restaurant_categories: [{ category_id: 'cat-2' }],
  },
]

function resetStore() {
  useFlowStore.setState({
    step: 'landing', sessionId: '', qIndex: 0,
    selectedCategoryIds: [], selectedPriceLevel: null, selectedZoneIds: [],
    locationCenter: null, locationRadius: null,
    filteredRestaurants: [], top5: [],
    battleChampion: null, battleChallenger: null, battlePool: [], battleRound: 0,
    winner: null,
  })
}

describe('FlowPage', () => {
  beforeEach(() => {
    resetStore()
    sessionStorage.clear()
    mockUseQuery.mockReset()
    mockUseQuery.mockReturnValue({ data: [], isLoading: false, isError: false })
    window.scrollTo = vi.fn()
    window.history.pushState = vi.fn()
    window.history.replaceState = vi.fn()
  })

  describe('Spanish (default)', () => {
    it('renders LandingHero when step is landing', () => {
      render(<FlowPage />, { wrapper: TestWrapper })
      expect(screen.getByTestId('landing-hero')).toBeInTheDocument()
    })

    it('renders loading state while queries are loading', () => {
      useFlowStore.setState({ step: 'questions' })
      mockUseQuery.mockReturnValue({ data: undefined, isLoading: true, isError: false })
      render(<FlowPage />, { wrapper: TestWrapper })
      expect(screen.getByText(/Buscando los mejores restaurantes/)).toBeInTheDocument()
    })

    it('renders error state when queries fail', () => {
      useFlowStore.setState({ step: 'questions' })
      mockUseQuery.mockReturnValue({ data: undefined, isLoading: false, isError: true })
      render(<FlowPage />, { wrapper: TestWrapper })
      expect(screen.getByText(/Vaya, algo salió mal/)).toBeInTheDocument()
      expect(screen.getByText('Reintentar')).toBeInTheDocument()
    })

    it('renders empty state when no restaurants', () => {
      useFlowStore.setState({ step: 'questions' })
      mockUseQuery
        .mockReturnValueOnce({ data: [{ id: 'cat-1', name: 'Italiana' }], isLoading: false, isError: false })
        .mockReturnValueOnce({ data: [], isLoading: false, isError: false })
      render(<FlowPage />, { wrapper: TestWrapper })
      expect(screen.getByText(/Todavía no hay restaurantes/)).toBeInTheDocument()
    })

    it('renders questions step with ProgressBar', () => {
      useFlowStore.setState({ step: 'questions', qIndex: 0 })
      mockUseQuery
        .mockReturnValueOnce({ data: [{ id: 'cat-1', name: 'Italiana' }], isLoading: false, isError: false })
        .mockReturnValueOnce({ data: mockRestaurants, isLoading: false, isError: false })
      render(<FlowPage />, { wrapper: TestWrapper })
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })

    it('renders Top5Grid when step is top5', () => {
      useFlowStore.setState({
        step: 'top5',
        top5: mockRestaurants,
      })
      mockUseQuery
        .mockReturnValueOnce({ data: [{ id: 'cat-1', name: 'Italiana' }], isLoading: false, isError: false })
        .mockReturnValueOnce({ data: mockRestaurants, isLoading: false, isError: false })
      render(<FlowPage />, { wrapper: TestWrapper })
      expect(screen.getByText(/opciones/)).toBeInTheDocument()
    })

    it('renders BattleView when step is battle', () => {
      useFlowStore.setState({
        step: 'battle',
        battleChampion: mockRestaurants[0],
        battleChallenger: mockRestaurants[1],
        battleRound: 1,
        top5: mockRestaurants,
      })
      mockUseQuery
        .mockReturnValueOnce({ data: [{ id: 'cat-1', name: 'Italiana' }], isLoading: false, isError: false })
        .mockReturnValueOnce({ data: mockRestaurants, isLoading: false, isError: false })
      render(<FlowPage />, { wrapper: TestWrapper })
      expect(screen.getByText('¿Cuál te convence más?')).toBeInTheDocument()
    })

    it('renders WinnerView when step is winner', () => {
      useFlowStore.setState({
        step: 'winner',
        winner: mockRestaurants[0],
      })
      mockUseQuery
        .mockReturnValueOnce({ data: [{ id: 'cat-1', name: 'Italiana' }], isLoading: false, isError: false })
        .mockReturnValueOnce({ data: mockRestaurants, isLoading: false, isError: false })
      render(<FlowPage />, { wrapper: TestWrapper })
      expect(screen.getByText('Tu restaurante ideal')).toBeInTheDocument()
    })
  })

  describe('English', () => {
    it('renders loading state in English', () => {
      useFlowStore.setState({ step: 'questions' })
      mockUseQuery.mockReturnValue({ data: undefined, isLoading: true, isError: false })
      render(<FlowPage />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText(/Finding the best restaurants/)).toBeInTheDocument()
    })

    it('renders error state in English', () => {
      useFlowStore.setState({ step: 'questions' })
      mockUseQuery.mockReturnValue({ data: undefined, isLoading: false, isError: true })
      render(<FlowPage />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText(/Oops, something went wrong/)).toBeInTheDocument()
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })

    it('renders empty state in English', () => {
      useFlowStore.setState({ step: 'questions' })
      mockUseQuery
        .mockReturnValueOnce({ data: [{ id: 'cat-1', name: 'Italiana' }], isLoading: false, isError: false })
        .mockReturnValueOnce({ data: [], isLoading: false, isError: false })
      render(<FlowPage />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText(/No restaurants in Valencia yet/)).toBeInTheDocument()
    })
  })
})
