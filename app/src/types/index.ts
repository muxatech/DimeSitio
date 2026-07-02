export interface Category {
  id: string
  name: string
  group_keys?: string[]
}

export interface Restaurant {
  id: string
  owner_id: string | null
  name: string
  description: string | null
  phone: string | null
  address: string | null
  city: string
  lat: number | null
  lng: number | null
  price_level: 1 | 2 | 3
  image_url: string | null
  menu_url: string | null
  reservations_url: string | null
  zone: string | null
  active: boolean
  is_demo?: boolean
  plan_type?: PlanType
  founder_rank?: number | null
  restaurant_categories?: { category_id: string }[]
}

export interface CategoryGroup {
  key: string
  label: string
  icon: string
  description: string
  categoryNames: string[]
}

export type PlanType = 'standard' | 'founder'
export type PaymentMethod = 'redirect' | 'email'

export type FlowStep = 'landing' | 'questions' | 'top5' | 'battle' | 'winner'

export interface RestaurantAdmin {
  id: string
  restaurant_id: string
  user_id: string
  role: 'owner' | 'manager'
}

export interface RestaurantWithRole extends Restaurant {
  role: 'owner' | 'manager'
  subscription_status: string | null
  stats: {
    impressions: number
    selections: number
    calls: number
  }
}

export interface RestaurantStats {
  impressions_7d: number
  impressions_30d: number
  selections_7d: number
  selections_30d: number
  calls_7d: number
  calls_30d: number
  conversion_rate: number
}

export interface RestaurantFormData {
  name: string
  description?: string
  phone?: string
  address?: string
  price_level: 1 | 2 | 3
  zone: string
  lat?: number | null
  lng?: number | null
  image_url?: string
  menu_url?: string
  reservations_url?: string
  active?: boolean
  is_demo?: boolean
  plan_type: PlanType
  payment_method: PaymentMethod
  category_ids: string[]
}

export interface StaffCreateData extends RestaurantFormData {
  owner_email: string
  plan_type: PlanType
  payment_method: PaymentMethod
}

export interface AnalyticsTotals {
  impressions_7d: number
  impressions_30d: number
  selections_7d: number
  selections_30d: number
  calls_7d: number
  calls_30d: number
  conversion_rate: number
  selection_rate: number
}

export interface AnalyticsDaily {
  date: string
  impressions: number
  selections: number
  calls: number
}

export interface AnalyticsData {
  restaurant_id: string
  totals: AnalyticsTotals
  daily: AnalyticsDaily[]
  recent_events: { type: 'impression'; created_at: string }[]
}
