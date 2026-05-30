export interface Category {
  id: string
  name: string
  icon: string | null
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
  zone: string | null
  active: boolean
  restaurant_categories?: { category_id: string }[]
}

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
  image_url?: string
  menu_url?: string
  active?: boolean
  category_ids: string[]
}

export interface StaffCreateData extends RestaurantFormData {
  owner_email: string
}
