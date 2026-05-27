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
