import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider, useTranslations } from 'next-intl'
import es from '../../../messages/es.json'
import en from '../../../messages/en.json'

function TestComponent({ namespace = 'Common' }: { namespace?: string }) {
  const t = useTranslations(namespace)
  return <span data-testid="text">{t('loading')}</span>
}

describe('TestWrapper pattern', () => {
  it('renders Spanish translations', () => {
    render(
      <NextIntlClientProvider locale="es" messages={es}>
        <TestComponent />
      </NextIntlClientProvider>
    )
    expect(screen.getByTestId('text').textContent).toBe('Cargando…')
  })

  it('renders English translations', () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <TestComponent />
      </NextIntlClientProvider>
    )
    expect(screen.getByTestId('text').textContent).toBe('Loading...')
  })

  it('returns the key path when translation is missing', () => {
    render(
      <NextIntlClientProvider locale="es" messages={es}>
        <TestComponent namespace="NonExistent" />
      </NextIntlClientProvider>
    )
    const text = screen.getByTestId('text').textContent
    expect(text).toContain('loading')
  })
})
