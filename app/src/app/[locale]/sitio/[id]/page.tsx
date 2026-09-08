import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import PhotoCarousel from '@/components/photo-carousel'
import SitioCta from './sitio-cta'
import { getPriceLabel } from '@/lib/utils'
import { MapPin, Crown } from 'lucide-react'

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

          <SitioCta
            restaurant={{
              id: restaurant.id,
              phone: restaurant.phone,
              address: restaurant.address,
              google_maps_url: restaurant.google_maps_url,
              menu_url: restaurant.menu_url,
              reservations_url: restaurant.reservations_url,
              instagram_url: restaurant.instagram_url,
            }}
            labels={{
              call: tCommon('call'),
              directions: tCommon('directions'),
              viewMenu: tCommon('viewMenu'),
              reserve: tCommon('reserve'),
              viewInstagram: tCommon('viewInstagram'),
            }}
          />
        </div>
      </div>
    </div>
  )
}


