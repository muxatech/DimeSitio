'use client'

import { motion } from 'framer-motion'
import { useFlowStore } from '@/store/flow-store'
import { getPriceLabel } from '@/lib/utils'
import type { Restaurant } from '@/types'
import { Frown, MapPin, UtensilsCrossed, Sparkles, Swords } from 'lucide-react'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export default function Top5Grid() {
  const { top5, initBattle } = useFlowStore()

  if (top5.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Frown className="h-12 w-12 text-zinc-300" />
        <p className="text-base text-zinc-500 sm:text-lg">
          No encontramos restaurantes con esos filtros
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
      <div className="space-y-1.5 sm:space-y-2">
        <div className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700">
          <Sparkles className="h-3.5 w-3.5" />
          Seleccionamos los mejores para ti
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
          Tus mejores opciones
        </h2>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-4 lg:gap-6"
      >
        {top5.map((r, i) => (
          <RestaurantCard key={r.id} restaurant={r} rank={i + 1} />
        ))}
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        onClick={initBattle}
        className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-900 py-4 text-base font-semibold text-white shadow-lg shadow-zinc-200/50 transition-all hover:bg-zinc-800 sm:py-4 sm:text-lg lg:py-5 lg:text-xl"
      >
        <Swords className="h-5 w-5" />
        Elegir favorito
      </motion.button>
    </div>
  )
}

function RestaurantCard({ restaurant, rank }: { restaurant: Restaurant; rank: number }) {
  return (
    <motion.div
      variants={cardVariants}
      className="flex items-center gap-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white pr-4 shadow-sm transition-all hover:shadow-md sm:flex-col sm:gap-0 sm:p-0 sm:pr-0"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-zinc-100 sm:h-40 sm:w-full lg:h-48">
        {restaurant.image_url ? (
          <img
            src={restaurant.image_url}
            alt={restaurant.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UtensilsCrossed className="h-6 w-6 text-zinc-300 sm:h-8 sm:w-8" />
          </div>
        )}
        <div className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-br-xl bg-zinc-900 text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm">
          {rank}
        </div>
      </div>

      <div className="min-w-0 flex-1 sm:p-4 lg:p-5">
        <p className="truncate font-bold text-zinc-900 sm:text-lg lg:text-xl">
          {restaurant.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-zinc-400 sm:text-base">
          {restaurant.zone && (
            <>
              <MapPin className="h-3 w-3 shrink-0" />
              {restaurant.zone}
              <span className="mx-1">·</span>
            </>
          )}
          {getPriceLabel(restaurant.price_level)}
        </p>
      </div>

      <svg
        className="h-5 w-5 shrink-0 text-zinc-300 sm:hidden"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </motion.div>
  )
}
