'use client'

import { Phone, Navigation, Menu, Calendar } from 'lucide-react'
import { trackCall, trackCta } from '@/lib/tracking'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label="Instagram">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

export default function SitioCta({
  restaurant,
  labels,
}: {
  restaurant: { id: string; phone: string | null; address: string | null; google_maps_url: string | null; menu_url: string | null; reservations_url: string | null; instagram_url: string | null }
  labels: { call: string; directions: string; viewMenu: string; reserve: string; viewInstagram: string }
}) {
  return (
    <div className="flex flex-col gap-2 sm:gap-3 lg:w-80 lg:shrink-0">
      {restaurant.phone && (
        <a
          href={`tel:${restaurant.phone}`}
          onClick={() => trackCall(restaurant.id)}
          className="inline-flex items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white py-4 text-base font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md"
        >
          <Phone className="h-5 w-5" /> {labels.call}
        </a>
      )}
      {(restaurant.google_maps_url || restaurant.address) && (
        <a
          href={restaurant.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((restaurant.address ?? '') + ', Valencia')}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackCta(restaurant.id, 'maps')}
          className="inline-flex items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white py-4 text-base font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md"
        >
          <Navigation className="h-5 w-5" /> {labels.directions}
        </a>
      )}
      {restaurant.menu_url && (
        <a
          href={restaurant.menu_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackCta(restaurant.id, 'menu')}
          className="inline-flex items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white py-4 text-base font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md"
        >
          <Menu className="h-5 w-5" /> {labels.viewMenu}
        </a>
      )}
      {restaurant.reservations_url && (
        <a
          href={restaurant.reservations_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackCta(restaurant.id, 'reservations')}
          className="inline-flex items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white py-4 text-base font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md"
        >
          <Calendar className="h-5 w-5" /> {labels.reserve}
        </a>
      )}
      {restaurant.instagram_url && (
        <a
          href={restaurant.instagram_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackCta(restaurant.id, 'instagram')}
          className="inline-flex items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white py-4 text-base font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md"
        >
          <InstagramIcon className="h-5 w-5" /> {labels.viewInstagram}
        </a>
      )}
    </div>
  )
}
