'use client'

import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useFlowStore, type FlowDataState } from '@/store/flow-store'
import { shuffle, haversineDistance } from '@/lib/utils'
import { QUESTIONS } from '@/lib/constants'
import type { Category, Restaurant, FlowStep } from '@/types'
import LandingHero from '@/components/landing-hero'
import { QuestionCategoryGroups, QuestionPrice } from '@/components/question-step'
import ProgressBar from '@/components/progress-bar'
import Top5Grid from '@/components/top5-grid'
import BattleView from '@/components/battle-view'
import WinnerView from '@/components/winner-view'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { UtensilsCrossed } from 'lucide-react'
import { getSessionId } from '@/lib/utils'
import { useTranslations } from 'next-intl'

const QuestionLocation = dynamic(() => import('@/components/question-location'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-900" />
    </div>
  ),
})

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
}

const STORAGE_KEY = 'dimesitio-flow'
const FLOW_MARKER = '__dimesitio'

function persistFlowState() {
  const store = useFlowStore.getState()
  if (store.step === 'landing') {
    sessionStorage.removeItem(STORAGE_KEY)
    return
  }
  const data: FlowDataState = {
    step: store.step,
    sessionId: store.sessionId,
    qIndex: store.qIndex,
    selectedCategoryIds: store.selectedCategoryIds,
    selectedPriceLevel: store.selectedPriceLevel,
    selectedZoneIds: store.selectedZoneIds,
    locationCenter: store.locationCenter,
    locationRadius: store.locationRadius,
    filteredRestaurants: store.filteredRestaurants,
    top5: store.top5,
    battleChampion: store.battleChampion,
    battleChallenger: store.battleChallenger,
    battlePool: store.battlePool,
    battleRound: store.battleRound,
    winner: store.winner,
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function stepBack(store: ReturnType<typeof useFlowStore.getState>) {
  if (store.step === 'winner') {
    store.setStep('battle')
  } else if (store.step === 'battle') {
    store.setStep('top5')
  } else if (store.step === 'top5') {
    store.setStep('questions')
    store.setQIndex(QUESTIONS.length - 1)
  } else if (store.step === 'questions' && store.qIndex > 0) {
    store.setQIndex(store.qIndex - 1)
  } else if (store.step === 'questions') {
    store.setStep('landing')
  }
}

export default function FlowPage() {
  const t = useTranslations('FlowPage')
  const tCommon = useTranslations('Common')
  const step = useFlowStore((s) => s.step)
  const { setStep, setQIndex, setFilteredRestaurants, setTop5, setWinner, selectedCategoryIds, selectedPriceLevel, selectedZoneIds, locationCenter, locationRadius, setLocationCenter, setLocationRadius } =
    useFlowStore()
  const qIndex = useFlowStore((s) => s.qIndex)

  const initialized = useRef(false)
  const isPopState = useRef(false)
  const prevStep = useRef(step)

  // Hydrate from sessionStorage on mount and push initial history entry
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const saved = JSON.parse(raw) as FlowDataState
        useFlowStore.getState().hydrate(saved)
      } catch { /* ignore corrupt data */ }
    }

    const store = useFlowStore.getState()
    if (store.step !== 'landing') {
      history.replaceState({ [FLOW_MARKER]: true, step: store.step, qIndex: store.qIndex }, '')
    }
    initialized.current = true
  }, [])

  // Persist to sessionStorage on every state change
  useEffect(() => {
    persistFlowState()
  }, [step, qIndex, selectedCategoryIds, selectedPriceLevel, selectedZoneIds, locationCenter, locationRadius])

  // Push a history entry on forward navigation (not popState)
  // Replace on landing to prevent old flow entries from lingering
  useEffect(() => {
    if (!initialized.current) return

    if (isPopState.current) {
      isPopState.current = false
      prevStep.current = step
      return
    }

    if (step === 'landing' && prevStep.current !== 'landing') {
      history.replaceState(null, '')
    } else if (step !== 'landing') {
      history.pushState({ [FLOW_MARKER]: true, step, qIndex }, '')
    }
    prevStep.current = step
  }, [step, qIndex])

  // Scroll to top when entering the questions flow
  useEffect(() => {
    if (step !== 'landing') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

  // Scroll to top when changing questions
  useEffect(() => {
    if (step === 'questions') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [qIndex])

  // Back button — restore state from history
  useEffect(() => {
    function onPopState(e: PopStateEvent) {
      const state = e.state as Record<string, unknown> | null
      if (state?.[FLOW_MARKER]) {
        isPopState.current = true
        useFlowStore.getState().hydrate({
          step: state.step as FlowStep,
          qIndex: (state.qIndex as number) ?? 0,
        })
        persistFlowState()
      } else {
        // No flow marker → step back to landing if inside the flow
        const store = useFlowStore.getState()
        if (store.step !== 'landing') {
          isPopState.current = true
          stepBack(store)
          persistFlowState()
        }
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const { data: categories, isLoading: catsLoading, isError: catsError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('id, name').order('name')
      if (error) throw new Error(error.message)
      return (data ?? []) as Category[]
    },
  })

  const { data: allRestaurants, isLoading: restLoading, isError: restError } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*, restaurant_categories(category_id)')
        .eq('active', true)
        .order('is_demo', { ascending: true })
        .order('founder_rank', { ascending: true, nullsFirst: false })
      if (error) throw new Error(error.message)
      return (data ?? []) as Restaurant[]
    },
  })

  function handleNextQuestion() {
    const next = qIndex + 1
    if (next >= QUESTIONS.length) {
      generateTop5()
      return
    }
    setQIndex(next)
  }

  function handlePrevQuestion() {
    if (qIndex > 0) setQIndex(qIndex - 1)
    else setStep('landing')
  }

  function generateTop5() {
    if (!allRestaurants) return

    let filtered = [...new Map(allRestaurants.map((r) => [r.id, r])).values()]

    if (selectedCategoryIds.length > 0) {
      filtered = filtered.filter((r) => {
        const cats = r.restaurant_categories
        if (!cats) return false
        return cats.some((rc) => selectedCategoryIds.includes(rc.category_id))
      })
    }

    if (selectedPriceLevel !== null) {
      filtered = filtered.filter((r) => {
        if (r.price_level == null) return false
        return r.price_level === selectedPriceLevel
      })
    }

    if (selectedZoneIds.length > 0) {
      filtered = filtered.filter((r) => r.zone && selectedZoneIds.includes(r.zone))
    }

    if (locationCenter && locationRadius) {
      filtered = filtered.filter((r) => {
        if (r.lat == null || r.lng == null) return false
        const dist = haversineDistance(locationCenter.lat, locationCenter.lng, r.lat, r.lng)
        return dist <= locationRadius
      })
    }

    setFilteredRestaurants(filtered)

    const founders = filtered
      .filter(r => r.founder_rank != null)
      .sort((a, b) => (a.founder_rank ?? 0) - (b.founder_rank ?? 0))
    const regulars = shuffle(filtered.filter(r => !r.founder_rank && !r.is_demo))
    const demos = shuffle(filtered.filter(r => r.is_demo && r.founder_rank == null))

    const top = [...founders, ...regulars, ...demos].slice(0, 5)
    setTop5(top)
    if (top.length === 1) {
      setWinner(top[0])
      setStep('winner')
    } else {
      setStep('top5')
    }
  }

  if (step === 'landing') return <LandingHero />

  if (catsError || restError) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-stone-700 sm:text-lg">
            {t('errorTitle')}
          </p>
          <p className="max-w-xs text-sm text-stone-400">
            {t('errorDesc')}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-stone-800 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-stone-700"
          >
            {tCommon('retry')}
          </button>
        </div>
      </div>
    )
  }

  if (catsLoading || restLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-900" />
          <p className="text-sm text-stone-400">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (allRestaurants && allRestaurants.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100">
          <UtensilsCrossed className="h-7 w-7 text-stone-400" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-stone-700 sm:text-lg">{t('emptyTitle')}</p>
          <p className="max-w-xs text-sm text-stone-400">{t('emptyDesc')}</p>
        </div>
      </div>
    )
  }

  const currentQuestion = QUESTIONS[qIndex]

  return (
    <div className="relative min-h-dvh bg-white">
      <div className="mx-auto flex w-full max-w-2xl flex-col px-5 py-6 sm:px-8 sm:py-10 lg:max-w-4xl lg:px-12 lg:py-16 xl:max-w-5xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={step === 'questions' ? currentQuestion.key : step}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex-1"
          >
            {step === 'questions' && (
              <div className="flex flex-col gap-8 sm:gap-10 lg:gap-12">
                <ProgressBar
                  current={qIndex}
                  total={QUESTIONS.length}
                />

                {currentQuestion.key === 'categories' && (
                  <QuestionCategoryGroups
                    categories={categories ?? []}
                    onNext={handleNextQuestion}
                    onBack={handlePrevQuestion}
                  />
                )}
                {currentQuestion.key === 'price' && (
                  <QuestionPrice onNext={handleNextQuestion} onBack={handlePrevQuestion} />
                )}
                {currentQuestion.key === 'location' && (
                  <QuestionLocation
                    onNext={handleNextQuestion}
                    onBack={handlePrevQuestion}
                    locationCenter={locationCenter}
                    locationRadius={locationRadius}
                    onLocationChange={(center, radius) => {
                      setLocationCenter(center)
                      setLocationRadius(radius)
                    }}
                  />
                )}
              </div>
            )}

            {step === 'top5' && <Top5Grid />}
            {step === 'battle' && <BattleView />}
            {step === 'winner' && <WinnerView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
