import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import Providers from '@/components/providers'
import LayoutShell from '@/components/layout-shell'

export function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'en' }]
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const messages = await getMessages()
  const meta = (messages as Record<string, Record<string, string>>).Common

  const title = meta?.metaTitle || 'DimeSitio'
  const description = meta?.metaDescription || ''
  const ogDescription = meta?.metaOgDescription || description
  const ogLocale = locale === 'es' ? 'es_ES' : 'en_GB'

  return {
    metadataBase: new URL('https://dimesitio.es'),
    title: {
      default: title,
      template: '%s | DimeSitio',
    },
    description,
    openGraph: {
      siteName: 'DimeSitio',
      title,
      description: ogDescription,
      url: 'https://dimesitio.es',
      locale: ogLocale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>
        <LayoutShell>{children}</LayoutShell>
      </Providers>
    </NextIntlClientProvider>
  )
}
