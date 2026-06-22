'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { MapPin, UtensilsCrossed, Pencil, Trash2, Eye, CheckCircle2, Phone, Crown } from 'lucide-react'
import { getPriceLabel } from '@/lib/utils'
import type { RestaurantWithRole } from '@/types'

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

interface RestaurantPanelCardProps {
  restaurant: RestaurantWithRole
  showStats?: boolean
  showActions?: boolean
  onDelete?: (id: string, name: string) => void
  isDeleting?: boolean
}

export default function RestaurantPanelCard({
  restaurant,
  showStats,
  showActions,
  onDelete,
  isDeleting,
}: RestaurantPanelCardProps) {
  const router = useRouter()

  function handleNavigate() {
    router.push(`/establecimientos/${restaurant.id}`)
  }

  function handleEdit(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/establecimientos/${restaurant.id}`)
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    onDelete?.(restaurant.id, restaurant.name)
  }

  return (
    <motion.div
      variants={itemVariants}
      onClick={handleNavigate}
      className="cursor-pointer overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all hover:shadow-md"
    >
      <div className="relative h-36 w-full overflow-hidden bg-stone-100 sm:h-40 lg:h-44">
        {restaurant.image_url ? (
          <Image
            src={restaurant.image_url}
            alt={restaurant.name}
            width={400}
            height={300}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UtensilsCrossed className="h-8 w-8 text-stone-300 sm:h-10 sm:w-10" />
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <p className="truncate font-bold text-stone-900">{restaurant.name}</p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-stone-400 sm:text-sm">
          {restaurant.zone && (
            <>
              <MapPin className="h-3 w-3 shrink-0" />
              {restaurant.zone}
              <span className="mx-1">·</span>
            </>
          )}
          {getPriceLabel(restaurant.price_level)}
        </p>

        {showStats && restaurant.stats && (
          <div className="mt-3 flex items-center gap-3 border-t border-stone-100 pt-3 text-xs text-stone-400">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" /> {restaurant.stats.impressions}
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {restaurant.stats.selections}
            </span>
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3" /> {restaurant.stats.calls}
            </span>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {(restaurant.founder_rank || restaurant.plan_type === 'founder') && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800" title="Fundador">
              <Crown className="h-3 w-3" /> Fundador
            </span>
          )}
          {restaurant.is_demo && (
            <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[11px] font-medium text-stone-500">
              Demo
            </span>
          )}
          {restaurant.active ? (
            <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-medium text-white">
              Activo
            </span>
          ) : restaurant.subscription_status === 'active' ? (
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-400">
              Oculto
            </span>
          ) : (
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-400">
              Sin suscripción
            </span>
          )}
        </div>

        {showActions && (
          <div className="mt-3 flex items-center gap-1.5 border-t border-stone-100 pt-3">
            <button
              onClick={handleEdit}
              className="inline-flex items-center justify-center rounded-xl p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
              aria-label="Editar"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="inline-flex items-center justify-center rounded-xl p-2 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-400 disabled:opacity-50"
              aria-label="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
