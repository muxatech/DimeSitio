'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useFlowStore } from '@/store/flow-store'
import { getPriceLabel } from '@/lib/utils'
import { trackSelection } from '@/lib/tracking'
import { Frown, ArrowLeft, Check, MapPin, Crown } from 'lucide-react'
import PhotoCarousel from '@/components/photo-carousel'
import type { Restaurant } from '@/types'

export default function Top5Grid() {
  const t = useTranslations('Top5')
  const { top5, favoriteId, setFavorite, confirmFavorite, goBackToQuestions } = useFlowStore()

  if (top5.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <Frown className="h-12 w-12 text-stone-300" />
        <div className="space-y-1">
          <p className="text-base font-semibold text-stone-700 sm:text-lg">
            {t('emptyTitle')}
          </p>
          <p className="text-sm text-stone-400 sm:text-base">
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

  const favorite = top5.find((r) => r.id === favoriteId)

  function handleConfirm() {
    if (!favorite) return
    try { navigator.vibrate?.(20) } catch {}
    trackSelection(favorite.id, 0)
    confirmFavorite()
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="space-y-2 text-center">
        <p className="text-lg font-bold text-stone-900 sm:text-xl">
          {t('selected', { count: top5.length })}
        </p>
        <p className="text-sm text-stone-400 sm:text-base">
          {t('pickOne')}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label={t('pickOne')}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
      >
        {top5.map((r) => (
          <FavoriteCard
            key={r.id}
            restaurant={r}
            selected={favoriteId === r.id}
            anySelected={favoriteId !== null}
            onSelect={() => setFavorite(favoriteId === r.id ? null : r.id)}
          />
        ))}
      </div>

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 bg-white/90 px-4 pb-4 pt-2 backdrop-blur sm:-mx-6 sm:px-6">
        <motion.button
          whileTap={favorite ? { scale: 0.97 } : undefined}
          onClick={handleConfirm}
          disabled={!favorite}
          className={`w-full rounded-2xl py-4 text-base font-semibold transition-all sm:py-5 sm:text-lg ${
            favorite
              ? 'bg-stone-900 text-white shadow-lg shadow-stone-200/50 hover:bg-stone-800'
              : 'cursor-not-allowed bg-stone-100 text-stone-400'
          }`}
        >
          {favorite ? t('confirm', { name: favorite.name }) : t('confirmPlaceholder')}
        </motion.button>

        <button
          onClick={goBackToQuestions}
          className="inline-flex items-center justify-center gap-2 py-2 text-sm font-medium text-stone-500 transition-colors hover:text-stone-800"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('changeFilters')}
        </button>
      </div>
    </div>
  )
}

function FavoriteCard({
  restaurant,
  selected,
  anySelected,
  onSelect,
}: {
  restaurant: Restaurant
  selected: boolean
  anySelected: boolean
  onSelect: () => void
}) {
  const t = useTranslations('Top5')
  const tCommon = useTranslations('Common')

  return (
    <motion.div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      whileTap={{ scale: 0.98 }}
      animate={{
        opacity: selected || !anySelected ? 1 : 0.55,
        scale: selected ? 1 : 0.98,
      }}
      transition={{ duration: 0.2 }}
      className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 bg-white text-left shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 ${
        selected ? 'border-stone-900' : 'border-transparent hover:border-stone-200'
      }`}
    >
      <div className="relative h-40 bg-stone-100 sm:h-44">
        <PhotoCarousel
          photos={restaurant.photos?.length
            ? restaurant.photos
            : restaurant.image_url
              ? [restaurant.image_url]
              : []}
          name={restaurant.name}
        />
        {selected && (
          <span className="pointer-events-none absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-white shadow-lg">
            <Check className="h-5 w-5" strokeWidth={3} />
            <span className="sr-only">{t('selectedBadge')}</span>
          </span>
        )}
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col gap-1">
          {restaurant.founder_rank != null && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 shadow-sm">
              <Crown className="h-3 w-3" />{tCommon('founder')}
            </span>
          )}
          {restaurant.is_demo && (
            <span className="rounded-md bg-stone-200/80 px-2 py-0.5 text-[10px] font-medium text-stone-500 backdrop-blur-sm">
              {tCommon('demo')}
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <p className="truncate font-bold text-stone-900">{restaurant.name}</p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-stone-400">
          {restaurant.zone && (
            <>
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {restaurant.zone}
              <span className="mx-1">·</span>
            </>
          )}
          {getPriceLabel(restaurant.price_level)}
        </p>
      </div>
    </motion.div>
  )
}