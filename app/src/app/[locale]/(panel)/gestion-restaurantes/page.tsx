'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStaffRestaurants, deleteRestaurant, checkStaffStatus } from '@/lib/panel/api'
import { NO_SESSION_ERROR } from '@/lib/constants'
import { motion } from 'framer-motion'
import { useRouter } from '@/i18n/navigation'
import { Search, ChevronLeft, ChevronRight, Store } from 'lucide-react'
import RestaurantPanelCard from '@/components/restaurant-panel-card'
import { useTranslations } from 'next-intl'

const PER_PAGE = 25

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

export default function StaffRestaurantsPage() {
  const t = useTranslations('StaffRestaurants')
  const tCommon = useTranslations('Common')
  const router = useRouter()
  const queryClient = useQueryClient()

  const [isStaff, setIsStaff] = useState<boolean | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    checkStaffStatus().then((staff) => {
      if (!staff) {
        router.replace('/dashboard')
        return
      }
      setIsStaff(true)
    })
  }, [router])

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(id)
  }, [search])

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['staff-restaurants', debouncedSearch, page],
    queryFn: () => getStaffRestaurants(debouncedSearch, page),
    enabled: isStaff === true,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRestaurant,
    onSuccess: () => {
      if (data && page > 1) {
        const after = Math.max(Math.ceil((data.total - 1) / PER_PAGE), 1)
        if (page > after) setPage(after)
      }
      queryClient.invalidateQueries({ queryKey: ['staff-restaurants'] })
    },
  })

  function handleDelete(id: string, name: string) {
    if (confirm(t('confirmDelete', { name }))) {
      deleteMutation.mutate(id)
    }
  }

  if (isStaff === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-900" />
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
          <p className="text-base font-semibold text-stone-700 sm:text-lg">{t('errorTitle')}</p>
          <p className="max-w-xs text-sm text-stone-400">{t('errorDesc')}</p>
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

  const items = data?.items ?? []
  const totalPages = data?.total_pages ?? 1

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 sm:gap-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
            {t('title')}
          </h1>
          {!isLoading && data && (
            <p className="mt-1 text-sm text-stone-400">
              {t('count', { count: data.total })}
            </p>
          )}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-11 pr-4 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:py-3.5 sm:text-base"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-900" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100">
            <Store className="h-7 w-7 text-stone-300" />
          </div>
          <div>
            <p className="text-base font-semibold text-stone-700">{t('empty')}</p>
            {debouncedSearch && (
              <p className="mt-1 text-sm text-stone-400">{t('emptyDesc')}</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((r) => (
              <RestaurantPanelCard
                key={r.id}
                restaurant={r}
                showStats
                showActions
                onDelete={handleDelete}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-2 flex items-center justify-between gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                {t('prev')}
              </button>
              <p className="text-sm text-stone-400">{t('pageInfo', { page, totalPages })}</p>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('next')}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
