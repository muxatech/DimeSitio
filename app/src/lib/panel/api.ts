import { supabase } from '@/lib/supabase'
import type { RestaurantWithRole, RestaurantStats, RestaurantFormData, Category, StaffCreateData, AnalyticsData } from '@/types'

async function getToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('No hay sesión activa')
  return session.access_token
}

async function invoke<T>(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown, functionName?: string): Promise<T> {
  const call = async (token: string) => {
    const fn = functionName ?? 'restaurants'
    return supabase.functions.invoke(`${fn}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  let token = await getToken()
  let { data, error } = await call(token)

  if (error?.message === 'Unauthorized' || `${error?.message ?? ''}`.includes('401')) {
    const { data: refreshed } = await supabase.auth.refreshSession()
    if (refreshed?.session) {
      token = refreshed.session.access_token
      ;({ data, error } = await call(token))
    }
  }

  if (error) {
    let detail = error.message
    if (error.context && typeof error.context.text === 'function') {
      try { detail = await error.context.text() } catch {}
    }
    throw new Error(detail)
  }
  return data as T
}

export async function getMyRestaurants(): Promise<RestaurantWithRole[]> {
  const res = await invoke<{ success: boolean; data: RestaurantWithRole[] }>('GET', '/mine')
  return res.data ?? []
}

export async function createRestaurant(data: RestaurantFormData): Promise<RestaurantWithRole> {
  const res = await invoke<{ success: boolean; data: RestaurantWithRole }>('POST', '/', data)
  return res.data
}

export async function updateRestaurant(id: string, data: Partial<RestaurantFormData>): Promise<RestaurantWithRole> {
  const res = await invoke<{ success: boolean; data: RestaurantWithRole }>('PATCH', `/${id}`, data)
  return res.data
}

export async function deleteRestaurant(id: string): Promise<void> {
  await invoke('DELETE', `/${id}`)
}

export async function getRestaurantStats(id: string): Promise<RestaurantStats> {
  const res = await invoke<{ success: boolean; data: RestaurantStats }>('GET', `/${id}/stats`)
  return res.data
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Analytics ───────────────────────────────────────────────

export async function getRestaurantAnalytics(id: string): Promise<AnalyticsData> {
  const res = await invoke<{ success: boolean; data: AnalyticsData }>('GET', `/${id}`, undefined, 'analytics')
  return res.data
}

// ─── Stripe ─────────────────────────────────────────────────

export async function createCheckoutSession(restaurantId: string): Promise<string> {
  const res = await invoke<{ success: boolean; data: { url: string } }>('POST', '/create-checkout', { restaurant_id: restaurantId }, 'stripe')
  return res.data.url
}

export async function createPortalSession(restaurantId: string): Promise<string> {
  const res = await invoke<{ success: boolean; data: { url: string } }>('POST', '/create-portal', { restaurant_id: restaurantId }, 'stripe')
  return res.data.url
}

// ─── Staff ──────────────────────────────────────────────────

export async function createForClient(data: StaffCreateData): Promise<{ restaurant_id: string; checkout_url: string }> {
  const res = await invoke<{ success: boolean; data: { restaurant_id: string; checkout_url: string } }>('POST', '/', data, 'staff')
  return res.data
}

export async function checkStaffStatus(): Promise<boolean> {
  const { data } = await supabase.from('staff_users').select('user_id').maybeSingle()
  return !!data
}
