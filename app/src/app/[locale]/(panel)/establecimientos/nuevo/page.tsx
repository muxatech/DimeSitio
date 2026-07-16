'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { createRestaurant, createCheckoutSession } from '@/lib/panel/api'
import RestaurantForm from '@/app/[locale]/(panel)/establecimientos/restaurant-form'
import type { RestaurantFormData } from '@/types'
import { CheckCircle, ExternalLink, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function NuevoEstablecimientoPage() {
  const router = useRouter()
  const t = useTranslations('Establishments')
  const tCommon = useTranslations('Common')
  const queryClient = useQueryClient()
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: createRestaurant,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-restaurants'] })
      setCreatedId(data.id)
    },
  })

  async function handleSubmit(data: RestaurantFormData) {
    await mutation.mutateAsync(data)
  }

  async function handlePay() {
    if (!createdId) return
    setPaying(true)
    try {
      const url = await createCheckoutSession(createdId)
      window.location.assign(url)
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : t('checkoutError'))
      setPaying(false)
    }
  }

  if (createdId) {
    return (
      <div className="flex items-center justify-center px-5 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex w-full max-w-sm flex-col items-center gap-6 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-900">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
              {t('created')}
            </h1>
            <p className="mt-2 text-sm text-stone-400 sm:text-base">
              {t('paymentPending')}
            </p>
          </div>
          {errorMessage && (
            <div className="w-full rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {errorMessage}
            </div>
          )}
          <div className="flex w-full flex-col gap-3">
            <button
              onClick={handlePay}
              disabled={paying}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-800 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700 disabled:opacity-50"
            >
              {paying ? (
                <span className="inline-flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-white" />
                  {t('redirecting')}
                </span>
              ) : (
                <>
                  {t('completeActivation')}
                  <ExternalLink className="h-5 w-5" />
                </>
              )}
            </button>
            <button
              onClick={() => router.push('/establecimientos')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-200 px-8 py-3 text-sm font-medium text-stone-600 transition-all hover:bg-stone-50"
            >
              {tCommon('notNow')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <RestaurantForm
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
    />
  )
}
