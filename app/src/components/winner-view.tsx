'use client'

import { type ComponentType } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useFlowStore } from '@/store/flow-store'
import { getPriceLabel } from '@/lib/utils'
import { MapPin, Phone, Navigation, Menu, Calendar, PartyPopper, UtensilsCrossed, RotateCcw, Crown } from 'lucide-react'

export default function WinnerView() {
  const t = useTranslations('Winner')
  const tCommon = useTranslations('Common')
  const { winner, startNewFlow } = useFlowStore()

  if (!winner) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-base font-semibold text-stone-700 sm:text-lg">{t('noSelection')}</p>
        <p className="max-w-xs text-sm text-stone-400">{t('noSelectionDesc')}</p>
        <button
        onClick={startNewFlow}
          className="inline-flex items-center gap-2 rounded-2xl bg-stone-800 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-stone-700"
        >
          <RotateCcw className="h-5 w-5" />
          {tCommon('startOver')}
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 sm:gap-8 lg:gap-10"
    >
      {/* Celebration header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
          className="mb-4 inline-flex items-center justify-center"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 shadow-lg sm:h-16 sm:w-16">
            <PartyPopper className="h-7 w-7 text-white sm:h-8 sm:w-8" />
          </span>
        </motion.div>
        <p className="text-sm font-medium text-stone-500 sm:text-base">
          {t('celebration')}
        </p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
          {winner.name}
        </h2>
      </div>

      {/* Desktop: image + info side by side */}
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="overflow-hidden rounded-2xl bg-stone-100 shadow-sm sm:flex-1"
        >
          <div className="relative h-56 bg-stone-100 sm:h-full sm:min-h-64 lg:min-h-80">
            {winner.image_url ? (
              <Image
                src={winner.image_url}
                alt={winner.name}
                width={800}
                height={600}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <UtensilsCrossed className="h-10 w-10 text-stone-300 sm:h-12 sm:w-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
          </div>
        </motion.div>

        {/* Info + actions column */}
        <div className="flex flex-col gap-4 sm:w-72 sm:gap-5 lg:w-96 lg:gap-6">
          <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
            <div className="flex flex-wrap gap-2">
              {winner.founder_rank && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800 sm:text-base" title={tCommon('founder')}>
                  <Crown className="h-3.5 w-3.5" /> {tCommon('founder')}
                </span>
              )}
              {winner.is_demo && (
                <span className="rounded-full bg-stone-200 px-3 py-1 text-sm font-medium text-stone-500 sm:text-base">
                  {tCommon('demo')}
                </span>
              )}
              {winner.zone && (
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600 sm:text-base">
                  <MapPin className="h-3.5 w-3.5" /> {winner.zone}
                </span>
              )}
              <span className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600 sm:text-base">
                {getPriceLabel(winner.price_level)}
              </span>
              {winner.address && (
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600 sm:text-base">
                  <MapPin className="h-3.5 w-3.5" /> {winner.address}
                </span>
              )}
            </div>
            {winner.description && (
              <p className="pt-1 text-sm leading-relaxed text-stone-500 sm:text-base">
                {winner.description}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:gap-3">
            {winner.phone && (
              <ActionButton
                href={`tel:${winner.phone}`}
                label={tCommon('call')}
                icon={Phone}
              />
            )}

            {winner.address && (
              <ActionButton
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(winner.address + ', Valencia')}`}
                label={tCommon('directions')}
                icon={Navigation}
              />
            )}

            {winner.menu_url && (
              <ActionButton
                href={winner.menu_url}
                label={tCommon('viewMenu')}
                icon={Menu}
              />
            )}

            {winner.reservations_url && (
              <ActionButton
                href={winner.reservations_url}
                label={tCommon('reserve')}
                icon={Calendar}
              />
            )}

            {winner.instagram_url && (
              <ActionButton
                href={winner.instagram_url}
                label={tCommon('viewInstagram')}
                icon={InstagramIcon}
              />
            )}
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        onClick={startNewFlow}
        className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-stone-800 py-4 text-base font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700 sm:py-4 sm:text-lg lg:py-5 lg:text-xl"
      >
        <RotateCcw className="h-5 w-5" />
        {tCommon('startOver')}
      </motion.button>
    </motion.div>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label="Instagram">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  )
}

function ActionButton({
  href,
  label,
  icon: Icon,
  onTrack,
}: {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
  onTrack?: () => void
}) {
  return (
    <motion.a
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      onClick={onTrack}
      className="inline-flex items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white py-4 text-base font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md sm:py-4 sm:text-lg lg:py-5"
    >
      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      {label}
    </motion.a>
  )
}
