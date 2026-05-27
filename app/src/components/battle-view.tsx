'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useFlowStore } from '@/store/flow-store'
import { getPriceLabel, getSessionId } from '@/lib/utils'
import { trackSelection } from '@/lib/tracking'
import type { Restaurant } from '@/types'

export default function BattleView() {
  const { battleChampion, battleChallenger, battleRound, selectBattleWinner } = useFlowStore()
  const [picking, setPicking] = useState(false)

  if (!battleChampion || !battleChallenger) return null

  function handlePick(winner: Restaurant) {
    if (picking) return
    setPicking(true)
    trackSelection(winner.id, getSessionId(), battleRound)
    setTimeout(() => {
      selectBattleWinner(winner)
      setPicking(false)
    }, 300)
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-center text-2xl font-bold text-zinc-900">¿Cuál prefieres?</h2>
      <p className="text-center text-zinc-500">Elige tu favorito</p>

      <div className="flex flex-col gap-4">
        <BattleCard
          restaurant={battleChampion}
          side="left"
          onPick={handlePick}
          disabled={picking}
        />
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200" />
          <span className="text-sm font-medium text-zinc-400">VS</span>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>
        <BattleCard
          restaurant={battleChallenger}
          side="right"
          onPick={handlePick}
          disabled={picking}
        />
      </div>

      <p className="text-center text-sm text-zinc-400">
        Toca el restaurante que más te guste
      </p>
    </div>
  )
}

function BattleCard({
  restaurant,
  side,
  onPick,
  disabled,
}: {
  restaurant: Restaurant
  side: 'left' | 'right'
  onPick: (r: Restaurant) => void
  disabled: boolean
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => onPick(restaurant)}
      disabled={disabled}
      className="w-full overflow-hidden rounded-2xl border border-zinc-100 bg-white text-left shadow-md transition-shadow hover:shadow-lg active:shadow-sm"
    >
      <div className="h-40 bg-zinc-100 sm:h-48">
        {restaurant.image_url ? (
          <img
            src={restaurant.image_url}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">🍽️</div>
        )}
      </div>
      <div className="space-y-1 p-4">
        <h3 className="text-lg font-bold text-zinc-900">{restaurant.name}</h3>
        <div className="flex flex-wrap gap-2 text-sm text-zinc-500">
          {restaurant.zone && <span>{restaurant.zone}</span>}
          <span>{getPriceLabel(restaurant.price_level)}</span>
        </div>
        {restaurant.description && (
          <p className="line-clamp-2 text-sm text-zinc-400">{restaurant.description}</p>
        )}
      </div>
    </motion.button>
  )
}
