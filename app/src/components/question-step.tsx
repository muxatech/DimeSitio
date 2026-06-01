'use client'

import { motion } from 'framer-motion'
import { useFlowStore } from '@/store/flow-store'
import { cn } from '@/lib/utils'
import { ZONES } from '@/lib/constants'
import { Banknote, Coins, Crown, MapPin, ArrowLeft } from 'lucide-react'

interface QuestionStepProps {
  onNext: () => void
  onBack?: () => void
  title?: string
  subtitle?: string
}

const priceOptions = [
  { value: 1, label: 'Barato', desc: 'Menos de 15€', Icon: Banknote },
  { value: 2, label: 'Normal', desc: 'Entre 15€ y 30€', Icon: Coins },
  { value: 3, label: 'Caro', desc: 'Más de 30€', Icon: Crown },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      <p className="text-sm text-stone-400 sm:text-base lg:text-lg">
        {subtitle}
      </p>
    </div>
  )
}

export function QuestionCategories({
  categories,
  onNext,
  onBack,
  title = '¿Qué te apetece hoy?',
  subtitle = 'Selecciona uno o varios tipos de comida',
}: QuestionStepProps & { categories: { id: string; name: string }[] }) {
  const { selectedCategoryIds, setSelectedCategoryIds } = useFlowStore()

  function toggle(id: string) {
    const next = selectedCategoryIds.includes(id)
      ? selectedCategoryIds.filter((x) => x !== id)
      : [...selectedCategoryIds, id]
    setSelectedCategoryIds(next)
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
      {onBack && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-stone-400 transition-colors hover:text-stone-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Atrás
        </motion.button>
      )}
      <Header title={title} subtitle={subtitle} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap gap-2.5 sm:gap-3 lg:gap-4"
      >
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            variants={itemVariants}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggle(cat.id)}
            className={cn(
              'rounded-2xl border-2 px-4 py-3 text-sm font-medium shadow-sm transition-all sm:px-5 sm:py-3.5 sm:text-base lg:px-6 lg:py-4 lg:text-lg',
              selectedCategoryIds.includes(cat.id)
                ? 'border-stone-900 bg-stone-100 text-stone-900'
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:shadow-md'
            )}
          >
            {cat.name}
          </motion.button>
        ))}
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        onClick={onNext}
        disabled={selectedCategoryIds.length === 0}
        className={cn(
          'w-full rounded-2xl py-4 text-base font-semibold text-white shadow-lg transition-all sm:py-4 sm:text-lg lg:py-5 lg:text-xl',
          selectedCategoryIds.length > 0
            ? 'bg-stone-800 shadow-lg shadow-stone-200/50 hover:bg-stone-700'
            : 'bg-stone-200 text-stone-400'
        )}
      >
        {selectedCategoryIds.length > 0
          ? `Continuar (${selectedCategoryIds.length})`
          : 'Selecciona al menos una opción'}
      </motion.button>
    </div>
  )
}

export function QuestionPrice({ onNext, onBack, title = '¿Cuánto quieres gastar?', subtitle = 'Elige un rango de precio aproximado' }: QuestionStepProps) {
  const { selectedPriceLevel, setSelectedPriceLevel } = useFlowStore()

  return (
    <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
      {onBack && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-stone-400 transition-colors hover:text-stone-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Atrás
        </motion.button>
      )}
      <Header title={title} subtitle={subtitle} />

      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:gap-6">
        {priceOptions.map((opt) => (
          <motion.button
            key={opt.value}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedPriceLevel(opt.value as 1 | 2 | 3)}
            className={cn(
              'flex items-center gap-4 rounded-2xl border-2 px-5 py-5 text-left shadow-sm transition-all sm:gap-5 sm:px-6 sm:py-6 lg:flex-1 lg:flex-col lg:items-center lg:gap-4 lg:py-8 lg:text-center',
              selectedPriceLevel === opt.value
                ? 'border-stone-900 bg-stone-100 text-stone-900'
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:shadow-md'
            )}
          >
            <span
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl sm:h-14 sm:w-14 lg:h-16 lg:w-16',
                  selectedPriceLevel === opt.value
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-stone-100 text-stone-400'
              )}
            >
              <opt.Icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
            </span>
            <div className="flex-1 lg:flex-none">
              <p className="text-lg font-semibold sm:text-xl lg:text-2xl">{opt.label}</p>
              <p className="text-sm text-stone-400 sm:text-base">{opt.desc}</p>
            </div>
            <div
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all sm:h-7 sm:w-7',
                  selectedPriceLevel === opt.value
                    ? 'border-stone-900 bg-stone-900'
                    : 'border-stone-300'
              )}
            >
              {selectedPriceLevel === opt.value && (
                <svg className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        onClick={onNext}
        disabled={selectedPriceLevel === null}
        className={cn(
          'w-full rounded-2xl py-4 text-base font-semibold text-white shadow-lg transition-all sm:py-4 sm:text-lg lg:py-5 lg:text-xl',
          selectedPriceLevel !== null
            ? 'bg-stone-800 shadow-lg shadow-stone-200/50 hover:bg-stone-700'
            : 'bg-stone-200 text-stone-400'
        )}
      >
        {selectedPriceLevel !== null ? 'Continuar' : 'Selecciona un rango de precio'}
      </motion.button>
    </div>
  )
}

export function QuestionZone({
  zones = ZONES,
  onNext,
  onBack,
  title = '¿Por qué zona te viene mejor?',
  subtitle = 'Selecciona una o varias zonas',
}: QuestionStepProps & { zones?: string[] }) {
  const { selectedZoneIds, setSelectedZoneIds } = useFlowStore()

  function toggle(zone: string) {
    const next = selectedZoneIds.includes(zone)
      ? selectedZoneIds.filter((z) => z !== zone)
      : [...selectedZoneIds, zone]
    setSelectedZoneIds(next)
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
      {onBack && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-stone-400 transition-colors hover:text-stone-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Atrás
        </motion.button>
      )}
      <Header title={title} subtitle={subtitle} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap gap-2.5 sm:gap-3 lg:gap-4"
      >
        {zones.map((zone) => (
          <motion.button
            key={zone}
            variants={itemVariants}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggle(zone)}
            className={cn(
              'inline-flex items-center gap-2 rounded-2xl border-2 px-5 py-3 text-sm font-medium shadow-sm transition-all sm:px-6 sm:py-3.5 sm:text-base lg:px-8 lg:py-4 lg:text-lg',
              selectedZoneIds.includes(zone)
                ? 'border-stone-900 bg-stone-100 text-stone-900'
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:shadow-md'
            )}
          >
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
            {zone}
          </motion.button>
        ))}
        <motion.button
          variants={itemVariants}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedZoneIds([])}
          className={cn(
            'inline-flex items-center gap-2 rounded-2xl border-2 border-dashed px-5 py-3 text-sm font-medium transition-all sm:px-6 sm:py-3.5 sm:text-base lg:px-8 lg:py-4 lg:text-lg',
            selectedZoneIds.length === 0
              ? 'border-stone-900 bg-stone-100 text-stone-800'
              : 'border-stone-300 text-stone-400 hover:border-stone-300'
          )}
        >
          Me da igual la zona
        </motion.button>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        onClick={onNext}
        className="w-full rounded-2xl bg-stone-800 py-4 text-base font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700 sm:py-4 sm:text-lg lg:py-5 lg:text-xl"
      >
        Ver resultados
      </motion.button>
    </div>
  )
}
