'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@/i18n/navigation'
import { getMyRestaurants, getRestaurantAnalytics, checkStaffStatus } from '@/lib/panel/api'
import { NO_SESSION_ERROR } from '@/lib/constants'
import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { Plus, Frown, RefreshCw, UserPlus } from 'lucide-react'
import RestaurantPanelCard from '@/components/restaurant-panel-card'
import { AnalyticsSection } from '@/components/analytics-section'
import { useTranslations } from 'next-intl'


const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}



export default function DashboardPage() {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string>('')
  const t = useTranslations('Dashboard')

  const { data: restaurants, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['my-restaurants'],
    queryFn: getMyRestaurants,
  })

  useEffect(() => {
    if (restaurants && restaurants.length > 0 && !selectedId) {
      setSelectedId(restaurants[0].id)
    }
  }, [restaurants, selectedId])

  const { data: isStaff } = useQuery({
    queryKey: ['staff-status'],
    queryFn: checkStaffStatus,
    staleTime: 60000,
  })

  const totalRestaurants = restaurants?.length ?? 0

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
            <RefreshCw className="h-7 w-7 text-red-400" />
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
            {t('retry')}
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
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
          {t('title')}
          {totalRestaurants > 0 && (
            <span className="inline-flex items-center rounded-full bg-stone-900 px-3 py-1 text-sm font-semibold text-white">
              {totalRestaurants}
            </span>
          )}
        </h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          {isStaff && (
            <Link
              href="/establecimientos/crear-para-cliente"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 sm:px-6 sm:py-3.5 sm:text-base"
            >
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
              {t('createForClient')}
            </Link>
          )}
          <Link
            href="/establecimientos/nuevo"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-800 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700 sm:px-6 sm:py-3.5 sm:text-base"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            {t('addEstablishment')}
          </Link>
        </div>
      </div>

      {restaurants && restaurants.length > 0 && (
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 sm:text-xl">{t('restaurantStats')}</h2>
            <select
              value={selectedId || ''}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-700 shadow-sm focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200"
            >
              {!selectedId && <option value="">{t('selectRestaurant')}</option>}
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
            {t('myEstablishments')}
        </h2>

        {restaurants && restaurants.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <Frown className="h-12 w-12 text-stone-300" />
            <div>
              <p className="text-base font-semibold text-stone-700">
                {t('noEstablishments')}
              </p>
              <p className="mt-1 text-sm text-stone-400">
                {t('noEstablishmentsDesc')}
              </p>
            </div>
            <Link
              href="/establecimientos/nuevo"
              className="inline-flex items-center gap-2 rounded-2xl bg-stone-800 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-stone-700"
            >
              <Plus className="h-4 w-4" />
              {t('addEstablishment')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {restaurants?.map((r) => (
              <RestaurantPanelCard
                key={r.id}
                restaurant={r}
                showStats
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
