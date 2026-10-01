import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
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

vi.mock('@/lib/tracking', () => ({
  trackSelection: vi.fn(),
  trackCta: vi.fn(),
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
      expect(screen.getAllByText('Elige tu favorito').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('¿Cuál te convence más?')).toBeInTheDocument()
      expect(screen.getAllByText('VS').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Champion').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Challenger').length).toBeGreaterThanOrEqual(1)
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
      expect(screen.getAllByText('Champion desc').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Challenger desc').length).toBeGreaterThanOrEqual(1)
    })

    it('shows Instagram link when restaurant has instagram_url', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      const igLinks = screen.getAllByText('Ver Instagram')
      expect(igLinks.length).toBeGreaterThanOrEqual(1)
      expect(igLinks[0].closest('a')).toHaveAttribute('href', 'https://instagram.com/challenger')
      expect(igLinks[0].closest('a')).toHaveAttribute('target', '_blank')
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
      const btn = screen.getAllByRole('button', { name: 'Elegir' })[0]
      fireEvent.click(btn)
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
      const btn = screen.getAllByRole('button', { name: 'Elegir' })[0]
      fireEvent.click(btn)
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
      const btns = screen.getAllByRole('button', { name: 'Elegir' })
      fireEvent.click(btns[0])
      if (btns[1]) fireEvent.click(btns[1])
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
      const imgs = screen.getAllByRole('img') as HTMLImageElement[]
      expect(imgs.length).toBeGreaterThanOrEqual(1)
      expect(imgs[0].src).toBe('https://example.com/img.jpg')
    })

    it('shows a photo carousel on each battle card when restaurants have photos', () => {
      const champ: Restaurant = {
        ...champion,
        photos: ['https://r2.example/restaurants/a/1.webp', 'https://r2.example/restaurants/a/2.webp'],
      }
      const chall: Restaurant = {
        ...challenger,
        photos: ['https://r2.example/restaurants/b/1.webp', 'https://r2.example/restaurants/b/2.webp'],
      }
      useFlowStore.setState({
        battleChampion: champ,
        battleChallenger: chall,
        battleRound: 1,
        top5: [champ, chall],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      expect(screen.getAllByTestId('photo-carousel').length).toBeGreaterThanOrEqual(2)
      expect(screen.getAllByRole('button', { name: 'Ver fotos en grande' }).length).toBeGreaterThanOrEqual(2)
      const imgs = screen.getAllByRole('img') as HTMLImageElement[]
      expect(imgs[0].src).toBe('https://r2.example/restaurants/a/1.webp')
    })

    it('navigates the battle card carousel without picking the card', () => {
      const champ: Restaurant = {
        ...champion,
        photos: ['https://r2.example/restaurants/a/1.webp', 'https://r2.example/restaurants/a/2.webp'],
      }
      useFlowStore.setState({
        battleChampion: champ,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champ, challenger],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      fireEvent.click(screen.getAllByRole('button', { name: 'Foto 2' })[0])
      expect((screen.getAllByRole('img') as HTMLImageElement[])[0].src).toBe('https://r2.example/restaurants/a/2.webp')
      expect(useFlowStore.getState().step).toBe('battle')
    })

    it('shows placeholder carousels when battle cards have no photos', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
      })
      const { container } = render(<BattleView />, { wrapper: TestWrapper })
      expect(screen.queryByTestId('photo-carousel')).not.toBeInTheDocument()
      expect(container.querySelectorAll('.lucide-utensils-crossed').length).toBeGreaterThanOrEqual(2)
    })

    it('marks the current round as active, not completed, in the progress bar', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 2,
        top5: [champion, challenger, { ...champion, id: 'c', name: 'C' }],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      expect(screen.getByTestId('round-bar-0')).toHaveAttribute('data-state', 'done')
      expect(screen.getByTestId('round-bar-1')).toHaveAttribute('data-state', 'active')
    })

    it('marks round one as active on the first round', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger, { ...champion, id: 'c', name: 'C' }],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      expect(screen.getByTestId('round-bar-0')).toHaveAttribute('data-state', 'active')
      expect(screen.getByTestId('round-bar-1')).toHaveAttribute('data-state', 'upcoming')
    })

    it('centers the first card by default', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      expect(screen.getByTestId('battle-slide-0')).toHaveClass('opacity-100')
      expect(screen.getByTestId('battle-slide-1')).toHaveClass('opacity-60')
    })

    it('does not expose the side card as a nested interactive role', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
      })
      const { container } = render(<BattleView />, { wrapper: TestWrapper })
      const sideCard = container.querySelector('[data-testid="battle-slide-1"]')
      expect(sideCard?.querySelector('[role="button"]')).toBeNull()
    })

    it('shows the placeholder hint only on the side card', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
      })
      const { container } = render(<BattleView />, { wrapper: TestWrapper })
      const side = container.querySelector('[data-testid="battle-slide-1"]')
      expect(side?.textContent).toContain('Desliza para ver')
    })

    it('brings the side card to center when tapped', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
      })
      const { container } = render(<BattleView />, { wrapper: TestWrapper })
      const sideCard = container.querySelector(
        '[data-testid="battle-slide-1"] .relative.flex.h-full'
      ) as HTMLElement
      fireEvent.click(sideCard)
      expect(screen.getByTestId('battle-slide-1')).toHaveClass('opacity-100')
      expect(screen.getByTestId('battle-slide-0')).toHaveClass('opacity-60')
      expect(useFlowStore.getState().step).toBe('battle')
    })

    it('moves to the next option when the dot is clicked', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      fireEvent.click(screen.getByRole('button', { name: 'Ver opción 2' }))
      expect(screen.getByTestId('battle-slide-1')).toHaveClass('opacity-100')
      expect(screen.getByTestId('battle-slide-0')).toHaveClass('opacity-60')
    })

    it('does not center the card when the Instagram link is tapped', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      fireEvent.click(screen.getAllByText('Ver Instagram')[0])
      expect(screen.getByTestId('battle-slide-0')).toHaveClass('opacity-100')
      expect(screen.getByTestId('battle-slide-1')).toHaveClass('opacity-60')
    })

    it('swipes to the next option on a horizontal drag', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
      })
      const { container } = render(<BattleView />, { wrapper: TestWrapper })
      const track = container.querySelector('[data-testid="battle-carousel"]') as HTMLElement
      fireEvent.pointerDown(track, { pointerId: 1, pointerType: 'touch', clientX: 300, clientY: 200 })
      fireEvent.pointerMove(track, { pointerId: 1, pointerType: 'touch', clientX: 200, clientY: 205 })
      fireEvent.pointerUp(track, { pointerId: 1, pointerType: 'touch', clientX: 180, clientY: 205 })
      expect(screen.getByTestId('battle-slide-1')).toHaveClass('opacity-100')
      expect(useFlowStore.getState().step).toBe('battle')
    })

    it('ignores a small horizontal drag', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
      })
      const { container } = render(<BattleView />, { wrapper: TestWrapper })
      const track = container.querySelector('[data-testid="battle-carousel"]') as HTMLElement
      fireEvent.pointerDown(track, { pointerId: 1, pointerType: 'touch', clientX: 300, clientY: 200 })
      fireEvent.pointerMove(track, { pointerId: 1, pointerType: 'touch', clientX: 290, clientY: 205 })
      fireEvent.pointerUp(track, { pointerId: 1, pointerType: 'touch', clientX: 285, clientY: 205 })
      expect(screen.getByTestId('battle-slide-0')).toHaveClass('opacity-100')
    })

    it('keeps the card in place on a vertical drag', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
      })
      const { container } = render(<BattleView />, { wrapper: TestWrapper })
      const track = container.querySelector('[data-testid="battle-carousel"]') as HTMLElement
      fireEvent.pointerDown(track, { pointerId: 1, pointerType: 'touch', clientX: 300, clientY: 400 })
      fireEvent.pointerMove(track, { pointerId: 1, pointerType: 'touch', clientX: 295, clientY: 300 })
      fireEvent.pointerUp(track, { pointerId: 1, pointerType: 'touch', clientX: 290, clientY: 200 })
      expect(screen.getByTestId('battle-slide-0')).toHaveClass('opacity-100')
      expect(screen.getByTestId('battle-slide-1')).toHaveClass('opacity-60')
    })

    it('applies no transform transition while dragging', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
      })
      const { container } = render(<BattleView />, { wrapper: TestWrapper })
      const track = container.querySelector('[data-testid="battle-carousel"]') as HTMLElement
      const inner = track.firstElementChild as HTMLElement
      fireEvent.pointerDown(track, { pointerId: 1, pointerType: 'touch', clientX: 300, clientY: 200 })
      fireEvent.pointerMove(track, { pointerId: 1, pointerType: 'touch', clientX: 240, clientY: 205 })
      expect(inner.style.transition).toBe('none')
      fireEvent.pointerUp(track, { pointerId: 1, pointerType: 'touch', clientX: 180, clientY: 205 })
      expect(inner.style.transition).toContain('transform')
    })

    it('resets to the first option on a new round', () => {
      const third: Restaurant = { ...champion, id: 'e', name: 'Third' }
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger, third],
        battlePool: [third],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      fireEvent.click(screen.getByRole('button', { name: 'Ver opción 2' }))
      expect(screen.getByTestId('battle-slide-1')).toHaveClass('opacity-100')
      fireEvent.click(screen.getAllByRole('button', { name: 'Elegir' })[0])
      act(() => { vi.advanceTimersByTime(400) })
      expect(screen.getByTestId('battle-slide-0')).toHaveClass('opacity-100')
      expect(screen.getByTestId('battle-slide-1')).toHaveClass('opacity-60')
    })

    it('shows price level on each card', () => {
      useFlowStore.setState({
        battleChampion: champion,
        battleChallenger: challenger,
        battleRound: 1,
        top5: [champion, challenger],
      })
      render(<BattleView />, { wrapper: TestWrapper })
      expect(screen.getAllByText('€').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('€€').length).toBeGreaterThanOrEqual(1)
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
      expect(screen.getAllByText('Choose your favorite').length).toBeGreaterThanOrEqual(1)
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
      expect(screen.getAllByText('View Instagram').length).toBeGreaterThanOrEqual(1)
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
