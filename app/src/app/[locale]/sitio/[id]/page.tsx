import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import PhotoCarousel from '@/components/photo-carousel'
import { getPriceLabel } from '@/lib/utils'
import { MapPin, Phone, Navigation, Menu, Calendar, Crown } from 'lucide-react'

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Params = { locale: string; id: string }

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try { cookieStore.set(name, value, options) } catch {}
          })
        },
      },
    }
  )
}

async function fetchRestaurant(id: string) {
  if (!UUID_RE.test(id)) return null
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('restaurants')
    .select('*, restaurant_categories(category_id)')
    .eq('id', id)
    .eq('active', true)
    .single()
  if (error || !data) return null
  return data as Record<string, unknown> & {
    id: string; name: string; description: string | null; phone: string | null
    address: string | null; zone: string | null; price_level: 1|2|3
    image_url: string | null; photos: string[] | null; menu_url: string | null
    reservations_url: string | null; instagram_url: string | null
    google_maps_url: string | null; lat: number | null; lng: number | null
    founder_rank: number | null; is_demo: boolean | null
    restaurant_categories?: { category_id: string }[]
  }
}

async function fetchCategoryNames(ids: string[]) {
  if (!ids.length) return new Map<string, string>()
  const supabase = await getSupabase()
  const { data } = await supabase.from('categories').select('id, name').in('id', ids)
  return new Map((data ?? []).map((c: { id: string; name: string }) => [c.id, c.name]))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, id } = await params
  const restaurant = await fetchRestaurant(id)
  if (!restaurant) return { title: 'Restaurante no encontrado' }
  const t = await getTranslations({ locale, namespace: 'Ficha' }).catch(() => null)
  const title = `${restaurant.name} | DimeSitio`
  const description = restaurant.description?.slice(0, 155) || (t ? t('metaFallback') : `${restaurant.name} en ${restaurant.zone ?? 'Valencia'} — ${getPriceLabel(restaurant.price_level)}`)
  const ogLocale = locale === 'es' ? 'es_ES' : 'en_GB'
  const photos = (restaurant.photos as string[] | null) ?? []
  const ogImage = photos[0] || restaurant.image_url || undefined
  return {
    title,
    description,
    alternates: {
      canonical: `https://dimesitio.es/${locale}/sitio/${id}`,
      languages: {
        es: `https://dimesitio.es/es/sitio/${id}`,
        en: `https://dimesitio.es/en/sitio/${id}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `https://dimesitio.es/${locale}/sitio/${id}`,
      locale: ogLocale,
      type: 'website',
      siteName: 'DimeSitio',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description, ...(ogImage ? { images: [ogImage] } : {}) },
  }
}

export default async function SitioPage({ params }: { params: Promise<Params> }) {
  const { locale, id } = await params
  const restaurant = await fetchRestaurant(id)
  if (!restaurant) notFound()

  const categoryIds = (restaurant.restaurant_categories ?? []).map((c) => c.category_id)
  const categoryMap = await fetchCategoryNames(categoryIds)
  const categoryNames = categoryIds.map((cid) => categoryMap.get(cid)).filter(Boolean) as string[]

  const photos = (restaurant.photos?.length ? restaurant.photos : restaurant.image_url ? [restaurant.image_url] : []) as string[]
  const tCommon = await getTranslations({ locale, namespace: 'Common' })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    description: restaurant.description ?? undefined,
    address: restaurant.address ? { '@type': 'PostalAddress', streetAddress: restaurant.address, addressLocality: 'Valencia', addressCountry: 'ES' } : undefined,
    geo: restaurant.lat && restaurant.lng ? { '@type': 'GeoCoordinates', latitude: restaurant.lat, longitude: restaurant.lng } : undefined,
    priceRange: getPriceLabel(restaurant.price_level),
    servesCuisine: categoryNames.length ? categoryNames : undefined,
    telephone: restaurant.phone ?? undefined,
    url: `https://dimesitio.es/${locale}/sitio/${id}`,
    image: photos[0] ?? undefined,
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="flex flex-col gap-6 sm:gap-8">
        <div className="overflow-hidden rounded-2xl bg-stone-100 shadow-sm">
          <div className="relative h-64 sm:h-80 lg:h-[28rem]">
            <PhotoCarousel photos={photos} name={restaurant.name} showArrows />
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">{restaurant.name}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {restaurant.founder_rank && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
                    <Crown className="h-3.5 w-3.5" /> {tCommon('founder')}
                  </span>
                )}
                {restaurant.zone && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600">
                    <MapPin className="h-3.5 w-3.5" /> {restaurant.zone}
                  </span>
                )}
                <span className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600">{getPriceLabel(restaurant.price_level)}</span>
                {restaurant.address && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600">
                    <MapPin className="h-3.5 w-3.5" /> {restaurant.address}
                  </span>
                )}
              </div>
            </div>

            {restaurant.description && (
              <p className="rounded-2xl border border-stone-200 bg-white p-4 text-sm leading-relaxed text-stone-600 shadow-sm sm:p-5 sm:text-base">
                {restaurant.description}
              </p>
            )}

            {categoryNames.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categoryNames.map((name) => (
                  <span key={name} className="rounded-full border border-stone-200 bg-white px-3 py-1 text-sm font-medium text-stone-700">
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:gap-3 lg:w-80 lg:shrink-0">
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} className="inline-flex items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white py-4 text-base font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md">
                <Phone className="h-5 w-5" /> {tCommon('call')}
              </a>
            )}
            {(restaurant.google_maps_url || restaurant.address) && (
              <a href={restaurant.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((restaurant.address ?? '') + ', Valencia')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white py-4 text-base font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md">
                <Navigation className="h-5 w-5" /> {tCommon('directions')}
              </a>
            )}
            {restaurant.menu_url && (
              <a href={restaurant.menu_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white py-4 text-base font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md">
                <Menu className="h-5 w-5" /> {tCommon('viewMenu')}
              </a>
            )}
            {restaurant.reservations_url && (
              <a href={restaurant.reservations_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white py-4 text-base font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md">
                <Calendar className="h-5 w-5" /> {tCommon('reserve')}
              </a>
            )}
            {restaurant.instagram_url && (
              <a href={restaurant.instagram_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white py-4 text-base font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md">
                <InstagramIcon className="h-5 w-5" /> {tCommon('viewInstagram')}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label="Instagram">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}
