'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMyRestaurants, createCheckoutSession, createPortalSession } from '@/lib/panel/api'
import { motion } from 'framer-motion'
import { CreditCard, ExternalLink, Frown, RefreshCw, Store, Loader } from 'lucide-react'
import Link from 'next/link'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export default function SuscripcionPage() {
  const { data: restaurants, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-restaurants'],
    queryFn: getMyRestaurants,
  })

  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleCheckout(restaurantId: string) {
    setLoadingId(restaurantId)
    try {
      const url = await createCheckoutSession(restaurantId)
      window.location.assign(url)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al iniciar el pago')
    } finally {
      setLoadingId(null)
    }
  }

  async function handlePortal(restaurantId: string) {
    setLoadingId(restaurantId)
    try {
      const url = await createPortalSession(restaurantId)
      window.location.assign(url)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al abrir el portal')
    } finally {
      setLoadingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-900" />
          <p className="text-sm text-stone-400">Cargando suscripciones...</p>
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
            No hemos podido cargar los datos de suscripción.
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
          Suscripción
        </h1>
        <p className="mt-1 text-sm text-stone-400 sm:text-base">
          Gestiona la suscripción de cada establecimiento — 29€/mes
        </p>
      </div>

      {restaurants && restaurants.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Frown className="h-12 w-12 text-stone-300" />
          <div>
            <p className="text-base font-semibold text-stone-700">
              No tienes establecimientos
            </p>
            <p className="mt-1 text-sm text-stone-400">
              Añade un establecimiento para gestionar su suscripción.
            </p>
          </div>
          <Link
            href="/establecimientos/nuevo"
            className="inline-flex items-center gap-2 rounded-2xl bg-stone-800 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-stone-700"
          >
            <Store className="h-4 w-4" />
            Añadir establecimiento
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {restaurants?.map((r) => {
            const isLoadingThis = loadingId === r.id
            const isActive = r.subscription_status === 'active'

            return (
              <motion.div
                key={r.id}
                variants={itemVariants}
                className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 sm:h-12 sm:w-12">
                    <Store className="h-5 w-5 text-stone-600 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-900 sm:text-base">{r.name}</p>
                    <p className="mt-0.5 text-sm text-stone-400">29€/mes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={
                      isActive
                        ? 'rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white'
                        : 'rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-400'
                    }
                  >
                    {isActive ? 'Activa' : 'Inactiva'}
                  </span>
                  {isActive ? (
                    <button
                      onClick={() => handlePortal(r.id)}
                      disabled={isLoadingThis}
                      className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md disabled:opacity-50"
                    >
                      {isLoadingThis ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}
                      Gestionar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCheckout(r.id)}
                      disabled={isLoadingThis}
                      className="inline-flex items-center gap-2 rounded-2xl bg-stone-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-stone-700 disabled:opacity-50"
                    >
                      {isLoadingThis ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                      Activar
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
