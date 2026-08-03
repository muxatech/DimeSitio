'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useFlowStore } from '@/store/flow-store'
import { getPriceLabel } from '@/lib/utils'
import type { Restaurant } from '@/types'
import { MapPin, Sparkles, Swords, RotateCcw, Crown } from 'lucide-react'
import PhotoCarousel from '@/components/photo-carousel'

export default function BattleView() {
  const t = useTranslations('Battle')
  const tCommon = useTranslations('Common')
  const { battleChampion, battleChallenger, battleRound, selectBattleWinner, reset } = useFlowStore()
  const [picking, setPicking] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const totalRounds = useFlowStore((s) => s.top5.length) - 1

  if (!battleChampion || !battleChallenger) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-base font-semibold text-stone-700 sm:text-lg">{tCommon('error')}</p>
        <p className="max-w-xs text-sm text-stone-400">{t('errorDesc')}</p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-2xl bg-stone-800 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-stone-700"
        >
          <RotateCcw className="h-5 w-5" />
          {tCommon('startOver')}
        </button>
      </div>
    )
  }

  function handlePick(winner: Restaurant) {
    if (picking) return
    setPicking(true)
    setSelectedId(winner.id)
    setTimeout(() => {
      selectBattleWinner(winner)
      setSelectedId(null)
      setPicking(false)
    }, 400)
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-700">
            <Swords className="h-3.5 w-3.5" />
            {t('chooseFavorite')}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl lg:text-3xl">
            {t('question')}
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white sm:self-auto sm:px-4 sm:py-1.5 sm:text-sm">
          <Sparkles className="h-3 w-3" />
          {t('round', { current: battleRound, total: totalRounds })}
        </span>
      </div>

      <div className="flex gap-2 sm:gap-3">
        {Array.from({ length: totalRounds }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 sm:h-2 ${
              i < battleRound ? 'bg-stone-900' : 'bg-stone-200'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={battleRound}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6 lg:gap-8"
        >
          <BattleCard
            restaurant={battleChampion}
            onPick={handlePick}
            isSelected={selectedId === battleChampion.id}
          />

          <div className="flex items-center gap-3 sm:flex-col sm:py-16 sm:pt-20">
            <div className="h-px flex-1 bg-stone-200 sm:h-16 sm:w-px sm:flex-none" />
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white shadow-md sm:h-12 sm:w-12 sm:text-sm">
              VS
            </span>
            <div className="h-px flex-1 bg-stone-200 sm:h-16 sm:w-px sm:flex-none" />
          </div>

          <BattleCard
            restaurant={battleChallenger}
            onPick={handlePick}
            isSelected={selectedId === battleChallenger.id}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function BattleCard({
  restaurant,
  onPick,
  isSelected,
}: {
  restaurant: Restaurant
  onPick: (r: Restaurant) => void
  isSelected: boolean
}) {
  const tCommon = useTranslations('Common')

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => onPick(restaurant)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPick(restaurant)
        }
      }}
      className={`relative w-full cursor-pointer overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all sm:flex-1 ${
        isSelected
          ? 'border-stone-900 ring-2 ring-stone-200 ring-offset-2'
          : 'border-stone-200 hover:shadow-md'
      }`}
    >
      <div className="relative h-44 bg-stone-100 sm:h-52 lg:h-64">
        <PhotoCarousel
          photos={restaurant.photos?.length
            ? restaurant.photos
            : restaurant.image_url
              ? [restaurant.image_url]
              : []}
          name={restaurant.name}
        />
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-900 shadow-lg sm:h-20 sm:w-20"
            >
              <svg className="h-8 w-8 text-white sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          </div>
        )}
        <div className="absolute right-2 top-2 flex flex-col gap-1">
          {restaurant.founder_rank && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 shadow-sm" title={tCommon('founder')}>
              <Crown className="h-3 w-3" />
              {tCommon('founder')}
            </span>
          )}
          {restaurant.is_demo && (
            <span className="rounded-md bg-stone-200/80 px-2 py-0.5 text-[10px] font-medium text-stone-500 backdrop-blur-sm">
              {tCommon('demo')}
            </span>
          )}
        </div>
      </div>
      <div className="space-y-1.5 p-4 sm:p-5 lg:p-6">
        <h3 className="text-lg font-bold text-stone-900 sm:text-xl lg:text-2xl">
          {restaurant.name}
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-sm text-stone-400 sm:text-base">
          {restaurant.zone && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {restaurant.zone}
            </span>
          )}
          <span>{getPriceLabel(restaurant.price_level)}</span>
        </div>
        {restaurant.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-stone-400 sm:text-base">
            {restaurant.description}
          </p>
        )}
        {restaurant.instagram_url && (
          <div className="flex justify-end">
            <a
              href={restaurant.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-pink-50 px-3 py-1.5 text-sm font-medium text-pink-700 shadow-sm transition-all hover:bg-pink-100 hover:text-pink-800 hover:shadow-md"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-current" aria-label="Instagram">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              {tCommon('viewInstagram')}
            </a>
          </div>
        )}
      </div>
    </motion.div>
  )
}
