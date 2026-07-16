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

const LOCALE_RE = /^\/(es|en)(\/|$)/

export function stripLocalePrefix(pathname: string): string {
  return pathname.replace(LOCALE_RE, '/$2')
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

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

import { PRICE_LABELS } from './constants'

export function getPriceLabel(level: 1 | 2 | 3): string {
  return PRICE_LABELS[level] ?? '€'.repeat(level)
}

export function normalizeInstagramUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed

  if (trimmed.includes('instagram.com')) {
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`
    }
    return trimmed
  }

  if (/^https?:\/\//i.test(trimmed)) return trimmed

  const handle = trimmed.replace(/^@/, '')
  return `https://instagram.com/${handle}`
}
