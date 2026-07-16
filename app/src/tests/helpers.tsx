import { type ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import es from '../../messages/es.json'
import en from '../../messages/en.json'

const messages = { es, en }

export function TestWrapper({
  children,
  locale = 'es',
}: {
  children: ReactNode
  locale?: 'es' | 'en'
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      {children}
    </NextIntlClientProvider>
  )
}
