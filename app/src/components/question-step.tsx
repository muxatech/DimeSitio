'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useFlowStore } from '@/store/flow-store'
import { cn } from '@/lib/utils'
import { groupCategories } from '@/lib/constants'
import { Banknote, Coins, Crown, ArrowLeft, Coffee, UtensilsCrossed, Wine, ChevronDown } from 'lucide-react'

interface QuestionStepProps {
  onNext: () => void
  onBack?: () => void
  title?: string
  subtitle?: string
}

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
  title,
  subtitle,
}: QuestionStepProps & { categories: { id: string; name: string }[] }) {
  const t = useTranslations('Questions')
  const tCommon = useTranslations('Common')
  const { selectedCategoryIds, setSelectedCategoryIds } = useFlowStore()

  const displayTitle = title || t('categoriesTitle')
  const displaySubtitle = subtitle || t('categoriesSubtitle')

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
          {tCommon('back')}
        </motion.button>
      )}
      <Header title={displayTitle} subtitle={displaySubtitle} />

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
          ? t('continueWithCount', { count: selectedCategoryIds.length })
          : t('selectAtLeast')}
      </motion.button>
    </div>
  )
}

const groupIcons: Record<string, React.ElementType> = {
  'cafe-brunch': Coffee,
  'comer-cenar': UtensilsCrossed,
  'tomar-algo': Wine,
}

const groupLabelKeys: Record<string, { label: string; desc: string }> = {
  'cafe-brunch': { label: 'categoryGroupCafeBrunch', desc: 'categoryGroupCafeBrunchDesc' },
  'comer-cenar': { label: 'categoryGroupComerCenar', desc: 'categoryGroupComerCenarDesc' },
  'tomar-algo': { label: 'categoryGroupTomarAlgo', desc: 'categoryGroupTomarAlgoDesc' },
}

export function QuestionCategoryGroups({
  categories,
  onNext,
  onBack,
  title,
  subtitle,
}: QuestionStepProps & { categories: { id: string; name: string; group_keys?: string }[] }) {
  const t = useTranslations('Questions')
  const tCommon = useTranslations('Common')
  const { selectedCategoryIds, setSelectedCategoryIds } = useFlowStore()
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>([])

  const displayTitle = title || t('categoryGroupsTitle')
  const displaySubtitle = subtitle || t('categoryGroupsSubtitle')

  const groups = React.useMemo(() => groupCategories(categories), [categories])

  function toggleGroup(key: string) {
    setExpandedGroups((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  function toggleCategory(id: string) {
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
          {tCommon('back')}
        </motion.button>
      )}
      <Header title={displayTitle} subtitle={displaySubtitle} />

      <div className="flex flex-col gap-3 sm:gap-4">
        {groups.map((group) => {
          const Icon = groupIcons[group.key]
          const isExpanded = expandedGroups.includes(group.key)
          const selectedInGroup = group.availableCats.filter(
            (c) => selectedCategoryIds.includes(c.id)
          )

          return (
            <div
              key={group.key}
              className="overflow-hidden rounded-2xl border-2 border-stone-200 bg-white shadow-sm transition-all"
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleGroup(group.key)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6 sm:py-5 lg:px-7 lg:py-5"
              >
                {Icon && (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-500 sm:h-12 sm:w-12">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-stone-900 sm:text-lg lg:text-xl">
                    {t(groupLabelKeys[group.key]?.label ?? '')}
                  </p>
                  <p className="text-xs text-stone-400 sm:text-sm">
                    {selectedInGroup.length > 0
                      ? selectedInGroup.map((c) => c.name).join(', ')
                      : t(groupLabelKeys[group.key]?.desc ?? '')}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-stone-400 transition-transform sm:h-6 sm:w-6',
                    isExpanded && 'rotate-180'
                  )}
                />
              </motion.button>

              <motion.div
                initial={false}
                animate={{ height: isExpanded ? 'auto' : 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 border-t border-stone-100 px-5 py-4 sm:px-6 sm:py-5 lg:px-7">
                  {group.availableCats.map((cat) => (
                    <motion.button
                      key={cat.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleCategory(cat.id)}
                      className={cn(
                        'rounded-2xl border-2 px-4 py-2.5 text-sm font-medium shadow-sm transition-all sm:px-5 sm:py-3 sm:text-base',
                        selectedCategoryIds.includes(cat.id)
                          ? 'border-stone-900 bg-stone-100 text-stone-900'
                          : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:shadow-md'
                      )}
                    >
                      {cat.name}
                    </motion.button>
                  ))}
                  {group.availableCats.length === 0 && (
                    <p className="text-sm text-stone-400">
                      {t('noCategoriesInGroup')}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>

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
          ? t('continueWithCount', { count: selectedCategoryIds.length })
          : t('selectAtLeast')}
      </motion.button>
    </div>
  )
}

export function QuestionPrice({ onNext, onBack, title, subtitle }: QuestionStepProps) {
  const t = useTranslations('Questions')
  const tCommon = useTranslations('Common')
  const { selectedPriceLevel, setSelectedPriceLevel } = useFlowStore()

  const displayTitle = title || t('priceTitle')
  const displaySubtitle = subtitle || t('priceSubtitle')

  const priceOptions = [
    { value: 1, label: t('cheap'), desc: t('cheapDesc'), Icon: Banknote },
    { value: 2, label: t('normal'), desc: t('normalDesc'), Icon: Coins },
    { value: 3, label: t('expensive'), desc: t('expensiveDesc'), Icon: Crown },
  ]

  return (
    <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
      {onBack && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-stone-400 transition-colors hover:text-stone-600"
        >
          <ArrowLeft className="h-4 w-4" />
          {tCommon('back')}
        </motion.button>
      )}
      <Header title={displayTitle} subtitle={displaySubtitle} />

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
        {selectedPriceLevel !== null ? tCommon('continue') : t('selectPrice')}
      </motion.button>
    </div>
  )
}


