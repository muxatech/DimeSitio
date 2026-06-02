'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { getMyRestaurants, createCheckoutSession, createPortalSession } from '@/lib/panel/api'
import { motion } from 'framer-motion'
import { CheckCircle, CreditCard, ExternalLink, Frown, RefreshCw, Store, Loader, Clock } from 'lucide-react'
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
  const router = useRouter()
  const { data: restaurants, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['my-restaurants'],
    queryFn: getMyRestaurants,
  })

  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [timeoutId, setTimeoutId] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const rid = params.get('restaurant_id')
    if (params.get('checking') === 'true' && rid) {
      setVerifyingId(rid)
      window.history.replaceState(null, '', '/suscripcion')
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (!verifyingId) return

    pollingRef.current = setInterval(async () => {
      if (!mountedRef.current) return
      const result = await refetch()
      const target = result.data?.find((r) => r.id === verifyingId)
      if (target?.subscription_status === 'active') {
        if (!mountedRef.current) return
        setShowSuccessModal(true)
        setVerifyingId(null)
        setTimeoutId(null)
        if (pollingRef.current) clearInterval(pollingRef.current)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
    }, 2000)

    timeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return
      if (pollingRef.current) clearInterval(pollingRef.current)
      setTimeoutId(verifyingId)
      setVerifyingId(null)
    }, 15000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [verifyingId, refetch])

  async function handleCheckout(restaurantId: string) {
    setLoadingId(restaurantId)
    try {
      const url = await createCheckoutSession(restaurantId)
      window.location.assign(url)
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Error al iniciar el pago')
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
      setErrorMessage(e instanceof Error ? e.message : 'Error al abrir el portal')
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
    if (error instanceof Error && error.message === 'No hay sesión activa') {
      router.replace('/login')
      return null
    }
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
      className="flex flex-col gap-6 sm:gap-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
            Suscripción
          </h1>
          <p className="mt-1 text-sm text-stone-400 sm:text-base">
            Gestiona la suscripción de cada establecimiento — 29€/mes
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}
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
            const isPending = verifyingId === r.id
            const isTimeout = timeoutId === r.id
            const isActive = r.subscription_status === 'active'
            const isProcessing = isLoadingThis || isPending

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
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-900 sm:text-base">{r.name}</p>
                    {isPending && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-amber-600">
                        <Clock className="h-3.5 w-3.5 animate-pulse" />
                        Verificando pago...
                      </p>
                    )}
                    {isTimeout && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-amber-600">
                        <Clock className="h-3.5 w-3.5" />
                        Tardando más de lo normal —{' '}
                        <button onClick={() => refetch()} className="underline hover:no-underline">
                          Actualizar
                        </button>
                      </p>
                    )}
                    {!isPending && !isTimeout && (
                      <p className="mt-0.5 text-sm text-stone-400">29€/mes</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={
                      isActive
                        ? 'rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white'
                        : 'rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-400'
                    }
                  >
                    {isActive ? 'Activa' : 'Inactiva'}
                  </span>
                  {isActive ? (
                    <button
                      onClick={() => handlePortal(r.id)}
                      disabled={isProcessing}
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
                      disabled={isProcessing}
                      className="inline-flex items-center gap-2 rounded-2xl bg-stone-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-stone-700 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                      {isPending ? 'Verificando' : 'Activar'}
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl bg-white p-8 text-center shadow-xl"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Suscripción activa
              </h2>
              <p className="mt-2 text-sm text-stone-400">
                Tu establecimiento ya puede encontrarse en DimeSitio.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full rounded-2xl bg-stone-800 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-stone-700"
            >
              Entendido
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
