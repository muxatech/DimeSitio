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

  it('initBattle moves to battle step with champion and challenger', () => {
    const r = [makeRestaurant('a'), makeRestaurant('b'), makeRestaurant('c')]
    useFlowStore.getState().setTop5(r)
    useFlowStore.getState().initBattle()

    const state = useFlowStore.getState()
    expect(state.step).toBe('battle')
    expect(state.battleChampion?.id).toBe('a')
    expect(state.battleChallenger?.id).toBe('b')
    expect(state.battlePool).toHaveLength(1)
    expect(state.battleRound).toBe(1)
  })

  it('initBattle does nothing with less than 2 top5', () => {
    useFlowStore.getState().setTop5([makeRestaurant('a')])
    useFlowStore.getState().initBattle()

    expect(useFlowStore.getState().step).not.toBe('battle')
  })

  it('selectBattleWinner declares winner when pool is empty', () => {
    const r = [makeRestaurant('a'), makeRestaurant('b')]
    useFlowStore.getState().setTop5(r)
    useFlowStore.getState().initBattle()

    useFlowStore.getState().selectBattleWinner(r[0])
    const state = useFlowStore.getState()
    expect(state.step).toBe('winner')
    expect(state.winner?.id).toBe('a')
  })

  it('selectBattleWinner continues with next challenger when pool has items', () => {
    const r = [makeRestaurant('a'), makeRestaurant('b'), makeRestaurant('c')]
    useFlowStore.getState().setTop5(r)
    useFlowStore.getState().initBattle()

    useFlowStore.getState().selectBattleWinner(r[0])
    const state = useFlowStore.getState()
    expect(state.step).toBe('battle')
    expect(state.battleChampion?.id).toBe('a')
    expect(state.battleChallenger?.id).toBe('c')
    expect(state.battleRound).toBe(2)
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
    useFlowStore.getState().setFilteredRestaurants([makeRestaurant('a')])
    useFlowStore.getState().setTop5([makeRestaurant('a')])
    useFlowStore.getState().setWinner(makeRestaurant('w'))

    useFlowStore.getState().resetQuestionState()

    const state = useFlowStore.getState()
    expect(state.qIndex).toBe(0)
    expect(state.selectedCategoryIds).toEqual([])
    expect(state.selectedPriceLevel).toBeNull()
    expect(state.selectedZoneIds).toEqual([])
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
    useFlowStore.getState().hydrate({ step: 'battle', qIndex: 2 })
    const state = useFlowStore.getState()
    expect(state.step).toBe('battle')
    expect(state.qIndex).toBe(2)
  })

  it('reset returns to initial state', () => {
    useFlowStore.getState().setStep('winner')
    useFlowStore.getState().setSessionId('test-session')
    useFlowStore.getState().setSelectedCategoryIds(['cat-1'])

    useFlowStore.getState().reset()

    const state = useFlowStore.getState()
    expect(state.step).toBe('landing')
    expect(state.sessionId).toBe('')
    expect(state.selectedCategoryIds).toEqual([])
  })

  it('startNewFlow sets step to questions and resets all fields', () => {
    useFlowStore.getState().setStep('winner')
    useFlowStore.getState().setWinner(makeRestaurant('w'))
    useFlowStore.getState().setSessionId('old-session')
    useFlowStore.getState().setSelectedCategoryIds(['cat-1'])
    useFlowStore.getState().setTop5([makeRestaurant('a')])

    useFlowStore.getState().startNewFlow()

    const state = useFlowStore.getState()
    expect(state.step).toBe('questions')
    expect(state.winner).toBeNull()
    expect(state.sessionId).toBe('')
    expect(state.qIndex).toBe(0)
    expect(state.selectedCategoryIds).toEqual([])
    expect(state.top5).toEqual([])
    expect(state.battleChampion).toBeNull()
    expect(state.battlePool).toEqual([])
    expect(state.battleRound).toBe(0)
  })
})
