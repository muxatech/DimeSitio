import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Legal.Privacy' })
  return {
    title: t('title'),
    description: t('title'),
  }
}

export default async function PrivacidadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Legal.Privacy' })
  const sections = t.raw('sections') as Array<{ title: string; content: string }>

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-20 lg:py-24">
      <div className="mb-10 sm:mb-14">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-1.5 text-sm font-medium text-stone-700">
          {t('badge')}
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-3 text-sm text-stone-400 sm:text-base">
          {t('lastUpdated')}
        </p>
      </div>

      <div className="flex flex-col gap-8 text-sm leading-relaxed text-stone-600 sm:text-base sm:leading-relaxed">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="mb-3 text-lg font-bold text-stone-900 sm:text-xl">
              {s.title}
            </h2>
            {s.content.split('\n\n').map((p, i) => (
              <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
