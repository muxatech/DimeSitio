import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ArrowLeft } from 'lucide-react'

export default async function NotFound() {
  const t = await getTranslations('Ficha')
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
        <span className="text-2xl font-bold text-stone-400">404</span>
      </div>
      <div className="max-w-sm">
        <h2 className="text-xl font-bold text-stone-900">{t('notFoundTitle')}</h2>
        <p className="mt-2 text-sm text-stone-500">{t('notFoundDesc')}</p>
      </div>
      <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50">
        <ArrowLeft className="h-4 w-4" />
        {t('backHome')}
      </Link>
    </div>
  )
}
