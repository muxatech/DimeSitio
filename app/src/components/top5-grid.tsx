'use client'

import { motion } from 'framer-motion'
import { useFlowStore } from '@/store/flow-store'
import { getPriceLabel } from '@/lib/utils'
import type { Restaurant } from '@/types'

export default function Top5Grid() {
  const { top5, initBattle } = useFlowStore()

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-zinc-900">Tus mejores opciones</h2>
      <p className="text-zinc-500">Estos son los restaurantes que más te gustarán</p>

      <div className="flex flex-col gap-4">
        {top5.map((r, i) => (
          <RestaurantRow key={r.id} restaurant={r} rank={i + 1} />
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={initBattle}
        className="mt-2 w-full rounded-full bg-orange-500 py-4 text-lg font-semibold text-white shadow-lg shadow-orange-200 transition-colors hover:bg-orange-600"
      >
        Elegir favorito
      </motion.button>
    </div>
  )
}

function RestaurantRow({ restaurant, rank }: { restaurant: Restaurant; rank: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.08 }}
      className="flex items-center gap-4 rounded-xl border border-zinc-100 bg-white p-4 shadow-sm"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
        {rank}
      </span>

      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
        {restaurant.image_url ? (
          <img
            src={restaurant.image_url}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">🍽️</div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-zinc-900">{restaurant.name}</p>
        <p className="truncate text-sm text-zinc-500">
          {restaurant.zone && `${restaurant.zone} · `}
          {getPriceLabel(restaurant.price_level)}
        </p>
      </div>
    </motion.div>
  )
}
