'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useFlowStore } from '@/store/flow-store'
import { Frown, Swords, ArrowLeft } from 'lucide-react'

export default function Top5Grid() {
  const t = useTranslations('Top5')
  const { top5, initBattle, goBackToQuestions } = useFlowStore()

  if (top5.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <Frown className="h-12 w-12 text-stone-300" />
        <div className="space-y-1">
          <p className="text-base font-semibold text-stone-700 sm:text-lg">
            {t('emptyTitle')}
          </p>
          <p className="text-sm text-stone-400">
            {t('emptyDesc')}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={goBackToQuestions}
          className="inline-flex items-center gap-2 rounded-2xl bg-stone-800 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-stone-700 sm:px-8 sm:py-4 sm:text-lg"
        >
          <ArrowLeft className="h-5 w-5" />
          {t('changeFilters')}
        </motion.button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <div className="space-y-2 text-center">
        <p className="text-lg font-bold text-stone-900 sm:text-xl">
          {t('selected', { count: top5.length })}
        </p>
        <p className="text-sm text-stone-400 sm:text-base">
          {t('subtitle')}
        </p>
      </div>

      {top5.length >= 2 && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={initBattle}
          className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-stone-800 py-4 text-base font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700 sm:py-5 sm:text-lg"
        >
          <Swords className="h-5 w-5" />
          {t('chooseFavorite')}
        </motion.button>
      )}
    </div>
  )
}
