'use client'

import { useState, useRef, useCallback, useLayoutEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useFlowStore } from '@/store/flow-store'
import { getPriceLabel } from '@/lib/utils'
import { trackSelection } from '@/lib/tracking'
import type { Restaurant } from '@/types'
import { MapPin, Sparkles, Swords, RotateCcw, Crown, UtensilsCrossed, Maximize2 } from 'lucide-react'
import RestaurantModal, { restaurantPhotos } from '@/components/restaurant-modal'

// Única fuente de verdad para el ancho de la tarjeta: si el CSS y la
// aritmética de centrado se desincronizan, el centrado se rompe.
const CARD_RATIO = 0.78
const CARD_GAP = 16
const SWIPE_THRESHOLD = 56
const AXIS_LOCK_PX = 8
const EDGE_DAMPING = 0.3
const MAX_DRAG = 140

export default function BattleView() {
  const t = useTranslations('Battle')
  const tCommon = useTranslations('Common')
  const { battleChampion, battleChallenger, battleRound, selectBattleWinner, reset } = useFlowStore()
  const [picking, setPicking] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [centerIndex, setCenterIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [metrics, setMetrics] = useState({ base: 0, step: 0 })
  const [detailId, setDetailId] = useState<string | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const totalRounds = useFlowStore((s) => s.top5.length) - 1

  const champion = battleChampion
  const challenger = battleChallenger

  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)
  const lockedDir = useRef<'h' | 'v' | null>(null)
  const wasDragged = useRef(false)

  // Reset the carousel when the round changes. Adjusting state during render is
  // React's supported pattern here; doing it in an effect would paint the new
  // round's cards at the previous round's offset for one frame.
  const [prevRound, setPrevRound] = useState(battleRound)
  if (prevRound !== battleRound) {
    setPrevRound(battleRound)
    setCenterIndex(0)
    setDragOffset(0)
  }

  useLayoutEffect(() => {
    const el = trackRef.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth
      if (w <= 0) return
      const card = w * CARD_RATIO
      setMetrics({ base: (w - card) / 2, step: card + CARD_GAP })
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [battleRound, champion?.id, challenger?.id])

  const onTrackPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return
    startX.current = e.clientX
    startY.current = e.clientY
    lockedDir.current = null
    wasDragged.current = false
    setDragging(true)
  }, [])

  const onTrackPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (startX.current == null || startY.current == null) return
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current
    if (lockedDir.current == null) {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return
      lockedDir.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
    }
    if (lockedDir.current === 'v') return
    if (Math.abs(dx) > AXIS_LOCK_PX) {
      wasDragged.current = true
      e.stopPropagation()
    }
    const atEdge = (centerIndex === 0 && dx > 0) || (centerIndex === 1 && dx < 0)
    const next = atEdge ? dx * EDGE_DAMPING : dx
    setDragOffset(Math.max(-MAX_DRAG, Math.min(MAX_DRAG, next)))
  }, [centerIndex])

  const onTrackPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (startX.current == null) return
    const dx = e.clientX - startX.current
    startX.current = null
    startY.current = null
    lockedDir.current = null
    setDragging(false)
    setDragOffset(0)
    if (dx <= -SWIPE_THRESHOLD) setCenterIndex(1)
    else if (dx >= SWIPE_THRESHOLD) setCenterIndex(0)
  }, [])

  const onTrackPointerCancel = useCallback(() => {
    startX.current = null
    startY.current = null
    lockedDir.current = null
    wasDragged.current = false
    setDragging(false)
    setDragOffset(0)
  }, [])

  const onTrackClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!wasDragged.current) return
    e.stopPropagation()
    e.preventDefault()
    wasDragged.current = false
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
    setDetailId(null)
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
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-700">
            <Swords className="h-3.5 w-3.5" />
            {t('chooseFavorite')}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            {t('question')}
          </h2>
          <p className="text-sm text-stone-500 lg:hidden">Desliza para ver la otra opción — la centrada se elige</p>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white lg:self-auto lg:px-4 lg:py-1.5 lg:text-sm">
          <Sparkles className="h-3 w-3" />
          {t('round', { current: battleRound, total: totalRounds })}
        </span>
      </div>

      <div className="flex gap-2 lg:gap-3">
        {Array.from({ length: totalRounds }).map((_, i) => (
          <div
            key={i}
            data-testid={`round-bar-${i}`}
            data-state={i < battleRound - 1 ? 'done' : i === battleRound - 1 ? 'active' : 'upcoming'}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 lg:h-2 ${i < battleRound - 1 ? 'bg-stone-900' : i === battleRound - 1 ? 'bg-stone-400' : 'bg-stone-200'}`}
          />
        ))}
      </div>

      <div className="lg:hidden">
        <div
          ref={trackRef}
          data-testid="battle-carousel"
          onPointerDown={onTrackPointerDown}
          onPointerMove={onTrackPointerMove}
          onPointerUp={onTrackPointerUp}
          onPointerCancel={onTrackPointerCancel}
          onClickCapture={onTrackClickCapture}
          className="touch-pan-y overflow-hidden select-none"
        >
          <div
            className="flex items-stretch"
            style={{
              gap: `${CARD_GAP}px`,
              transform: `translateX(${metrics.base - centerIndex * metrics.step + dragOffset}px)`,
              transition: dragging ? 'none' : 'transform 350ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {restaurants.map((r, idx) => {
              const isCenter = centerIndex === idx
              const isSelected = selectedId === r.id
              return (
                <div
                  key={r.id}
                  data-testid={`battle-slide-${idx}`}
                  style={{ width: `${CARD_RATIO * 100}%` }}
                  className={`shrink-0 transition-all duration-300 ${isCenter ? 'scale-100 opacity-100' : 'scale-[0.95] opacity-60'}`}
                >
                  <BattleCard
                    restaurant={r}
                    onPick={handlePick}
                    onOpenDetail={openDetail}
                    isSelected={isSelected}
                    isCenter={isCenter}
                    disabled={picking}
                    onCenterTap={() => setCenterIndex(idx)}
                  />
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {[0, 1].map((i) => (
            <button
              key={i}
              onClick={() => setCenterIndex(i)}
              aria-label={`Ver opción ${i + 1}`}
              aria-current={centerIndex === i ? 'true' : undefined}
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
          className="hidden lg:flex lg:items-stretch lg:gap-6"
        >
          <BattleCard restaurant={champion} onPick={handlePick} onOpenDetail={openDetail} isSelected={selectedId === champion.id} isCenter disabled={picking} />
          <div className="flex flex-col items-center justify-center">
            <div className="h-16 w-px bg-stone-200" />
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-sm font-black text-white shadow-md">VS</span>
            <div className="h-16 w-px bg-stone-200" />
          </div>
          <BattleCard restaurant={challenger} onPick={handlePick} onOpenDetail={openDetail} isSelected={selectedId === challenger.id} isCenter disabled={picking} />
        </motion.div>
      </AnimatePresence>

      <RestaurantModal
        restaurant={restaurants.find((r) => r.id === detailId) ?? null}
        onClose={closeDetail}
      />
    </div>
  )

  function openDetail(r: Restaurant) {
    if (picking) return
    setDetailId(r.id)
  }

  function closeDetail() {
    setDetailId(null)
  }
}

function BattleCard({
  restaurant,
  onPick,
  onOpenDetail,
  isSelected,
  isCenter = true,
  disabled,
  onCenterTap,
}: {
  restaurant: Restaurant
  onPick: (r: Restaurant) => void
  onOpenDetail: (r: Restaurant) => void
  isSelected: boolean
  isCenter?: boolean
  disabled?: boolean
  onCenterTap?: () => void
}) {
  const tCommon = useTranslations('Common')
  const t = useTranslations('Battle')

  // La tarjeta solo muestra la portada: el resto de fotos viven en la modal.
  const cover = restaurantPhotos(restaurant)[0] ?? null

  return (
    <div className="relative h-full w-full">
      <div
        onClick={() => { if (isCenter) onOpenDetail(restaurant); else onCenterTap?.() }}
        className={`group relative flex h-full min-h-[26rem] cursor-pointer flex-col justify-end overflow-hidden rounded-2xl border bg-stone-200 text-left shadow-sm transition-all sm:min-h-[30rem] ${
          isSelected ? 'border-stone-900 ring-2 ring-stone-900/10 ring-offset-2' : 'border-stone-200'
        } ${disabled && isCenter ? 'opacity-80' : ''}`}
      >
        {cover ? (
          <img
            src={cover}
            alt={restaurant.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
            <UtensilsCrossed className="h-10 w-10 text-stone-300" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {restaurant.founder_rank != null && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 shadow-sm">
              <Crown className="h-3 w-3" />{tCommon('founder')}
            </span>
          )}
          {restaurant.is_demo && (
            <span className="rounded-md bg-stone-200/80 px-2 py-0.5 text-[10px] font-medium text-stone-500 backdrop-blur-sm">{tCommon('demo')}</span>
          )}
        </div>

        {isSelected && isCenter && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-stone-900 shadow-lg"
          >
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}

        <div className="relative p-4 sm:p-5">
          <h3 className="line-clamp-2 text-xl font-bold leading-tight text-white drop-shadow sm:text-2xl">
            {restaurant.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-2 text-sm font-medium text-white/85">
            {restaurant.zone && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />{restaurant.zone}
              </span>
            )}
            <span className="text-white/50">·</span>
            <span>{getPriceLabel(restaurant.price_level)}</span>
          </div>

          <span className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <Maximize2 className="h-3.5 w-3.5" />
            {t('seeDetails')}
          </span>
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); handlePickWrapper() }}
        disabled={disabled || !isCenter}
        className={`mt-3 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3.5 text-[15px] font-semibold shadow-md transition-all ${
          isCenter ? 'bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98]' : 'cursor-not-allowed bg-stone-100 text-stone-400'
        } disabled:opacity-60`}
      >
        {isSelected && isCenter ? t('chosen') : isCenter ? t('choose') : t('swipeToSee')}
      </button>
    </div>
  )

  function handlePickWrapper() {
    if (!isCenter || disabled) return
    onPick(restaurant)
  }
}
