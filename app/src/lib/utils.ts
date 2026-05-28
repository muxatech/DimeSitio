export function shuffle<T>(array: T[]): T[] {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

function fallbackUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem('dimesitio_session')
  if (!id) {
    id = crypto.randomUUID?.() ?? fallbackUUID()
    sessionStorage.setItem('dimesitio_session', id)
  }
  return id
}

import { PRICE_LABELS } from './constants'

export function getPriceLabel(level: 1 | 2 | 3): string {
  return PRICE_LABELS[level] ?? '€'.repeat(level)
}
