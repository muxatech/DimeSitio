'use client'

import { useParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyRestaurants, updateRestaurant } from '@/lib/panel/api'
import { NO_SESSION_ERROR } from '@/lib/constants'
import RestaurantForm from '@/app/[locale]/(panel)/establecimientos/restaurant-form'
import type { RestaurantFormData } from '@/types'
import { Frown } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function EditarEstablecimientoPage() {
  const t = useTranslations('Establishments')
  const tCommon = useTranslations('Common')
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string

  const { data: restaurants, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['my-restaurants'],
    queryFn: getMyRestaurants,
  })

  const restaurant = restaurants?.find((r) => r.id === id)

  const mutation = useMutation({
    mutationFn: (data: RestaurantFormData) => updateRestaurant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-restaurants'] })
      router.push('/establecimientos')
    },
  })

  async function handleSubmit(data: RestaurantFormData) {
    await mutation.mutateAsync(data)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-900" />
      </div>
    )
  }

  if (isError || !restaurant) {
    if (error instanceof Error && error.message === NO_SESSION_ERROR) {
      router.replace('/login')
      return null
    }
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <Frown className="h-7 w-7 text-red-400" />
          </div>
          <p className="text-base font-semibold text-stone-700 sm:text-lg">
            {t('notFound')}
          </p>
          <p className="max-w-xs text-sm text-stone-400">
            {t('notFoundDesc')}
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
    <RestaurantForm
      defaultValues={restaurant}
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
    />
  )
}
