'use client'

import { useEffect, useRef, type ComponentType } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { getPriceLabel } from '@/lib/utils'
import { trackCta } from '@/lib/tracking'
import { MapPin, Crown, X } from 'lucide-react'
import PhotoCarousel from '@/components/photo-carousel'
import { useIsMobile } from '@/hooks/use-media-query'
import type { Restaurant } from '@/types'

export function restaurantPhotos(r: Restaurant): string[] {
  if (r.photos?.length) return r.photos
  return r.image_url ? [r.image_url] : []
}

export default function RestaurantModal({
  restaurant,
  onClose,
}: {
  restaurant: Restaurant | null
  onClose: () => void
}) {
  const t = useTranslations('RestaurantModal')
  const tCommon = useTranslations('Common')
  const isMobile = useIsMobile()
  const panelRef = useRef<HTMLDivElement>(null)

  // Móvil: la hoja sube desde el borde inferior completo, como una hoja nativa.
  // Escritorio: mantiene el pop centrado con escala suave que ya estaba aprobado.
  const sheetOffset = isMobile ? '100%' : 40
  const backdropOpacity = isMobile ? 0.72 : 0.6

  useEffect(() => {
    if (!restaurant) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    // iOS ignora overflow hidden en body, así que hace falta fijarlo.
    if (isMobile) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    }

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
      if (isMobile) {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [restaurant, onClose, isMobile])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {restaurant && (
        <motion.div
          data-testid="restaurant-modal"
          role="dialog"
          aria-modal="true"
          aria-label={restaurant.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{ backgroundColor: `rgba(0,0,0,${backdropOpacity})` }}
          className="fixed inset-0 z-50 flex items-end justify-center p-0 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <motion.div
            ref={panelRef}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: sheetOffset, scale: isMobile ? 1 : 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: sheetOffset, scale: isMobile ? 1 : 0.98 }}
            transition={{ type: 'tween', duration: isMobile ? 0.32 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={t('close')}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-all hover:bg-black/70 active:scale-90"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative h-56 shrink-0 bg-stone-100 sm:h-72">
              <PhotoCarousel photos={restaurantPhotos(restaurant)} name={restaurant.name} showArrows />
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5 sm:p-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {restaurant.founder_rank != null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                      <Crown className="h-3.5 w-3.5" /> {tCommon('founder')}
                    </span>
                  )}
                  {restaurant.is_demo && (
                    <span className="rounded-full bg-stone-200 px-2.5 py-1 text-xs font-medium text-stone-500">
                      {tCommon('demo')}
                    </span>
                  )}
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
                    {getPriceLabel(restaurant.price_level)}
                  </span>
                  {restaurant.zone && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">
                      <MapPin className="h-3.5 w-3.5" /> {restaurant.zone}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                  {restaurant.name}
                </h2>
                {restaurant.description && (
                  <p className="text-sm leading-relaxed text-stone-500 sm:text-base">
                    {restaurant.description}
                  </p>
                )}
                {restaurant.address && (
                  <p className="flex items-start gap-1.5 text-sm text-stone-400">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    {restaurant.address}
                  </p>
                )}
              </div>

              {restaurant.instagram_url && (
                <ModalAction
                  href={restaurant.instagram_url}
                  label={tCommon('viewInstagram')}
                  icon={InstagramIcon}
                  onTrack={() => trackCta(restaurant.id, 'instagram')}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

function ModalAction({
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
  const external = href.startsWith('http')
  return (
    <motion.a
      whileTap={{ scale: 0.97 }}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onClick={onTrack}
      className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-stone-900 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-stone-800 active:scale-[0.98]"
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </motion.a>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}
