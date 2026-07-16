import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Navbar from '@/components/navbar'
import { useFlowStore } from '@/store/flow-store'
import { TestWrapper } from '@/tests/helpers'
import type { Restaurant } from '@/types'

const mockPush = vi.fn()
const mockUsePathname = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockUsePathname(),
}))

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockUsePathname(),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => <div {...props}>{children}</div>,
    a: ({ children, ...props }: Record<string, unknown>) => <a {...props}>{children}</a>,
    button: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children}</button>,
  },
}))

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' '),
  getSessionId: () => 'mock-session-id',
}))

function makeWinner(): Restaurant {
  return { id: 'r-w', name: 'Winner', zone: 'centro', price_level: 2, active: true } as Restaurant
}

describe('Navbar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/')
    mockPush.mockClear()
    useFlowStore.setState({
      step: 'landing',
      winner: null,
      selectedCategoryIds: [],
      selectedPriceLevel: null,
      selectedZoneIds: [],
      filteredRestaurants: [],
      top5: [],
      battleChampion: null,
      battleChallenger: null,
      battlePool: [],
      battleRound: 0,
    })
  })

  describe('Spanish (default)', () => {
    it('Empezar button calls resetQuestionState and sets step to questions', () => {
      useFlowStore.setState({ winner: makeWinner(), step: 'winner' })
      render(<Navbar />, { wrapper: TestWrapper })

      const btn = screen.getByRole('button', { name: /empezar/i })
      btn.click()

      const state = useFlowStore.getState()
      expect(state.step).toBe('questions')
      expect(state.winner).toBeNull()
      expect(state.qIndex).toBe(0)
    })

    it('renders Spanish navigation links', () => {
      render(<Navbar />, { wrapper: TestWrapper })
      expect(screen.getByText('Inicio')).toBeInTheDocument()
      expect(screen.getByText('Para restaurantes')).toBeInTheDocument()
    })

    it('renders DimeSitio logo text', () => {
      render(<Navbar />, { wrapper: TestWrapper })
      expect(screen.getByText('DimeSitio')).toBeInTheDocument()
    })
  })

  describe('English', () => {
    it('renders English navigation links', () => {
      render(<Navbar />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('For restaurants')).toBeInTheDocument()
    })

    it('renders Start button in English', () => {
      render(<Navbar />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
    })

    it('Start button works in English', () => {
      useFlowStore.setState({ winner: makeWinner(), step: 'winner' })
      render(<Navbar />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })

      const btn = screen.getByRole('button', { name: /start/i })
      btn.click()

      const state = useFlowStore.getState()
      expect(state.step).toBe('questions')
      expect(state.winner).toBeNull()
    })

    it('renders DimeSitio in English too', () => {
      render(<Navbar />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText('DimeSitio')).toBeInTheDocument()
    })
  })
})
