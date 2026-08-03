import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BattleView from '@/components/battle-view'
import { useFlowStore } from '@/store/flow-store'
import { TestWrapper } from '@/tests/helpers'
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

const champion: Restaurant = {
  id: 'a', owner_id: null, name: 'Champion', description: 'Champion desc',
  phone: null, address: null, city: 'Valencia', lat: null, lng: null,
  price_level: 1, image_url: null, menu_url: null, reservations_url: null,
  instagram_url: null, google_maps_url: null, zone: 'centro', active: true,
}

const challenger: Restaurant = {
  id: 'b', owner_id: null, name: 'Challenger', description: 'Challenger desc',
  phone: null, address: null, city: 'Valencia', lat: null, lng: null,
  price_level: 2, image_url: null, menu_url: null, reservations_url: null,
  instagram_url: 'https://instagram.com/challenger', google_maps_url: null, zone: 'russafa', active: true,
}

const founderRestaurant: Restaurant = {
  ...champion, id: 'c', name: 'Founder Rest', founder_rank: 1,
}

const demoRestaurant: Restaurant = {
  ...champion, id: 'd', name: 'Demo Rest', is_demo: true,
}

describe('BattleView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useFlowStore.setState({
      step: 'battle',
      battleChampion: null,
      battleChallenger: null,
      battlePool: [],
      battleRound: 0,
      top5: [],
      winner: null,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Spanish (default)', () => {
    it('shows error state when no champion or challenger', () => {
      render(<BattleView />, { wrapper: TestWrapper })
      expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
      expect(screen.getByText('No pudimos cargar la comparación. Vuelve a empezar.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /volver a empezar/i })).toBeInTheDocument()
    })

    it('reset button goes back to landing', () => {
      render(<BattleView />, { wrapper: TestWrapper })
      const btn = screen.getByRole('button', { name: /volver a empezar/i })
      btn.click()
      expect(useFlowStore.getState().step).toBe('landing')
    })

    it('renders battle UI with champion and challenger', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      expect(screen.getByText('Elige tu favorito')).toBeInTheDocument()
      expect(screen.getByText('¿Cuál te convence más?')).toBeInTheDocument()
      expect(screen.getByText('VS')).toBeInTheDocument()
      expect(screen.getByText('Champion')).toBeInTheDocument()
      expect(screen.getByText('Challenger')).toBeInTheDocument()
    })

    it('shows round counter', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 2,
        top5: [champion, challenger, { ...champion, id: 'c', name: 'C' }],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      expect(screen.getByText(/Ronda 2 de 2/)).toBeInTheDocument()
    })

    it('shows description on cards', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      expect(screen.getByText('Champion desc')).toBeInTheDocument()
      expect(screen.getByText('Challenger desc')).toBeInTheDocument()
    })

    it('shows Instagram link when restaurant has instagram_url', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      const igLink = screen.getByText('Ver Instagram')
      expect(igLink).toBeInTheDocument()
      expect(igLink.closest('a')).toHaveAttribute('href', 'https://instagram.com/challenger')
      expect(igLink.closest('a')).toHaveAttribute('target', '_blank')
    })

    it('does not show Instagram link when restaurant has no instagram_url', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: { ...challenger, instagram_url: null },
        battleRound: 1,
        top5: [champion, { ...challenger, instagram_url: null }],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      expect(screen.queryByText('Ver Instagram')).not.toBeInTheDocument()
    })

    it('shows Fundador badge for founder restaurant', () => {
      useFlowStore.setState({
        battleChampion: founderRestaurant,
        battleChallenger: champion,
        battleRound: 1,
        top5: [founderRestaurant, champion],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      const badges = screen.getAllByText('Fundador')
      expect(badges.length).toBeGreaterThanOrEqual(1)
    })

    it('shows Demo badge for demo restaurant', () => {
      useFlowStore.setState({
        battleChampion: demoRestaurant,
        battleChallenger: champion,
        battleRound: 1,
        top5: [demoRestaurant, champion],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      const badges = screen.getAllByText('Demo')
      expect(badges.length).toBeGreaterThanOrEqual(1)
    })

    it('advances battle when clicking a card', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
        battlePool: [],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      const card = screen.getByText('Champion')
      fireEvent.click(card.closest('[role="button"]')!)
      vi.advanceTimersByTime(400)
      const state = useFlowStore.getState()
      expect(state.step).toBe('winner')
      expect(state.winner?.id).toBe('a')
    })

    it('continues to next round when pool has more items', () => {
      const third: Restaurant = { ...champion, id: 'e', name: 'Third' }
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger, third],
        battlePool: [third],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      const card = screen.getByText('Champion')
      fireEvent.click(card.closest('[role="button"]')!)
      vi.advanceTimersByTime(400)
      const state = useFlowStore.getState()
      expect(state.step).toBe('battle')
      expect(state.battleRound).toBe(2)
      expect(state.battleChampion?.id).toBe('a')
      expect(state.battleChallenger?.id).toBe('e')
    })

    it('prevents double-click during picking animation', () => {
      const third: Restaurant = { ...champion, id: 'e', name: 'Third' }
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger, third],
        battlePool: [third],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      const cardA = screen.getByText('Champion')
      const cardB = screen.getByText('Challenger')
      fireEvent.click(cardA.closest('[role="button"]')!)
      fireEvent.click(cardB.closest('[role="button"]')!)
      vi.advanceTimersByTime(400)
      const state = useFlowStore.getState()
      expect(state.battleChampion?.id).toBe('a')
    })

    it('shows image when restaurant has image_url', () => {
      const withImage: Restaurant = {
        ...champion,
        image_url: 'https://example.com/img.jpg',
      }
      useFlowStore.setState({
        battleChampion: withImage,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [withImage, challenger],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      const img = screen.getByRole('img') as HTMLImageElement
      expect(img).toBeInTheDocument()
      expect(img.src).toBe('https://example.com/img.jpg')
    })

    it('shows price level on each card', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      expect(screen.getByText('€')).toBeInTheDocument()
      expect(screen.getByText('€€')).toBeInTheDocument()
    })
  })

  describe('English', () => {
    it('shows error state in English', () => {
      render(<BattleView />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('We couldn\'t load the matchup. Start over.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /start over/i })).toBeInTheDocument()
    })

    it('renders battle UI in English', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
      })
      render(<BattleView />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText('Choose your favorite')).toBeInTheDocument()
      expect(screen.getByText('Which one convinces you more?')).toBeInTheDocument()
      expect(screen.getByText('Round 1 of 1')).toBeInTheDocument()
    })

    it('shows Instagram link in English', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
      })
      render(<BattleView />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText('View Instagram')).toBeInTheDocument()
    })

    it('shows Founder badge in English', () => {
      useFlowStore.setState({
        battleChampion: founderRestaurant,
        battleChallenger: champion,
        battleRound: 1,
        top5: [founderRestaurant, champion],
      })
      render(<BattleView />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      const badges = screen.getAllByText('Founder')
      expect(badges.length).toBeGreaterThanOrEqual(1)
    })

    it('shows Demo badge in English', () => {
      useFlowStore.setState({
        battleChampion: demoRestaurant,
        battleChallenger: champion,
        battleRound: 1,
        top5: [demoRestaurant, champion],
      })
      render(<BattleView />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      const badges = screen.getAllByText('Demo')
      expect(badges.length).toBeGreaterThanOrEqual(1)
    })
  })
})
