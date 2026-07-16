'use client'

import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('Common')

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
        <span className="text-2xl">!</span>
      </div>
      <div className="max-w-sm">
        <h2 className="text-xl font-bold text-stone-900">{t('error')}</h2>
        <p className="mt-2 text-sm text-stone-500">
          {t('errorDescription')}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => { window.location.href = '/' }}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToHome')}
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-stone-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-700"
        >
          {t('tryAgain')}
        </button>
      </div>
    </div>
  )
}
