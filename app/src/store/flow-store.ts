import { create } from 'zustand'
import type { FlowStep, Restaurant } from '@/types'

export interface LocationCenter {
  lat: number
  lng: number
}

export interface FlowDataState {
  step: FlowStep
  sessionId: string
  qIndex: number
  selectedCategoryIds: string[]
  selectedPriceLevel: number | null
  selectedZoneIds: string[]
  locationCenter: LocationCenter | null
  locationRadius: number | null
  filteredRestaurants: Restaurant[]
  top5: Restaurant[]
  favoriteId: string | null
  winner: Restaurant | null
}

interface FlowStore {
  step: FlowStep
  sessionId: string
  qIndex: number
  selectedCategoryIds: string[]
  selectedPriceLevel: number | null
  selectedZoneIds: string[]
  locationCenter: LocationCenter | null
  locationRadius: number | null
  filteredRestaurants: Restaurant[]
  top5: Restaurant[]
  favoriteId: string | null
  winner: Restaurant | null

  setStep: (step: FlowStep) => void
  setSessionId: (id: string) => void
  setQIndex: (index: number) => void
  setSelectedCategoryIds: (ids: string[]) => void
  setSelectedPriceLevel: (level: number | null) => void
  setSelectedZoneIds: (ids: string[]) => void
  setLocationCenter: (center: LocationCenter | null) => void
  setLocationRadius: (radius: number | null) => void
  setFilteredRestaurants: (restaurants: Restaurant[]) => void
  setTop5: (restaurants: Restaurant[]) => void
  setFavorite: (id: string | null) => void
  confirmFavorite: () => void
  setWinner: (restaurant: Restaurant) => void
  resetQuestionState: () => void
  goBackToQuestions: () => void
  startNewFlow: () => void
  reset: () => void
  hydrate: (state: Partial<FlowDataState>) => void
}

export const useFlowStore = create<FlowStore>((set, get) => ({
  step: 'landing',
  sessionId: '',
  qIndex: 0,
  selectedCategoryIds: [],
  selectedPriceLevel: null,
  selectedZoneIds: [],
  locationCenter: null,
  locationRadius: null,
  filteredRestaurants: [],
  top5: [],
  favoriteId: null,
  winner: null,

  setStep: (step) => set({ step }),

  setSessionId: (id) => set({ sessionId: id }),

  setQIndex: (index) => set({ qIndex: index }),

  setSelectedCategoryIds: (ids) => set({ selectedCategoryIds: ids }),

  setSelectedPriceLevel: (level) => set({ selectedPriceLevel: level }),

  setSelectedZoneIds: (ids) => set({ selectedZoneIds: ids }),

  setLocationCenter: (center) => set({ locationCenter: center }),

  setLocationRadius: (radius) => set({ locationRadius: radius }),

  setFilteredRestaurants: (restaurants) => set({ filteredRestaurants: restaurants }),

  setTop5: (restaurants) => set({ top5: restaurants }),

  setFavorite: (id) => set({ favoriteId: id }),

  confirmFavorite: () => {
    const { top5, favoriteId } = get()
    const winner = top5.find((r) => r.id === favoriteId)
    if (!winner) return
    set({ winner, step: 'winner' })
  },

  setWinner: (restaurant) => set({ winner: restaurant, step: 'winner' }),

  resetQuestionState: () =>
    set({
      qIndex: 0,
      selectedCategoryIds: [],
      selectedPriceLevel: null,
      selectedZoneIds: [],
      locationCenter: null,
      locationRadius: null,
      filteredRestaurants: [],
      top5: [],
      favoriteId: null,
      winner: null,
    }),

  goBackToQuestions: () => set({ step: 'questions', qIndex: 0 }),

  startNewFlow: () =>
    set({
      step: 'questions',
      sessionId: '',
      qIndex: 0,
      selectedCategoryIds: [],
      selectedPriceLevel: null,
      selectedZoneIds: [],
      locationCenter: null,
      locationRadius: null,
      filteredRestaurants: [],
      top5: [],
      favoriteId: null,
      winner: null,
    }),

  reset: () =>
    set({
      step: 'landing',
      sessionId: '',
      qIndex: 0,
      selectedCategoryIds: [],
      selectedPriceLevel: null,
      selectedZoneIds: [],
      locationCenter: null,
      locationRadius: null,
      filteredRestaurants: [],
      top5: [],
      favoriteId: null,
      winner: null,
    }),

  hydrate: (state) => set(state),
}))
