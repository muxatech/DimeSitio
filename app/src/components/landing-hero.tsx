'use client'

import { motion } from 'framer-motion'
import { useFlowStore } from '@/store/flow-store'
import { getSessionId } from '@/lib/utils'

export default function LandingHero() {
  const { setStep, setSessionId } = useFlowStore()

  function handleStart() {
    setSessionId(getSessionId())
    setStep('questions')
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-8 text-center"
      >
        <div className="text-7xl">🍽️</div>

        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          DimeSitio
        </h1>

        <p className="max-w-xs text-lg text-zinc-500">
          Dile lo que te apetece y te recomendamos el mejor sitio para comer.
        </p>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="mt-4 w-64 rounded-full bg-orange-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-orange-200 transition-colors hover:bg-orange-600 active:bg-orange-700"
        >
          Encuentra dónde comer
        </motion.button>
      </motion.div>
    </div>
  )
}
