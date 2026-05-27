'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFlowStore } from '@/store/flow-store'
import { getPriceLabel, getSessionId } from '@/lib/utils'
import { trackSelection } from '@/lib/tracking'
import type { Restaurant } from '@/types'
import { MapPin, UtensilsCrossed, Sparkles, Swords } from 'lucide-react'

export default function BattleView() {
  const { battleChampion, battleChallenger, battleRound, selectBattleWinner } = useFlowStore()
  const [picking, setPicking] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const totalRounds = useFlowStore((s) => s.top5.length) - 1

  if (!battleChampion || !battleChallenger) return null

  function handlePick(winner: Restaurant) {
    if (picking) return
    setPicking(true)
    setSelectedId(winner.id)
    trackSelection(winner.id, getSessionId(), battleRound)
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
            Batalla culinaria
          </div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl lg:text-3xl">
            ¿Cuál prefieres?
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-orange-500 px-3 py-1 text-xs font-medium text-white sm:self-auto sm:px-4 sm:py-1.5 sm:text-sm">
          <Sparkles className="h-3 w-3" />
          Ronda {battleRound} de {totalRounds}
        </span>
      </div>

      <div className="flex gap-2 sm:gap-3">
        {Array.from({ length: totalRounds }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 sm:h-2 ${
              i < battleRound ? 'bg-orange-500' : 'bg-stone-200'
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
            disabled={picking}
          />

          <div className="flex items-center gap-3 sm:flex-col sm:py-16 sm:pt-20">
            <div className="h-px flex-1 bg-stone-200 sm:h-16 sm:w-px sm:flex-none" />
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white shadow-md sm:h-12 sm:w-12 sm:text-sm">
              VS
            </span>
            <div className="h-px flex-1 bg-stone-200 sm:h-16 sm:w-px sm:flex-none" />
          </div>

          <BattleCard
            restaurant={battleChallenger}
            onPick={handlePick}
            isSelected={selectedId === battleChallenger.id}
            disabled={picking}
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
  disabled,
}: {
  restaurant: Restaurant
  onPick: (r: Restaurant) => void
  isSelected: boolean
  disabled: boolean
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => onPick(restaurant)}
      disabled={disabled}
      className={`relative w-full overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all sm:flex-1 ${
        isSelected
          ? 'border-orange-500 ring-2 ring-orange-200 ring-offset-2'
          : 'border-stone-200 hover:shadow-md'
      }`}
    >
      <div className="relative h-44 bg-stone-100 sm:h-52 lg:h-64">
        {restaurant.image_url ? (
          <img
            src={restaurant.image_url}
            alt={restaurant.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UtensilsCrossed className="h-8 w-8 text-stone-300 sm:h-10 sm:w-10" />
          </div>
        )}
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 shadow-lg sm:h-20 sm:w-20"
            >
              <svg className="h-8 w-8 text-white sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          </div>
        )}
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
      </div>
    </motion.button>
  )
}
