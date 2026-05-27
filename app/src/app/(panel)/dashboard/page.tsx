'use client'

import { useQuery } from '@tanstack/react-query'
import { getMyRestaurants } from '@/lib/panel/api'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Store, Eye, CheckCircle2, Phone, Plus, Frown, RefreshCw } from 'lucide-react'
import { getPriceLabel } from '@/lib/utils'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
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

      {/* Metrics cards */}
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

      {/* Table */}
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
