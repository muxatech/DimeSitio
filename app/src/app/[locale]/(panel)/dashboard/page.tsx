'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@/i18n/navigation'
import { getMyRestaurants, getRestaurantAnalytics, checkStaffStatus } from '@/lib/panel/api'
import { NO_SESSION_ERROR } from '@/lib/constants'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { Store, Eye, CheckCircle2, Phone, Plus, Frown, RefreshCw, TrendingUp, Target, UserPlus } from 'lucide-react'
import RestaurantPanelCard from '@/components/restaurant-panel-card'
import { useTranslations } from 'next-intl'


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
  const [chartRange, setChartRange] = useState<'7d' | '30d'>('30d')
  const t = useTranslations('Dashboard')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics', restaurantId],
    queryFn: () => getRestaurantAnalytics(restaurantId),
  })

  if (isLoading) return <ChartSkeleton />

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <RefreshCw className="h-6 w-6 text-red-400" />
        <p className="text-sm text-stone-500">{t('analyticsLoadError')}</p>
        <button onClick={() => refetch()} className="rounded-xl bg-stone-800 px-4 py-2 text-xs font-semibold text-white">
          {t('retry')}
        </button>
      </div>
    )
  }

  if (!data) return null

  const { totals, daily } = data

  const metrics = [
    { label: t('impressions7d'), value: totals.impressions_7d, icon: Eye, color: 'text-blue-500' },
    { label: t('selections7d'), value: totals.selections_7d, icon: CheckCircle2, color: 'text-green-500' },
    { label: t('calls7d'), value: totals.calls_7d, icon: Phone, color: 'text-amber-500' },
    { label: t('conversion'), value: `${(totals.conversion_rate * 100).toFixed(1)}%`, icon: Target, color: 'text-violet-500' },
    { label: t('selectionRate'), value: `${(totals.selection_rate * 100).toFixed(1)}%`, icon: TrendingUp, color: 'text-stone-600' },
  ]

  const chartData = daily.length > 0 ? daily : [{ date: t('noData'), impressions: 0, selections: 0, calls: 0 }]
  const slicedChartData = chartRange === '7d' ? chartData.slice(-7) : chartData

  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-6">
      <h3 className="text-base font-bold text-stone-900 sm:text-lg">
        {restaurantName}
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
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-stone-700">{t('dailyEvolution')}</h4>
          <div className="flex gap-1 rounded-xl bg-stone-100 p-0.5">
            <button
              type="button"
              onClick={() => setChartRange('7d')}
              className={
                chartRange === '7d'
                  ? 'rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-stone-900 shadow-sm'
                  : 'rounded-lg px-3 py-1.5 text-xs font-medium text-stone-500 transition-colors hover:text-stone-700'
              }
            >
              {t('days7')}
            </button>
            <button
              type="button"
              onClick={() => setChartRange('30d')}
              className={
                chartRange === '30d'
                  ? 'rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-stone-900 shadow-sm'
                  : 'rounded-lg px-3 py-1.5 text-xs font-medium text-stone-500 transition-colors hover:text-stone-700'
              }
            >
              {t('days30')}
            </button>
          </div>
        </div>
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={slicedChartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
              <Bar dataKey="impressions" name={t('chartImpressions')} fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="selections" name={t('chartSelections')} fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="calls" name={t('chartCalls')} fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
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

  const totalImpressions = restaurants?.reduce((sum, r) => sum + (r.stats?.impressions ?? 0), 0) ?? 0
  const totalSelections = restaurants?.reduce((sum, r) => sum + (r.stats?.selections ?? 0), 0) ?? 0
  const totalCalls = restaurants?.reduce((sum, r) => sum + (r.stats?.calls ?? 0), 0) ?? 0
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

  const metrics = [
    { label: t('totalRestaurants'), value: totalRestaurants, icon: Store },
    { label: t('totalImpressions'), value: totalImpressions, icon: Eye },
    { label: t('totalSelections'), value: totalSelections, icon: CheckCircle2 },
    { label: t('totalCalls'), value: totalCalls, icon: Phone },
  ]

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

      <h2 className="text-lg font-bold text-stone-900 sm:text-xl">{t('overallStats')}</h2>

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
