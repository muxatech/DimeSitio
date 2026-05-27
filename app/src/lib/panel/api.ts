import { supabase } from '@/lib/supabase'
import type { RestaurantWithRole, RestaurantStats, RestaurantFormData, Category } from '@/types'

async function getToken(): Promise<string> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('No hay sesión activa')
  return token
}

async function invoke<T>(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<T> {
  const token = await getToken()
  const { data, error } = await supabase.functions.invoke('restaurants', {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (error) throw new Error(error.message)
  return data as T
}

export async function getMyRestaurants(): Promise<RestaurantWithRole[]> {
  const res = await invoke<{ success: boolean; data: RestaurantWithRole[] }>('GET', '/restaurants/mine')
  return res.data ?? []
}

export async function createRestaurant(data: RestaurantFormData): Promise<RestaurantWithRole> {
  const res = await invoke<{ success: boolean; data: RestaurantWithRole }>('POST', '/restaurants', data)
  return res.data
}

export async function updateRestaurant(id: string, data: Partial<RestaurantFormData>): Promise<RestaurantWithRole> {
  const res = await invoke<{ success: boolean; data: RestaurantWithRole }>('PATCH', `/restaurants/${id}`, data)
  return res.data
}

export async function deleteRestaurant(id: string): Promise<void> {
  await invoke('DELETE', `/restaurants/${id}`)
}

export async function getRestaurantStats(id: string): Promise<RestaurantStats> {
  const res = await invoke<{ success: boolean; data: RestaurantStats }>('GET', `/restaurants/${id}/stats`)
  return res.data
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw new Error(error.message)
  return data ?? []
}
