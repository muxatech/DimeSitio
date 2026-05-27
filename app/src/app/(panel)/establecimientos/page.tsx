'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyRestaurants, deleteRestaurant } from '@/lib/panel/api'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Frown } from 'lucide-react'
import { getPriceLabel } from '@/lib/utils'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export default function EstablecimientosPage() {
  const queryClient = useQueryClient()

  const { data: restaurants, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-restaurants'],
    queryFn: getMyRestaurants,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-restaurants'] })
    },
  })

  function handleDelete(id: string, name: string) {
    if (confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-900" />
          <p className="text-sm text-stone-400">Cargando establecimientos...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-stone-700 sm:text-lg">
            Vaya, algo salió mal
          </p>
          <p className="max-w-xs text-sm text-stone-400">
            No hemos podido cargar tus establecimientos.
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 sm:gap-10"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
          Mis establecimientos
        </h1>
        <Link
          href="/establecimientos/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-800 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700 sm:px-6 sm:py-3.5 sm:text-base"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          Añadir establecimiento
        </Link>
      </div>

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
                  <th className="px-4 py-3 font-semibold text-stone-700 sm:px-5">Estado</th>
                  <th className="px-4 py-3 font-semibold text-stone-700 sm:px-5">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {restaurants?.map((r) => (
                  <motion.tr
                    key={r.id}
                    variants={itemVariants}
                    className="bg-white transition-colors hover:bg-stone-50"
                  >
                    <td className="px-4 py-3 font-medium text-stone-900 sm:px-5">{r.name}</td>
                    <td className="px-4 py-3 text-stone-500 sm:px-5">{r.zone ?? '—'}</td>
                    <td className="px-4 py-3 text-stone-500 sm:px-5">{getPriceLabel(r.price_level)}</td>
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
                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/establecimientos/${r.id}`}
                          className="inline-flex items-center justify-center rounded-xl p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(r.id, r.name)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center justify-center rounded-xl p-2 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-400 disabled:opacity-50"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  )
}
