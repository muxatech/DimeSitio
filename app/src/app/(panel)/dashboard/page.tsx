'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMyRestaurants, getRestaurantAnalytics } from '@/lib/panel/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Store, Eye, CheckCircle2, Phone, Plus, Frown, RefreshCw, TrendingUp, Target } from 'lucide-react'
import { getPriceLabel } from '@/lib/utils'


const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

function ChartSkeleton() {
  return (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-stone-200 bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-900" />
    </div>
  )
}

interface AnalyticsSectionProps {
  restaurantId: string
  restaurantName: string
}

function AnalyticsSection({ restaurantId, restaurantName }: AnalyticsSectionProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics', restaurantId],
    queryFn: () => getRestaurantAnalytics(restaurantId),
  })

  if (isLoading) return <ChartSkeleton />

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <RefreshCw className="h-6 w-6 text-red-400" />
        <p className="text-sm text-stone-500">No se pudieron cargar los datos</p>
        <button onClick={() => refetch()} className="rounded-xl bg-stone-800 px-4 py-2 text-xs font-semibold text-white">
          Reintentar
        </button>
      </div>
    )
  }

  if (!data) return null

  const { totals, daily } = data

  const metrics = [
    { label: 'Impresiones (7d)', value: totals.impressions_7d, icon: Eye, color: 'text-blue-500' },
    { label: 'Selecciones (7d)', value: totals.selections_7d, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Llamadas (7d)', value: totals.calls_7d, icon: Phone, color: 'text-amber-500' },
    { label: 'Conversión', value: `${(totals.conversion_rate * 100).toFixed(1)}%`, icon: Target, color: 'text-violet-500' },
    { label: 'Ratio selección', value: `${(totals.selection_rate * 100).toFixed(1)}%`, icon: TrendingUp, color: 'text-stone-600' },
  ]

  const chartData = daily.length > 0 ? daily : [{ date: 'Sin datos', impressions: 0, selections: 0, calls: 0 }]

  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-6">
      <h3 className="text-base font-bold text-stone-900 sm:text-lg">
        Analytics: {restaurantName}
      </h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div key={m.label} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <Icon className={`mb-2 h-5 w-5 ${m.color}`} />
              <p className="text-xl font-bold text-stone-900 sm:text-2xl">{m.value}</p>
              <p className="text-xs text-stone-400 sm:text-sm">{m.label}</p>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <h4 className="mb-4 text-sm font-semibold text-stone-700">Evolución diaria (últimos 30 días)</h4>
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#a8a29e' }}
                tickFormatter={(v: string) => v.slice(5)}
                axisLine={{ stroke: '#e7e5e4' }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e7e5e4',
                  fontSize: 13,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="impressions" name="Impresiones" fill="#78716c" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="selections" name="Selecciones" fill="#a8a29e" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="calls" name="Llamadas" fill="#d6d3d1" radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: restaurants, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-restaurants'],
    queryFn: getMyRestaurants,
  })

  const totalImpressions = restaurants?.reduce((sum, r) => sum + (r.stats?.impressions ?? 0), 0) ?? 0
  const totalSelections = restaurants?.reduce((sum, r) => sum + (r.stats?.selections ?? 0), 0) ?? 0
  const totalCalls = restaurants?.reduce((sum, r) => sum + (r.stats?.calls ?? 0), 0) ?? 0
  const totalRestaurants = restaurants?.length ?? 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-900" />
          <p className="text-sm text-stone-400">Cargando panel...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <RefreshCw className="h-7 w-7 text-red-400" />
          </div>
          <p className="text-base font-semibold text-stone-700 sm:text-lg">
            Vaya, algo salió mal
          </p>
          <p className="max-w-xs text-sm text-stone-400">
            No hemos podido cargar tus datos. Comprueba tu conexión.
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-2xl bg-stone-800 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-stone-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const metrics = [
    { label: 'Restaurantes totales', value: totalRestaurants, icon: Store },
    { label: 'Impresiones totales', value: totalImpressions, icon: Eye },
    { label: 'Selecciones totales', value: totalSelections, icon: CheckCircle2 },
    { label: 'Llamadas totales', value: totalCalls, icon: Phone },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 sm:gap-10"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
          Panel de control
        </h1>
        <Link
          href="/establecimientos/nuevo"
          className="inline-flex items-center gap-2 rounded-2xl bg-stone-800 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700 sm:px-6 sm:py-3.5 sm:text-base"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          Añadir establecimiento
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={metric.label}
              variants={itemVariants}
              className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 sm:h-12 sm:w-12">
                <Icon className="h-5 w-5 text-stone-600 sm:h-6 sm:w-6" />
              </div>
              <p className="text-2xl font-bold text-stone-900 sm:text-3xl">{metric.value}</p>
              <p className="text-sm text-stone-400 sm:text-base">{metric.label}</p>
            </motion.div>
          )
        })}
      </div>

      {restaurants && restaurants.length > 0 && (
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 sm:text-xl">Analytics por restaurante</h2>
            <select
              value={selectedId ?? ''}
              onChange={(e) => setSelectedId(e.target.value || null)}
              className="rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-700 shadow-sm focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200"
            >
              <option value="">Selecciona un restaurante...</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {selectedId && (
            <AnalyticsSection
              restaurantId={selectedId}
              restaurantName={restaurants.find((r) => r.id === selectedId)?.name ?? ''}
            />
          )}
        </motion.div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-bold text-stone-900 sm:text-xl">
          Mis establecimientos
        </h2>

        {restaurants && restaurants.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <Frown className="h-12 w-12 text-stone-300" />
            <div>
              <p className="text-base font-semibold text-stone-700">
                No tienes establecimientos
              </p>
              <p className="mt-1 text-sm text-stone-400">
                Añade tu primer restaurante para empezar.
              </p>
            </div>
            <Link
              href="/establecimientos/nuevo"
              className="inline-flex items-center gap-2 rounded-2xl bg-stone-800 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-stone-700"
            >
              <Plus className="h-4 w-4" />
              Añadir establecimiento
            </Link>
          </div>
        ) : (
          <div className="w-full overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-stone-700 sm:px-5">Nombre</th>
                    <th className="px-4 py-3 font-semibold text-stone-700 sm:px-5">Zona</th>
                    <th className="px-4 py-3 font-semibold text-stone-700 sm:px-5">Precio</th>
                    <th className="px-4 py-3 font-semibold text-stone-700 sm:px-5">Impresiones</th>
                    <th className="px-4 py-3 font-semibold text-stone-700 sm:px-5">Selecciones</th>
                    <th className="px-4 py-3 font-semibold text-stone-700 sm:px-5">Llamadas</th>
                    <th className="px-4 py-3 font-semibold text-stone-700 sm:px-5">Suscripción</th>
                    <th className="px-4 py-3 font-semibold text-stone-700 sm:px-5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {restaurants?.map((r) => (
                    <tr key={r.id} className="bg-white transition-colors hover:bg-stone-50">
                      <td className="px-4 py-3 font-medium text-stone-900 sm:px-5">
                        <Link href={`/establecimientos/${r.id}`} className="hover:underline">
                          {r.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-stone-500 sm:px-5">{r.zone ?? '—'}</td>
                      <td className="px-4 py-3 text-stone-500 sm:px-5">{getPriceLabel(r.price_level)}</td>
                      <td className="px-4 py-3 text-stone-500 sm:px-5">{r.stats?.impressions ?? 0}</td>
                      <td className="px-4 py-3 text-stone-500 sm:px-5">{r.stats?.selections ?? 0}</td>
                      <td className="px-4 py-3 text-stone-500 sm:px-5">{r.stats?.calls ?? 0}</td>
                      <td className="px-4 py-3 sm:px-5">
                        <span
                          className={
                            r.subscription_status === 'active'
                              ? 'rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white'
                              : 'rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-400'
                          }
                        >
                          {r.subscription_status === 'active' ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-4 py-3 sm:px-5">
                        <span
                          className={
                            r.active
                              ? 'rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white'
                              : 'rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-400'
                          }
                        >
                          {r.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
