'use client'

import { motion } from 'framer-motion'
import { useFlowStore } from '@/store/flow-store'
import { cn } from '@/lib/utils'

interface QuestionStepProps {
  onNext: () => void
}

const priceOptions = [
  { value: 1, label: '€', desc: 'Barato' },
  { value: 2, label: '€€', desc: 'Normal' },
  { value: 3, label: '€€€', desc: 'Caro' },
]

export function QuestionCategories({
  categories,
  onNext,
}: QuestionStepProps & { categories: { id: string; name: string; icon: string | null }[] }) {
  const { selectedCategoryIds, setSelectedCategoryIds } = useFlowStore()

  function toggle(id: string) {
    const next = selectedCategoryIds.includes(id)
      ? selectedCategoryIds.filter((x) => x !== id)
      : [...selectedCategoryIds, id]
    setSelectedCategoryIds(next)
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-zinc-900">¿Qué te apetece?</h2>
      <p className="text-zinc-500">Elige uno o varios tipos de comida</p>
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggle(cat.id)}
            className={cn(
              'rounded-xl border-2 px-5 py-3 text-base font-medium transition-colors',
              selectedCategoryIds.includes(cat.id)
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
            )}
          >
            {cat.icon && <span className="mr-2">{cat.icon}</span>}
            {cat.name}
          </motion.button>
        ))}
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        disabled={selectedCategoryIds.length === 0}
        className={cn(
          'mt-4 w-full rounded-full py-4 text-lg font-semibold text-white transition-colors',
          selectedCategoryIds.length > 0
            ? 'bg-orange-500 shadow-lg shadow-orange-200 hover:bg-orange-600'
            : 'bg-zinc-300'
        )}
      >
        Siguiente
      </motion.button>
    </div>
  )
}

export function QuestionPrice({ onNext }: QuestionStepProps) {
  const { selectedPriceLevel, setSelectedPriceLevel } = useFlowStore()

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-zinc-900">¿Cuánto quieres gastar?</h2>
      <p className="text-zinc-500">Selecciona tu rango de precio</p>
      <div className="flex gap-3">
        {priceOptions.map((opt) => (
          <motion.button
            key={opt.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedPriceLevel(opt.value as 1 | 2 | 3)}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 rounded-xl border-2 py-6 transition-colors',
              selectedPriceLevel === opt.value
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
            )}
          >
            <span className="text-2xl font-bold">{opt.label}</span>
            <span className="text-sm">{opt.desc}</span>
          </motion.button>
        ))}
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        disabled={selectedPriceLevel === null}
        className={cn(
          'mt-4 w-full rounded-full py-4 text-lg font-semibold text-white transition-colors',
          selectedPriceLevel !== null
            ? 'bg-orange-500 shadow-lg shadow-orange-200 hover:bg-orange-600'
            : 'bg-zinc-300'
        )}
      >
        Siguiente
      </motion.button>
    </div>
  )
}

export function QuestionZone({
  zones,
  onNext,
}: QuestionStepProps & { zones: string[] }) {
  const { selectedZone, setSelectedZone } = useFlowStore()

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-zinc-900">¿Dónde prefieres?</h2>
      <p className="text-zinc-500">Selecciona una zona de Valencia</p>
      <div className="flex flex-wrap gap-3">
        {zones.map((zone) => (
          <motion.button
            key={zone}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedZone(zone === selectedZone ? null : zone)}
            className={cn(
              'rounded-xl border-2 px-5 py-3 text-base font-medium transition-colors',
              selectedZone === zone
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
            )}
          >
            {zone}
          </motion.button>
        ))}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedZone(null)}
          className={cn(
            'rounded-xl border-2 border-dashed px-5 py-3 text-base font-medium transition-colors',
            selectedZone === null
              ? 'border-orange-300 bg-orange-50 text-orange-500'
              : 'border-zinc-200 text-zinc-400 hover:border-zinc-300'
          )}
        >
          Cualquier zona
        </motion.button>
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="mt-4 w-full rounded-full bg-orange-500 py-4 text-lg font-semibold text-white shadow-lg shadow-orange-200 transition-colors hover:bg-orange-600"
      >
        Ver resultados
      </motion.button>
    </div>
  )
}
