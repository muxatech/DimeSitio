'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyRestaurants, deleteRestaurant, checkStaffStatus } from '@/lib/panel/api'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, Frown, UserPlus } from 'lucide-react'
import RestaurantPanelCard from '@/components/restaurant-panel-card'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

export default function EstablecimientosPage() {
  const queryClient = useQueryClient()

  const { data: restaurants, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-restaurants'],
    queryFn: getMyRestaurants,
  })

  const { data: isStaff } = useQuery({
    queryKey: ['staff-status'],
    queryFn: checkStaffStatus,
    staleTime: 60000,
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
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          {isStaff && (
            <Link
              href="/establecimientos/crear-para-cliente"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 sm:px-6 sm:py-3.5 sm:text-base"
            >
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
              Crear para un cliente
            </Link>
          )}
          <Link
            href="/establecimientos/nuevo"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-800 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700 sm:px-6 sm:py-3.5 sm:text-base"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            Añadir establecimiento
          </Link>
        </div>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {restaurants?.map((r) => (
            <RestaurantPanelCard
              key={r.id}
              restaurant={r}
              showActions
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
