'use client'

import { type ComponentType } from 'react'
import { motion } from 'framer-motion'
import { useFlowStore } from '@/store/flow-store'
import { getPriceLabel, getSessionId } from '@/lib/utils'
import { trackCall } from '@/lib/tracking'
import { MapPin, Phone, Navigation, Menu, PartyPopper, UtensilsCrossed, RotateCcw } from 'lucide-react'

export default function WinnerView() {
  const { winner, reset, sessionId } = useFlowStore()

  if (!winner) return null

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
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-700 shadow-lg sm:h-16 sm:w-16">
            <PartyPopper className="h-7 w-7 text-white sm:h-8 sm:w-8" />
          </span>
        </motion.div>
        <p className="text-sm font-medium text-stone-500 sm:text-base">
          Tu elección
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
              <img
                src={winner.image_url}
                alt={winner.name}
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
                label="Llamar"
                icon={Phone}
                onTrack={() => trackCall(winner.id, sessionId || getSessionId())}
              />
            )}

            {winner.lat && winner.lng && (
              <ActionButton
                href={`https://www.google.com/maps/dir/?api=1&destination=${winner.lat},${winner.lng}`}
                label="Cómo llegar"
                icon={Navigation}
              />
            )}

            {winner.menu_url && (
              <ActionButton
                href={winner.menu_url}
                label="Ver menú"
                icon={Menu}
              />
            )}
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        onClick={reset}
        className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-stone-800 py-4 text-base font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700 sm:py-4 sm:text-lg lg:py-5 lg:text-xl"
      >
        <RotateCcw className="h-5 w-5" />
        Empezar de nuevo
      </motion.button>
    </motion.div>
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
