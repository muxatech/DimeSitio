import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function NotFound() {
  const t = await getTranslations('NotFound')
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
        <span className="text-2xl font-bold text-stone-400">404</span>
      </div>
      <div className="max-w-sm">
        <h2 className="text-xl font-bold text-stone-900">{t('title')}</h2>
        <p className="mt-2 text-sm text-stone-500">
          {t('description')}
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('backHome')}
      </Link>
    </div>
  )
}
