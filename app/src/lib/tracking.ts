import { supabase } from './supabase'

export async function trackStart(session_id: string): Promise<void> {
  const { error } = await supabase.functions.invoke('events', {
    body: { type: 'start', session_id },
  })
  if (error) console.error('[tracking] trackStart error:', error.message)
}

export async function trackImpression(
  restaurant_id: string,
  session_id: string
): Promise<void> {
  const { error } = await supabase.functions.invoke('events', {
    body: { type: 'impression', restaurant_id, session_id },
  })
  if (error) console.error('[tracking] trackImpression error:', error.message)
}

export async function trackSelection(
  restaurant_id: string,
  session_id: string,
  round: number
): Promise<void> {
  const { error } = await supabase.functions.invoke('events', {
    body: { type: 'selection', restaurant_id, session_id, round },
  })
  if (error) console.error('[tracking] trackSelection error:', error.message)
}

export async function trackCall(
  restaurant_id: string,
  session_id: string
): Promise<void> {
  const { error } = await supabase.functions.invoke('events', {
    body: { type: 'call', restaurant_id, session_id },
  })
  if (error) console.error('[tracking] trackCall error:', error.message)
}
