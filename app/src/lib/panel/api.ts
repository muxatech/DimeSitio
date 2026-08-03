import { supabase } from '@/lib/supabase'
import { NO_SESSION_ERROR } from '@/lib/constants'
import type { RestaurantWithRole, RestaurantStats, RestaurantFormData, Category, StaffCreateData, AnalyticsData, PlanType } from '@/types'

async function getToken(): Promise<string> {
  const { data: { session }, error } = await supabase.auth.refreshSession()
  if (error || !session) throw new Error(NO_SESSION_ERROR)
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

  const is401 = error?.context?.status === 401
    || error?.message?.toLowerCase().includes('unauthorized')
    || `${error?.message ?? ''}`.includes('401')

  if (is401) {
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

// ─── Photos (R2) ─────────────────────────────────────────────

export interface UploadItem {
  key: string
  uploadUrl: string
  publicUrl: string
}

export interface DeleteItem {
  key: string
  deleteUrl: string
}

export async function getUploadUrls(files: { ext: string }[]): Promise<UploadItem[]> {
  const res = await invoke<{ success: boolean; data: { items: UploadItem[] } }>(
    'POST',
    '/presign-upload',
    { files },
    'photos'
  )
  return res.data.items
}

export async function getDeleteUrls(keys: string[]): Promise<DeleteItem[]> {
  const res = await invoke<{ success: boolean; data: { items: DeleteItem[] } }>(
    'POST',
    '/presign-delete',
    { keys },
    'photos'
  )
  return res.data.items
}

// ─── Analytics ───────────────────────────────────────────────

export async function getRestaurantAnalytics(id: string): Promise<AnalyticsData> {
  const res = await invoke<{ success: boolean; data: AnalyticsData }>('GET', `/${id}`, undefined, 'analytics')
  return res.data
}

// ─── Stripe ─────────────────────────────────────────────────

export async function createCheckoutSession(restaurantId: string, locale: string = 'es'): Promise<string> {
  const res = await invoke<{ success: boolean; data: { url: string } }>('POST', '/create-checkout', { restaurant_id: restaurantId, locale }, 'stripe')
  return res.data.url
}

export async function createPortalSession(restaurantId: string, locale: string = 'es'): Promise<string> {
  const res = await invoke<{ success: boolean; data: { url: string } }>('POST', '/create-portal', { restaurant_id: restaurantId, locale }, 'stripe')
  return res.data.url
}

export async function createPaymentLink(restaurantId: string, planType: PlanType, locale: string = 'es'): Promise<string> {
  const res = await invoke<{ success: boolean; data: { url: string } }>('POST', '/create-payment-link', { restaurant_id: restaurantId, plan_type: planType, locale }, 'stripe')
  return res.data.url
}

// ─── Staff ──────────────────────────────────────────────────

export async function createForClient(data: StaffCreateData, locale: string = 'es'): Promise<{ restaurant_id: string; checkout_url: string | null; sent: boolean }> {
  const res = await invoke<{ success: boolean; data: { restaurant_id: string; checkout_url: string | null; sent: boolean } }>('POST', '/', { ...data, locale }, 'staff')
  return res.data
}

export async function sendPaymentEmail(data: {
  restaurant_id: string
  owner_email: string
  payment_url: string
  plan_type: string
}, locale: string = 'es'): Promise<{ sent: boolean }> {
  const res = await invoke<{ success: boolean; data: { sent: boolean } }>('POST', '/', { ...data, locale, action: 'send-payment-email' }, 'staff')
  return res.data
}

export async function checkStaffStatus(): Promise<boolean> {
  const { data } = await supabase.from('staff_users').select('user_id').maybeSingle()
  return !!data
}

export interface StaffRestaurantList {
  items: RestaurantWithRole[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export async function getStaffRestaurants(search: string, page: number): Promise<StaffRestaurantList> {
  const qs = new URLSearchParams({ per_page: '25' })
  if (search.trim()) qs.set('search', search.trim())
  if (page > 1) qs.set('page', String(page))
  const res = await invoke<{ success: boolean; data: StaffRestaurantList }>(
    'GET',
    `/staff/restaurants?${qs.toString()}`,
    undefined,
    'restaurants'
  )
  return res.data
}

export async function getStaffRestaurant(id: string): Promise<RestaurantWithRole> {
  const res = await invoke<{ success: boolean; data: RestaurantWithRole }>(
    'GET',
    `/staff/restaurants/${id}`,
    undefined,
    'restaurants'
  )
  return res.data
}
