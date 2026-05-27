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

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem('dimesitio_session')
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem('dimesitio_session', id)
  }
  return id
}

export function getPriceLabel(level: 1 | 2 | 3): string {
  return '€'.repeat(level)
}
