import { supabase } from '@/lib/supabase'
import { getSessionId } from '@/lib/utils'

function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('dimesitio_visitor')
  if (!id) {
    id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
    localStorage.setItem('dimesitio_visitor', id)
  }
  return id
}

export function trackPageView(path: string, locale?: string) {
  try {
    const session_id = getSessionId()
    const visitor_id = getVisitorId()
    if (!session_id || !visitor_id) return
    supabase.from('page_views').insert({ session_id, visitor_id, path, locale: locale ?? null }).then(() => {}, () => {})
  } catch {}
}

export function trackFlowStart() {
  try {
    const session_id = getSessionId()
    if (!session_id) return
    supabase.from('flow_starts').insert({ session_id }).then(() => {}, () => {})
  } catch {}
}

export function trackQuestionView(question_key: 'categories' | 'price' | 'location', qIndex: number) {
  try {
    const session_id = getSessionId()
    if (!session_id) return
    supabase.from('question_views').insert({ session_id, question_key, q_index: qIndex }).then(() => {}, () => {})
  } catch {}
}

export function trackImpressions(restaurantIds: string[]) {
  try {
    const session_id = getSessionId()
    if (!session_id || !restaurantIds.length) return
    const rows = restaurantIds.map((restaurant_id) => ({ restaurant_id, session_id }))
    supabase.from('impressions').insert(rows).then(() => {}, () => {})
  } catch {}
}

export function trackSelection(restaurant_id: string, round: number) {
  try {
    const session_id = getSessionId()
    if (!session_id) return
    supabase.from('selections').insert({ restaurant_id, session_id, round }).then(() => {}, () => {})
  } catch {}
}

export function trackCall(restaurant_id: string) {
  try {
    const session_id = getSessionId()
    if (!session_id) return
    supabase.from('calls').insert({ restaurant_id, session_id }).then(() => {}, () => {})
    supabase.from('cta_clicks').insert({ restaurant_id, session_id, cta_type: 'call', path: location.pathname }).then(() => {}, () => {})
  } catch {}
}

export function trackCta(restaurant_id: string, cta_type: 'maps' | 'menu' | 'reservations' | 'instagram' | 'winner') {
  try {
    const session_id = getSessionId()
    if (!session_id) return
    supabase.from('cta_clicks').insert({ restaurant_id, session_id, cta_type, path: location.pathname }).then(() => {}, () => {})
  } catch {}
}
