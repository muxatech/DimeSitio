import { create } from 'zustand'
import type { FlowStep, Restaurant } from '@/types'

export interface FlowDataState {
  step: FlowStep
  sessionId: string
  qIndex: number
  selectedCategoryIds: string[]
  selectedPriceLevel: number | null
  selectedZone: string | null
  filteredRestaurants: Restaurant[]
  top5: Restaurant[]
  battleChampion: Restaurant | null
  battleChallenger: Restaurant | null
  battlePool: Restaurant[]
  battleRound: number
  winner: Restaurant | null
}

interface FlowStore {
  step: FlowStep
  sessionId: string
  qIndex: number
  selectedCategoryIds: string[]
  selectedPriceLevel: number | null
  selectedZone: string | null
  filteredRestaurants: Restaurant[]
  top5: Restaurant[]
  battleChampion: Restaurant | null
  battleChallenger: Restaurant | null
  battlePool: Restaurant[]
  battleRound: number
  winner: Restaurant | null

  setStep: (step: FlowStep) => void
  setSessionId: (id: string) => void
  setQIndex: (index: number) => void
  setSelectedCategoryIds: (ids: string[]) => void
  setSelectedPriceLevel: (level: number | null) => void
  setSelectedZone: (zone: string | null) => void
  setFilteredRestaurants: (restaurants: Restaurant[]) => void
  setTop5: (restaurants: Restaurant[]) => void
  initBattle: () => void
  selectBattleWinner: (winner: Restaurant) => void
  setWinner: (restaurant: Restaurant) => void
  resetQuestionState: () => void
  goBackToQuestions: () => void
  reset: () => void
  hydrate: (state: Partial<FlowDataState>) => void
}

export const useFlowStore = create<FlowStore>((set, get) => ({
  step: 'landing',
  sessionId: '',
  qIndex: 0,
  selectedCategoryIds: [],
  selectedPriceLevel: null,
  selectedZone: null,
  filteredRestaurants: [],
  top5: [],
  battleChampion: null,
  battleChallenger: null,
  battlePool: [],
  battleRound: 0,
  winner: null,

  setStep: (step) => set({ step }),

  setSessionId: (id) => set({ sessionId: id }),

  setQIndex: (index) => set({ qIndex: index }),

  setSelectedCategoryIds: (ids) => set({ selectedCategoryIds: ids }),

  setSelectedPriceLevel: (level) => set({ selectedPriceLevel: level }),

  setSelectedZone: (zone) => set({ selectedZone: zone }),

  setFilteredRestaurants: (restaurants) => set({ filteredRestaurants: restaurants }),

  setTop5: (restaurants) => set({ top5: restaurants }),

  initBattle: () => {
    const { top5 } = get()
    if (top5.length < 2) return

    const pool = [...top5]
    const champion = pool.shift()!
    const challenger = pool.shift()!

    set({
      step: 'battle',
      battleChampion: champion,
      battleChallenger: challenger,
      battlePool: pool,
      battleRound: 1,
      winner: null,
    })
  },

  selectBattleWinner: (winner) => {
    const state = get()
    const pool = [...state.battlePool]

    if (pool.length === 0) {
      set({
        winner,
        step: 'winner',
        battleChampion: null,
        battleChallenger: null,
        battlePool: [],
      })
      return
    }

    const nextChallenger = pool.shift()!
    set({
      battleChampion: winner,
      battleChallenger: nextChallenger,
      battlePool: pool,
      battleRound: state.battleRound + 1,
    })
  },

  setWinner: (restaurant) => set({ winner: restaurant, step: 'winner' }),

  resetQuestionState: () =>
    set({
      qIndex: 0,
      selectedCategoryIds: [],
      selectedPriceLevel: null,
      selectedZone: null,
      filteredRestaurants: [],
      top5: [],
      battleChampion: null,
      battleChallenger: null,
      battlePool: [],
      battleRound: 0,
    }),

  goBackToQuestions: () => set({ step: 'questions', qIndex: 0 }),

  reset: () =>
    set({
      step: 'landing',
      sessionId: '',
      qIndex: 0,
      selectedCategoryIds: [],
      selectedPriceLevel: null,
      selectedZone: null,
      filteredRestaurants: [],
      top5: [],
      battleChampion: null,
      battleChallenger: null,
      battlePool: [],
      battleRound: 0,
      winner: null,
    }),

  hydrate: (state) => set(state),
}))
