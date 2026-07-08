'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useFlowStore } from '@/store/flow-store'
import { getPriceLabel } from '@/lib/utils'
import type { Restaurant } from '@/types'
import { Frown, MapPin, UtensilsCrossed, Sparkles, Swords, ArrowLeft, Crown } from 'lucide-react'

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
        <div className="absolute right-1 top-1 flex flex-col gap-0.5">
          {restaurant.founder_rank && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 shadow-sm" title="Fundador">
              <Crown className="h-2.5 w-2.5" />
              Fundador
            </span>
          )}
          {restaurant.is_demo && (
            <span className="rounded-md bg-stone-200/80 px-1.5 py-0.5 text-[9px] font-medium text-stone-500 backdrop-blur-sm">
              Demo
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col p-2.5 sm:p-3">
        <div className="space-y-1">
          <p className="truncate text-sm font-bold text-stone-900">
            {restaurant.name}
          </p>
          <p className="flex items-center gap-1 text-xs text-stone-400">
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
        {restaurant.instagram_url && (
          <a
            href={restaurant.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="ml-auto mt-1 inline-flex items-center gap-1 rounded-lg bg-pink-50 px-2 py-1 text-xs font-medium text-pink-700 transition-all hover:bg-pink-100 hover:text-pink-800"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0 fill-current" aria-label="Instagram">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            @{restaurant.instagram_url.replace(/https?:\/\/instagram\.com\//, '').replace(/\/$/, '')}
          </a>
        )}
      </div>
    </div>
  )
}
