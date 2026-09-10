'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useFlowStore } from '@/store/flow-store'
import { getPriceLabel } from '@/lib/utils'
import { trackSelection } from '@/lib/tracking'
import type { Restaurant } from '@/types'
import { MapPin, Sparkles, Swords, RotateCcw, Crown } from 'lucide-react'
import PhotoCarousel from '@/components/photo-carousel'

export default function BattleView() {
  const t = useTranslations('Battle')
  const tCommon = useTranslations('Common')
  const { battleChampion, battleChallenger, battleRound, selectBattleWinner, reset } = useFlowStore()
  const [picking, setPicking] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [centerIndex, setCenterIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const totalRounds = useFlowStore((s) => s.top5.length) - 1

  const champion = battleChampion
  const challenger = battleChallenger

  useEffect(() => {
    setCenterIndex(0)
    if (scrollRef.current) scrollRef.current.scrollLeft = 0
  }, [battleRound])

  const scrollTo = useCallback((idx: number) => {
    setCenterIndex(idx)
    try { cardRefs.current[idx]?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest', inline: 'center' } as unknown as ScrollIntoViewOptions) } catch {}
  }, [])

  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    if (max <= 0) return
    const idx = el.scrollLeft > max / 2 ? 1 : 0
    setCenterIndex((prev) => (prev !== idx ? idx : prev))
  }, [])

  if (!champion || !challenger) {
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
    try { navigator.vibrate?.(20) } catch {}
    trackSelection(winner.id, battleRound)
    setPicking(true)
    setSelectedId(winner.id)
    setTimeout(() => {
      selectBattleWinner(winner)
      setSelectedId(null)
      setPicking(false)
    }, 400)
  }

  const restaurants = [champion, challenger] as const

  return (
    <div className="flex flex-col gap-5 sm:gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-700">
            <Swords className="h-3.5 w-3.5" />
            {t('chooseFavorite')}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            {t('question')}
          </h2>
          <p className="text-sm text-stone-500 sm:hidden">Desliza para ver la otra opción — la centrada se elige</p>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white sm:self-auto sm:px-4 sm:py-1.5 sm:text-sm">
          <Sparkles className="h-3 w-3" />
          {t('round', { current: battleRound, total: totalRounds })}
        </span>
      </div>

      <div className="flex gap-2 sm:gap-3">
        {Array.from({ length: totalRounds }).map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 sm:h-2 ${i < battleRound ? 'bg-stone-900' : i === battleRound - 1 ? 'bg-stone-400' : 'bg-stone-200'}`} />
        ))}
      </div>

      <div className="sm:hidden">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-[7%] pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [overscroll-behavior-x:contain] touch-pan-x"
        >
          {restaurants.map((r, idx) => {
            const isCenter = centerIndex === idx
            const isSelected = selectedId === r.id
            return (
              <div
                key={r.id}
                ref={(el) => { cardRefs.current[idx] = el }}
                className="w-[86%] shrink-0 snap-center"
              >
                <div className={`transition-all duration-300 ${isCenter ? 'scale-100 opacity-100' : 'scale-[0.96] opacity-100'}`}>
                  <BattleCard
                    restaurant={r}
                    onPick={handlePick}
                    isSelected={isSelected}
                    isCenter={isCenter}
                    disabled={picking}
                    onCenterTap={() => scrollTo(idx)}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {[0, 1].map((i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Ver opción ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${centerIndex === i ? 'w-6 bg-stone-900' : 'w-1.5 bg-stone-300'}`}
            />
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-stone-400">Toca el lateral oscurecido para traerlo al centro</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={battleRound}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="hidden sm:flex sm:items-stretch sm:gap-6"
        >
          <BattleCard restaurant={champion} onPick={handlePick} isSelected={selectedId === champion.id} isCenter disabled={picking} />
          <div className="flex flex-col items-center justify-center">
            <div className="h-16 w-px bg-stone-200" />
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-sm font-black text-white shadow-md">VS</span>
            <div className="h-16 w-px bg-stone-200" />
          </div>
          <BattleCard restaurant={challenger} onPick={handlePick} isSelected={selectedId === challenger.id} isCenter disabled={picking} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function BattleCard({
  restaurant,
  onPick,
  isSelected,
  isCenter = true,
  disabled,
  onCenterTap,
}: {
  restaurant: Restaurant
  onPick: (r: Restaurant) => void
  isSelected: boolean
  isCenter?: boolean
  disabled?: boolean
  onCenterTap?: () => void
}) {
  const tCommon = useTranslations('Common')
  const t = useTranslations('Battle')

  return (
    <div
      role={!isCenter ? 'button' : undefined}
      tabIndex={!isCenter ? 0 : undefined}
      onKeyDown={!isCenter ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCenterTap?.() } } : undefined}
      onClick={!isCenter ? () => onCenterTap?.() : undefined}
      className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all ${
        isSelected ? 'border-stone-900 ring-2 ring-stone-900/10 ring-offset-2' : 'border-stone-200'
      } ${!isCenter ? 'cursor-pointer' : ''} ${disabled && isCenter ? 'opacity-80' : ''}`}
    >
      <div className="relative h-52 shrink-0 bg-stone-100 sm:h-56">
        <PhotoCarousel
          photos={restaurant.photos?.length ? restaurant.photos : restaurant.image_url ? [restaurant.image_url] : []}
          name={restaurant.name}
        />
        {!isCenter && <div className="pointer-events-none absolute inset-0 bg-black/20" />}
        {isSelected && isCenter && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-900 shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {restaurant.founder_rank && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 shadow-sm">
              <Crown className="h-3 w-3" />{tCommon('founder')}
            </span>
          )}
          {restaurant.is_demo && <span className="rounded-md bg-stone-200/80 px-2 py-0.5 text-[10px] font-medium text-stone-500 backdrop-blur-sm">{tCommon('demo')}</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 text-lg font-bold leading-tight text-stone-900">{restaurant.name}</h3>
        <div className="mt-1 flex items-center gap-2 text-sm text-stone-500">
          {restaurant.zone && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{restaurant.zone}</span>}
          <span className="text-stone-300">·</span><span>{getPriceLabel(restaurant.price_level)}</span>
        </div>
        {restaurant.description && <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-stone-500">{restaurant.description}</p>}
        {restaurant.instagram_url && (
          <a href={restaurant.instagram_url} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.stopPropagation(); import('@/lib/tracking').then(m=>m.trackCta(restaurant.id,'instagram')) }} className="mt-2 inline-flex self-start items-center gap-1.5 rounded-xl bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-700">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            {tCommon('viewInstagram')}
          </a>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); if (isCenter) handlePickWrapper() }}
          disabled={disabled || !isCenter}
          className={`mt-4 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3.5 text-[15px] font-semibold shadow-md transition-all ${isCenter ? 'bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98]' : 'bg-stone-100 text-stone-400 cursor-not-allowed'} disabled:opacity-60`}
        >
          {isSelected && isCenter ? '¡Elegido!' : isCenter ? t('choose') : 'Desliza para ver'}
        </button>
      </div>
    </div>
  )

  function handlePickWrapper() {
    if (!isCenter || disabled) return
    onPick(restaurant)
  }
}
