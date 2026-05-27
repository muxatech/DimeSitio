'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useFlowStore } from '@/store/flow-store'
import { shuffle } from '@/lib/utils'
import type { Category, Restaurant } from '@/types'
import LandingHero from '@/components/landing-hero'
import { QuestionCategories, QuestionPrice, QuestionZone } from '@/components/question-step'
import ProgressBar from '@/components/progress-bar'
import Top5Grid from '@/components/top5-grid'
import BattleView from '@/components/battle-view'
import WinnerView from '@/components/winner-view'
import { motion, AnimatePresence } from 'framer-motion'
import { trackImpression } from '@/lib/tracking'
import { getSessionId } from '@/lib/utils'

const QUESTIONS = ['categories', 'price', 'zone'] as const

export default function FlowPage() {
  const step = useFlowStore((s) => s.step)
  const { setStep, setFilteredRestaurants, setTop5, selectedCategoryIds, selectedPriceLevel, selectedZone } =
    useFlowStore()
  const [qIndex, setQIndex] = useState(0)

  useEffect(() => {
    if (step === 'landing') setQIndex(0)
  }, [step])

  const { data: categories, isLoading: catsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').order('name')
      return (data ?? []) as Category[]
    },
  })

  const { data: allRestaurants, isLoading: restLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data } = await supabase
        .from('restaurants')
        .select('*, restaurant_categories(category_id)')
        .eq('active', true)
      return (data ?? []) as Restaurant[]
    },
  })

  const zones = useMemo(() => {
    if (!allRestaurants) return []
    const unique = new Set(allRestaurants.map((r) => r.zone).filter(Boolean))
    return [...unique] as string[]
  }, [allRestaurants])

  function handleNextQuestion() {
    const next = qIndex + 1
    if (next >= QUESTIONS.length) {
      generateTop5()
      return
    }
    setQIndex(next)
  }

  function generateTop5() {
    if (!allRestaurants) return

    let filtered = [...allRestaurants]

    if (selectedCategoryIds.length > 0) {
      filtered = filtered.filter((r) =>
        r.restaurant_categories?.some((rc) => selectedCategoryIds.includes(rc.category_id))
      )
    }

    if (selectedPriceLevel !== null) {
      filtered = filtered.filter((r) => r.price_level === selectedPriceLevel)
    }

    if (selectedZone) {
      filtered = filtered.filter((r) => r.zone === selectedZone)
    }

    setFilteredRestaurants(filtered)

    const top = shuffle(filtered).slice(0, 5)
    setTop5(top)
    setStep('top5')
    const sid = getSessionId()
    for (const r of top) {
      trackImpression(r.id, sid)
    }
  }

  if (step === 'landing') return <LandingHero />

  if (catsLoading || restLoading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
      </div>
    )
  }

  const currentQuestion = QUESTIONS[qIndex]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step === 'questions' ? currentQuestion : step}
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -32 }}
        transition={{ duration: 0.2 }}
      >
        {step === 'questions' && (
          <div className="flex flex-col gap-6">
            <ProgressBar current={qIndex} total={QUESTIONS.length} />
            <p className="text-xs font-medium uppercase tracking-wider text-orange-500">
              Paso {qIndex + 1} de {QUESTIONS.length}
            </p>

            {currentQuestion === 'categories' && (
              <QuestionCategories categories={categories ?? []} onNext={handleNextQuestion} />
            )}
            {currentQuestion === 'price' && (
              <QuestionPrice onNext={handleNextQuestion} />
            )}
            {currentQuestion === 'zone' && (
              <QuestionZone zones={zones} onNext={handleNextQuestion} />
            )}
          </div>
        )}

        {step === 'top5' && <Top5Grid />}
        {step === 'battle' && <BattleView />}
        {step === 'winner' && <WinnerView />}
      </motion.div>
    </AnimatePresence>
  )
}
