import { describe, it, expect, beforeEach } from 'vitest'
import { useFlowStore } from '@/store/flow-store'
import type { Restaurant } from '@/types'

function makeRestaurant(id: string): Restaurant {
  return { id, name: `Rest ${id}`, zone: 'centro', price_level: 2, active: true } as Restaurant
}

describe('flow-store', () => {
  beforeEach(() => {
    useFlowStore.getState().reset()
  })

  it('starts at landing step', () => {
    expect(useFlowStore.getState().step).toBe('landing')
  })

  it('sets step', () => {
    useFlowStore.getState().setStep('questions')
    expect(useFlowStore.getState().step).toBe('questions')
  })

  it('sets session id', () => {
    useFlowStore.getState().setSessionId('abc-123')
    expect(useFlowStore.getState().sessionId).toBe('abc-123')
  })

  it('sets question index', () => {
    useFlowStore.getState().setQIndex(2)
    expect(useFlowStore.getState().qIndex).toBe(2)
  })

  it('sets selected category ids', () => {
    useFlowStore.getState().setSelectedCategoryIds(['cat-1', 'cat-2'])
    expect(useFlowStore.getState().selectedCategoryIds).toEqual(['cat-1', 'cat-2'])
  })

  it('sets price level', () => {
    useFlowStore.getState().setSelectedPriceLevel(2)
    expect(useFlowStore.getState().selectedPriceLevel).toBe(2)
  })

  it('sets selected zone ids', () => {
    useFlowStore.getState().setSelectedZoneIds(['centro'])
    expect(useFlowStore.getState().selectedZoneIds).toEqual(['centro'])
  })

  it('sets location center', () => {
    const center = { lat: 39.4699, lng: -0.3763 }
    useFlowStore.getState().setLocationCenter(center)
    expect(useFlowStore.getState().locationCenter).toEqual(center)
  })

  it('sets location radius', () => {
    useFlowStore.getState().setLocationRadius(1000)
    expect(useFlowStore.getState().locationRadius).toBe(1000)
  })

  it('sets filtered restaurants', () => {
    const r = [makeRestaurant('a')]
    useFlowStore.getState().setFilteredRestaurants(r)
    expect(useFlowStore.getState().filteredRestaurants).toEqual(r)
  })

  it('sets top5', () => {
    const r = [makeRestaurant('a'), makeRestaurant('b')]
    useFlowStore.getState().setTop5(r)
    expect(useFlowStore.getState().top5).toEqual(r)
  })

  it('setFavorite stores the picked id', () => {
    useFlowStore.getState().setFavorite('b')
    expect(useFlowStore.getState().favoriteId).toBe('b')
  })

  it('setFavorite accepts null to clear the selection', () => {
    useFlowStore.getState().setFavorite('b')
    useFlowStore.getState().setFavorite(null)
    expect(useFlowStore.getState().favoriteId).toBeNull()
  })

  it('confirmFavorite declares the selected top5 as winner', () => {
    const r = [makeRestaurant('a'), makeRestaurant('b'), makeRestaurant('c')]
    useFlowStore.getState().setTop5(r)
    useFlowStore.getState().setFavorite('c')

    useFlowStore.getState().confirmFavorite()
    const state = useFlowStore.getState()
    expect(state.step).toBe('winner')
    expect(state.winner?.id).toBe('c')
  })

  it('confirmFavorite does nothing without a selection', () => {
    useFlowStore.getState().setTop5([makeRestaurant('a'), makeRestaurant('b')])

    useFlowStore.getState().confirmFavorite()
    const state = useFlowStore.getState()
    expect(state.step).not.toBe('winner')
    expect(state.winner).toBeNull()
  })

  it('confirmFavorite does nothing when the favorite is not in top5', () => {
    useFlowStore.getState().setTop5([makeRestaurant('a'), makeRestaurant('b')])
    useFlowStore.getState().setFavorite('ghost')

    useFlowStore.getState().confirmFavorite()
    expect(useFlowStore.getState().winner).toBeNull()
  })

  it('setWinner sets winner and step', () => {
    const r = makeRestaurant('a')
    useFlowStore.getState().setWinner(r)
    const state = useFlowStore.getState()
    expect(state.winner?.id).toBe('a')
    expect(state.step).toBe('winner')
  })

  it('resetQuestionState resets question-related fields', () => {
    useFlowStore.getState().setQIndex(3)
    useFlowStore.getState().setSelectedCategoryIds(['cat-1'])
    useFlowStore.getState().setSelectedPriceLevel(2)
    useFlowStore.getState().setSelectedZoneIds(['centro'])
    useFlowStore.getState().setLocationCenter({ lat: 39.4699, lng: -0.3763 })
    useFlowStore.getState().setLocationRadius(1000)
    useFlowStore.getState().setFilteredRestaurants([makeRestaurant('a')])
    useFlowStore.getState().setTop5([makeRestaurant('a')])
    useFlowStore.getState().setWinner(makeRestaurant('w'))

    useFlowStore.getState().resetQuestionState()

    const state = useFlowStore.getState()
    expect(state.qIndex).toBe(0)
    expect(state.selectedCategoryIds).toEqual([])
    expect(state.selectedPriceLevel).toBeNull()
    expect(state.selectedZoneIds).toEqual([])
    expect(state.locationCenter).toBeNull()
    expect(state.locationRadius).toBeNull()
    expect(state.filteredRestaurants).toEqual([])
    expect(state.top5).toEqual([])
    expect(state.winner).toBeNull()
  })

  it('resetQuestionState clears winner', () => {
    useFlowStore.getState().setWinner(makeRestaurant('w'))
    expect(useFlowStore.getState().winner).not.toBeNull()

    useFlowStore.getState().resetQuestionState()
    expect(useFlowStore.getState().winner).toBeNull()
  })

  it('goBackToQuestions sets step to questions and qIndex to 0', () => {
    useFlowStore.getState().setStep('top5')
    useFlowStore.getState().goBackToQuestions()

    expect(useFlowStore.getState().step).toBe('questions')
    expect(useFlowStore.getState().qIndex).toBe(0)
  })

  it('hydrate restores partial state', () => {
    useFlowStore.getState().hydrate({
      step: 'top5',
      qIndex: 2,
      locationCenter: { lat: 39.4699, lng: -0.3763 },
      locationRadius: 2000,
    })
    const state = useFlowStore.getState()
    expect(state.step).toBe('top5')
    expect(state.qIndex).toBe(2)
    expect(state.locationCenter).toEqual({ lat: 39.4699, lng: -0.3763 })
    expect(state.locationRadius).toBe(2000)
  })

  it('reset returns to initial state', () => {
    useFlowStore.getState().setStep('winner')
    useFlowStore.getState().setSessionId('test-session')
    useFlowStore.getState().setSelectedCategoryIds(['cat-1'])
    useFlowStore.getState().setLocationCenter({ lat: 39.4699, lng: -0.3763 })
    useFlowStore.getState().setLocationRadius(1000)

    useFlowStore.getState().reset()

    const state = useFlowStore.getState()
    expect(state.step).toBe('landing')
    expect(state.sessionId).toBe('')
    expect(state.selectedCategoryIds).toEqual([])
    expect(state.locationCenter).toBeNull()
    expect(state.locationRadius).toBeNull()
  })

  it('startNewFlow sets step to questions and resets all fields', () => {
    useFlowStore.getState().setStep('winner')
    useFlowStore.getState().setWinner(makeRestaurant('w'))
    useFlowStore.getState().setSessionId('old-session')
    useFlowStore.getState().setSelectedCategoryIds(['cat-1'])
    useFlowStore.getState().setTop5([makeRestaurant('a')])
    useFlowStore.getState().setLocationCenter({ lat: 39.4699, lng: -0.3763 })
    useFlowStore.getState().setLocationRadius(1000)

    useFlowStore.getState().startNewFlow()

    const state = useFlowStore.getState()
    expect(state.step).toBe('questions')
    expect(state.winner).toBeNull()
    expect(state.sessionId).toBe('')
    expect(state.qIndex).toBe(0)
    expect(state.selectedCategoryIds).toEqual([])
    expect(state.top5).toEqual([])
    expect(state.locationCenter).toBeNull()
    expect(state.locationRadius).toBeNull()
    expect(state.favoriteId).toBeNull()
  })
})
