'use client'

import { motion } from 'framer-motion'
import { useFlowStore } from '@/store/flow-store'
import { Frown, Sparkles, Swords, ArrowLeft } from 'lucide-react'

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
    <div className="flex flex-col gap-8 sm:gap-10">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-700">
          <Sparkles className="h-3.5 w-3.5" />
          Tus mejores opciones
        </div>
        <p className="text-lg text-stone-600 sm:text-xl">
          Hemos seleccionado <strong>{top5.length} opciones</strong> para ti.
          Compáralas una a una y elige tu favorita.
        </p>
      </div>

      {top5.length >= 2 && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={initBattle}
          className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-stone-800 py-5 text-lg font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700 sm:py-6 sm:text-xl lg:py-7 lg:text-2xl"
        >
          <Swords className="h-6 w-6" />
          Empezar comparación
        </motion.button>
      )}
    </div>
  )
}
