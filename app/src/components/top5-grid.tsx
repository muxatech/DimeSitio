'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useFlowStore } from '@/store/flow-store'
import { getPriceLabel } from '@/lib/utils'
import { trackSelection } from '@/lib/tracking'
import { Frown, ArrowLeft, Check, MapPin, Crown } from 'lucide-react'
import PhotoCarousel from '@/components/photo-carousel'
import { trackCta } from '@/lib/tracking'
import type { Restaurant } from '@/types'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

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

      <div className="relative left-1/2 w-screen -translate-x-1/2">
        <div
          role="radiogroup"
          aria-label={t('pickOne')}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:gap-4 sm:px-8 lg:px-12 [&::-webkit-scrollbar]:hidden"
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
      </div>

      <div className="sticky bottom-0 z-20 -mx-5 flex flex-col gap-2 border-t border-stone-200 bg-white/95 px-5 pb-4 pt-3 shadow-[0_-8px_24px_-12px_rgba(28,25,23,0.18)] backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
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
      className={`relative w-[72vw] max-w-[19rem] shrink-0 snap-start cursor-pointer overflow-hidden rounded-2xl border-2 bg-white text-left shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 ${
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
          <span className="pointer-events-none absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-white shadow-lg ring-2 ring-white/80">
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

        {restaurant.instagram_url && (
          <a
            href={restaurant.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              // La tarjeta es role="radio": sin parar la propagacion, este tap
              // abriria Instagram y ademas seleccionaria el restaurante.
              e.stopPropagation()
              trackCta(restaurant.id, 'instagram')
            }}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-700 transition-all hover:bg-stone-100 hover:shadow-sm"
          >
            <InstagramIcon className="h-4 w-4" />
            {tCommon('viewInstagram')}
          </a>
        )}
      </div>
    </motion.div>
  )
}