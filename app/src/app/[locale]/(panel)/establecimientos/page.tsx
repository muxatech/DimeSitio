'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyRestaurants, deleteRestaurant, checkStaffStatus } from '@/lib/panel/api'
import { NO_SESSION_ERROR } from '@/lib/constants'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { Plus, Frown, UserPlus, X } from 'lucide-react'
import RestaurantPanelCard from '@/components/restaurant-panel-card'
import { useTranslations } from 'next-intl'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

export default function EstablecimientosPage() {
  const t = useTranslations('Establishments')
  const tCommon = useTranslations('Common')
  const tDashboard = useTranslations('Dashboard')
  const tCreateForClient = useTranslations('CreateForClient')
  const tForm = useTranslations('RestaurantForm')
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showFounderChoice, setShowFounderChoice] = useState(false)

  const { data: restaurants, isLoading, isError, error, refetch } = useQuery({
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
    if (confirm(t('confirmDelete', { name }))) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-900" />
          <p className="text-sm text-stone-400">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (isError) {
    if (error instanceof Error && error.message === NO_SESSION_ERROR) {
      router.replace('/login')
      return null
    }
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-stone-700 sm:text-lg">
            {t('errorTitle')}
          </p>
          <p className="max-w-xs text-sm text-stone-400">
            {t('errorDesc')}
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-2xl bg-stone-800 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-stone-700"
          >
            {tCommon('retry')}
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
          {t('title')}
        </h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          {isStaff && (
            <button
              onClick={() => setShowFounderChoice(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 sm:px-6 sm:py-3.5 sm:text-base"
            >
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
              {tDashboard('createForClient')}
            </button>
          )}
          <Link
            href="/establecimientos/nuevo"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-800 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700 sm:px-6 sm:py-3.5 sm:text-base"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            {tDashboard('addEstablishment')}
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {showFounderChoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5"
            onClick={() => setShowFounderChoice(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="flex w-full max-w-md flex-col gap-6 rounded-2xl bg-white p-6 shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">{tCreateForClient('founderChoiceTitle')}</h2>
                  <p className="mt-1 text-sm text-stone-400">{tCreateForClient('founderChoiceDesc')}</p>
                </div>
                <button onClick={() => setShowFounderChoice(false)} className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push('/establecimientos/crear-para-cliente?founder=39')}
                  className="flex flex-col rounded-2xl border-2 border-stone-200 bg-white p-4 text-left shadow-sm transition-all hover:border-stone-900 hover:bg-stone-50"
                >
                  <span className="text-sm font-bold text-stone-900">{tForm('founder_39')}</span>
                  <span className="mt-0.5 text-sm text-stone-400">{tForm('founder_39Desc')}</span>
                </button>
                <button
                  onClick={() => router.push('/establecimientos/crear-para-cliente?founder=69')}
                  className="flex flex-col rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-4 text-left shadow-sm transition-all hover:border-amber-400 hover:bg-amber-50"
                >
                  <span className="text-sm font-bold text-stone-900">{tForm('founder_69')}</span>
                  <span className="mt-0.5 text-sm text-stone-400">{tForm('founder_69Desc')}</span>
                </button>
              </div>
              <p className="text-xs text-stone-400">{tCreateForClient('founderChoiceHint')}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {restaurants && restaurants.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Frown className="h-12 w-12 text-stone-300" />
          <div>
            <p className="text-base font-semibold text-stone-700">
              {tDashboard('noEstablishments')}
            </p>
            <p className="mt-1 text-sm text-stone-400">
              {tDashboard('noEstablishmentsDesc')}
            </p>
          </div>
          <Link
            href="/establecimientos/nuevo"
            className="inline-flex items-center gap-2 rounded-2xl bg-stone-800 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-stone-700"
          >
            <Plus className="h-4 w-4" />
            {tDashboard('addEstablishment')}
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
