'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const labels = ['¿Qué te apetece?', '¿Cuánto gastas?', '¿Por qué zona?']

export default function ProgressBar({
  current,
  total,
}: {
  current: number
  total: number
}) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-700">
          <Sparkles className="h-3.5 w-3.5" />
          {labels[current] ?? `Paso ${current + 1}`}
        </span>
        <span className="text-sm text-stone-400">
          {current + 1} / {total}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
        <motion.div
          className="h-full rounded-full bg-stone-900"
          initial={false}
          animate={{ width: `${(current / total) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
