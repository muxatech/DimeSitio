'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@/i18n/navigation'
import { checkStaffStatus, getGlobalMetrics } from '@/lib/panel/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Eye, Users, Play, HelpCircle, Store, Trophy, Phone, MapPin, Menu, Calendar, Crown, Camera } from 'lucide-react'
import Link from 'next/link'

export default function StatsPage() {
  const router = useRouter()
  const [isStaff, setIsStaff] = useState<boolean | null>(null)

  useEffect(() => {
    checkStaffStatus().then((staff) => {
      if (!staff) router.replace('/dashboard')
      else setIsStaff(true)
    })
  }, [router])

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['global-metrics'],
    queryFn: getGlobalMetrics,
    enabled: isStaff === true,
  })

  if (isStaff === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-900" />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-stone-100" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-100" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-semibold text-red-700">Error cargando métricas</p>
        <p className="text-sm text-red-500">{(error as Error)?.message}</p>
      </div>
    )
  }

  const t = data!.totals

  const cards = [
    { label: 'Visitas', value: t.page_views_7d, sub: `30d: ${t.page_views_30d}`, icon: Eye },
    { label: 'Únicas', value: t.uniques_7d, sub: 'visitantes', icon: Users },
    { label: 'Flow starts', value: t.flow_starts_7d, sub: `30d: ${t.flow_starts_30d}`, icon: Play },
    { label: 'Q categorías', value: t.q_categories_7d, icon: HelpCircle },
    { label: 'Q precio', value: t.q_price_7d, icon: HelpCircle },
    { label: 'Q zona', value: t.q_location_7d, icon: HelpCircle },
    { label: '/restaurantes', value: t.restaurantes_views_7d, icon: Store },
    { label: 'Activos', value: t.restaurants_active, icon: Crown },
    { label: 'Top5 impres.', value: t.impressions_7d, sub: `30d: ${t.impressions_30d}`, icon: Eye },
    { label: 'Winners', value: t.cta_winner_7d, icon: Trophy },
    { label: 'Calls', value: t.cta_call_7d, sub: `30d: ${t.cta_call_30d}`, icon: Phone },
    { label: 'Maps', value: t.cta_maps_7d, icon: MapPin },
    { label: 'Menú', value: t.cta_menu_7d, icon: Menu },
    { label: 'Reservas', value: t.cta_reservations_7d, icon: Calendar },
    { label: 'Instagram', value: t.cta_instagram_7d, icon: Camera },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">Stats</h1>
        <p className="text-sm text-stone-500">Métricas generales (últimos 7 días, sumatorio 30d donde aplica)</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-stone-400">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{c.label}</span>
              </div>
              <div className="mt-1 text-2xl font-extrabold text-stone-900">{c.value}</div>
              {c.sub && <div className="text-xs text-stone-400">{c.sub}</div>}
            </div>
          )
        })}
      </div>

      {data!.daily.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-4 text-sm font-semibold text-stone-700">Evolución diaria (30d)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data!.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="page_views" fill="#1c1917" name="Visitas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="flow_starts" fill="#a8a29e" name="Flow" radius={[4, 4, 0, 0]} />
                <Bar dataKey="impressions" fill="#f59e0b" name="Top5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cta" fill="#16a34a" name="CTA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {data!.topRestaurants.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-3 text-sm font-semibold text-stone-700">Restaurantes destacados (30d)</h3>
          <div className="divide-y divide-stone-100">
            {data!.topRestaurants.map((r) => (
              <Link key={`${r.type}-${r.restaurant_id}`} href={`/sitio/${r.restaurant_id}`} className="flex items-center justify-between py-2.5 hover:bg-stone-50 px-2 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">{r.type}</span>
                  <span className="text-sm font-medium text-stone-800">{r.name}</span>
                </div>
                <span className="text-sm font-bold text-stone-900">{r.count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
