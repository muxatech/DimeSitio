import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Navbar from '@/components/navbar'
import { useFlowStore } from '@/store/flow-store'
import type { Restaurant } from '@/types'

const mockPush = vi.fn()
const mockUsePathname = vi.fn()

vi.mock('next/navigation', () => ({
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

  it('Empezar button calls resetQuestionState and sets step to questions', () => {
    // Set a stale winner to verify it gets cleared
    useFlowStore.setState({ winner: makeWinner(), step: 'winner' })

    render(<Navbar />)

    const btn = screen.getByRole('button', { name: /empezar/i })
    btn.click()

    const state = useFlowStore.getState()
    expect(state.step).toBe('questions')
    expect(state.winner).toBeNull()
    expect(state.qIndex).toBe(0)
  })
})
