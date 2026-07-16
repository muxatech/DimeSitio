'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

function PagoExitosoContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? undefined
  const t = useTranslations('PagoExitoso')

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-900">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
            {t('title')}
          </h1>
          <p className="mt-3 text-sm text-stone-400 sm:text-base">
            {t('emailSent', { email: email ?? t('fallbackEmail') })}
          </p>
          <p className="mt-2 text-sm text-stone-400 sm:text-base">
            {t('emailSentDesc')}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-2xl bg-stone-800 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700"
        >
          {t('goToPanel')}
        </Link>
        <p className="text-xs text-stone-300">
          {t('spamHint')}
        </p>
      </motion.div>
    </div>
  )
}

export default function PagoExitosoPage() {
  const t = useTranslations('PagoExitoso')
  return (
    <Suspense fallback={
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-6 text-center">
        <p className="text-stone-500">{t('loading')}</p>
      </div>
    }>
      <PagoExitosoContent />
    </Suspense>
  )
}
