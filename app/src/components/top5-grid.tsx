'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useFlowStore } from '@/store/flow-store'
import { Frown, Sparkles, Swords, ArrowLeft, UtensilsCrossed, Crown } from 'lucide-react'

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

  const first = top5[0]

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-700">
          <Sparkles className="h-3.5 w-3.5" />
          Tus mejores opciones
        </div>
        <p className="text-base text-stone-600 sm:text-lg">
          Hemos seleccionado <strong>{top5.length} opciones</strong> para ti.
        </p>
      </div>

      <div className="flex items-stretch gap-3 sm:gap-6">
        <PreviewCard restaurant={first} />
        {top5.length >= 2 && (
          <>
            <div className="flex shrink-0 items-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white shadow-md sm:h-14 sm:w-14 sm:text-lg">
                VS
              </span>
            </div>
            <PreviewCard restaurant={top5[1]} />
          </>
        )}
      </div>

      {top5.length > 2 && (
        <p className="-mt-4 text-center text-sm text-stone-400">
          +{top5.length - 2} más
        </p>
      )}

      {top5.length >= 2 && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={initBattle}
          className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-stone-800 py-4 text-base font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700 sm:py-5 sm:text-lg"
        >
          <Swords className="h-5 w-5" />
          Elegir favorito
        </motion.button>
      )}
    </div>
  )
}

function PreviewCard({ restaurant }: { restaurant: { id: string; name: string; image_url?: string | null; founder_rank?: number | null } }) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="relative h-32 bg-stone-100 sm:h-40">
        {restaurant.image_url ? (
          <Image
            src={restaurant.image_url}
            alt={restaurant.name}
            width={300}
            height={200}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UtensilsCrossed className="h-8 w-8 text-stone-300" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5 p-3 sm:p-4">
        {restaurant.founder_rank && (
          <Crown className="h-3.5 w-3.5 shrink-0 text-amber-600" />
        )}
        <p className="truncate text-sm font-bold text-stone-900 sm:text-base">
          {restaurant.name}
        </p>
      </div>
    </div>
  )
}
