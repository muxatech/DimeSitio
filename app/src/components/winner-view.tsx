'use client'

import { motion } from 'framer-motion'
import { useFlowStore } from '@/store/flow-store'
import { getPriceLabel, getSessionId } from '@/lib/utils'
import { trackCall } from '@/lib/tracking'

export default function WinnerView() {
  const { winner, reset, sessionId } = useFlowStore()

  if (!winner) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6"
    >
      <div className="text-center">
        <p className="text-sm font-medium text-orange-500">Tu elección</p>
        <h2 className="mt-1 text-3xl font-bold text-zinc-900">{winner.name}</h2>
      </div>

      <div className="h-56 w-full overflow-hidden rounded-2xl bg-zinc-100 sm:h-64">
        {winner.image_url ? (
          <img
            src={winner.image_url}
            alt={winner.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl">🍽️</div>
        )}
      </div>

      <div className="w-full space-y-3">
        <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
          {winner.zone && (
            <span className="rounded-full bg-zinc-100 px-3 py-1">📍 {winner.zone}</span>
          )}
          <span className="rounded-full bg-zinc-100 px-3 py-1">
            {getPriceLabel(winner.price_level)}
          </span>
          {winner.address && (
            <span className="rounded-full bg-zinc-100 px-3 py-1">🏠 {winner.address}</span>
          )}
        </div>

        {winner.description && (
          <p className="text-zinc-500">{winner.description}</p>
        )}
      </div>

      <div className="flex w-full flex-col gap-3">
        {winner.phone && (
          <ActionButton
            href={`tel:${winner.phone}`}
            label="Llamar"
            emoji="📞"
            className="bg-green-500 text-white shadow-lg shadow-green-200 hover:bg-green-600"
            onTrack={() => trackCall(winner.id, sessionId || getSessionId())}
          />
        )}

        {winner.lat && winner.lng && (
          <ActionButton
            href={`https://www.google.com/maps/dir/?api=1&destination=${winner.lat},${winner.lng}`}
            label="Cómo llegar"
            emoji="🗺️"
            className="bg-blue-500 text-white shadow-lg shadow-blue-200 hover:bg-blue-600"
          />
        )}

        {winner.menu_url && (
          <ActionButton
            href={winner.menu_url}
            label="Ver menú"
            emoji="📋"
            className="bg-zinc-800 text-white hover:bg-zinc-900"
          />
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={reset}
          className="mt-2 w-full rounded-full border-2 border-zinc-200 py-4 text-base font-semibold text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-800"
        >
          Empezar de nuevo
        </motion.button>
      </div>
    </motion.div>
  )
}

function ActionButton({
  href,
  label,
  emoji,
  className,
  onTrack,
}: {
  href: string
  label: string
  emoji: string
  className: string
  onTrack?: () => void
}) {
  return (
    <motion.a
      whileTap={{ scale: 0.95 }}
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      onClick={onTrack}
      className={`flex items-center justify-center gap-2 rounded-full py-4 text-lg font-semibold transition-colors ${className}`}
    >
      <span>{emoji}</span>
      {label}
    </motion.a>
  )
}
