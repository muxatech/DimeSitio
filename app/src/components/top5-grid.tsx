'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useFlowStore } from '@/store/flow-store'
import { getPriceLabel } from '@/lib/utils'
import type { Restaurant } from '@/types'
import { Frown, MapPin, UtensilsCrossed, Sparkles, Swords, ArrowLeft } from 'lucide-react'

export default function Top5Grid() {
  const { top5, initBattle, goBackToQuestions } = useFlowStore()

  if (top5.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <Frown className="h-12 w-12 text-stone-300" />
        <div className="space-y-1">
          <p className="text-base font-semibold text-stone-700 sm:text-lg">
            No encontramos restaurantes con esos filtros
          </p>
          <p className="text-sm text-stone-400">
            Prueba cambiando el tipo de cocina, el presupuesto o la zona.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={goBackToQuestions}
          className="inline-flex items-center gap-2 rounded-2xl bg-stone-800 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-stone-700 sm:px-8 sm:py-4 sm:text-lg"
        >
          <ArrowLeft className="h-5 w-5" />
          Cambiar filtros
        </motion.button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-700">
          <Sparkles className="h-3.5 w-3.5" />
          Tus mejores opciones
        </div>
        <p className="text-base text-stone-600 sm:text-lg">
          Hemos seleccionado <strong>{top5.length} opciones</strong> para ti,
          ahora tienes que elegir tu favorito.
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible">
        {top5.map((r, i) => (
          <CompactCard key={r.id} restaurant={r} rank={i + 1} />
        ))}
      </div>

      {top5.length >= 2 && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={initBattle}
          className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-stone-800 py-4 text-base font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700 sm:py-4 sm:text-lg lg:py-5 lg:text-xl"
        >
          <Swords className="h-5 w-5" />
          Elegir favorito
        </motion.button>
      )}
    </div>
  )
}

function CompactCard({ restaurant, rank }: { restaurant: Restaurant; rank: number }) {
  return (
    <div className="w-36 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm sm:w-44">
      <div className="relative h-24 bg-stone-100 sm:h-28">
        {restaurant.image_url ? (
          <Image
            src={restaurant.image_url}
            alt={restaurant.name}
            width={200}
            height={150}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UtensilsCrossed className="h-5 w-5 text-stone-300" />
          </div>
        )}
        <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-br-xl bg-stone-900 text-[10px] font-bold text-white">
          {rank}
        </div>
      </div>
      <div className="space-y-1 p-2.5 sm:p-3">
        <p className="truncate text-sm font-bold text-stone-900">
          {restaurant.name}
        </p>
        <p className="flex items-center gap-1 truncate text-xs text-stone-400">
          {restaurant.zone && (
            <>
              <MapPin className="h-3 w-3 shrink-0" />
              {restaurant.zone}
              <span className="mx-0.5">·</span>
            </>
          )}
          {getPriceLabel(restaurant.price_level)}
        </p>
      </div>
    </div>
  )
}
