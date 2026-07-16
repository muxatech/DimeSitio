import type { Category } from '@/types'

export const NO_SESSION_ERROR = 'NO_SESSION'

export interface CategoryGroupDisplay {
  key: string
  label: string
  icon: string
  description: string
  availableCats: Category[]
}

export function groupCategories(categories: Category[]): CategoryGroupDisplay[] {
  const catsByName = new Map(categories.map((c) => [c.name, c]))

  return CATEGORY_GROUPS.map((group) => {
    const byName = group.categoryNames
      .map((name) => catsByName.get(name))
      .filter((c): c is Category => !!c)
    const byGroupKey = categories.filter((c) => c.group_keys?.includes(group.key))
    const seen = new Set<string>()
    const availableCats = [...byName, ...byGroupKey].filter((c) => {
      if (seen.has(c.id)) return false
      seen.add(c.id)
      return true
    })
    return { ...group, availableCats }
  })
}

export const CATEGORY_GROUPS = [
  {
    key: 'cafe-brunch',
    label: 'Café & Brunch',
    icon: 'Coffee',
    description: 'Para empezar el día o una pausa',
    categoryNames: ['Brunch', 'Cafetería moderna', 'Cafetería tradicional', 'Specialty coffee', 'Tetería', 'Zumería', 'Pastelería'],
  },
  {
    key: 'comer-cenar',
    label: 'Comer / Cenar',
    icon: 'UtensilsCrossed',
    description: 'Restaurantes para sentarse a comer',
    categoryNames: ['Italiano', 'Japonés', 'Arroces', 'Mediterráneo', 'Mexicano', 'Argentino', 'Pizza', 'Sushi', 'Marisco', 'Fusión', 'Vegetariano', 'Internacional', 'Hamburguesas', 'Tapas'],
  },
  {
    key: 'tomar-algo',
    label: 'Tomar algo',
    icon: 'Wine',
    description: 'Para salir de tapas, copas o cervezas',
    categoryNames: ['Tapas', 'Cervecería', 'Cocktails', 'Vino'],
  },
]

export const PRICE_LABELS: Record<number, string> = {
  1: '€',
  2: '€€',
  3: '€€€',
}

export const ZONES = [
  'El Centro', 'El Carmen', 'Ruzafa', 'Ensanche', 'Extramurs',
  'Campanar', 'Benimaclet', 'Algiros', 'Ciutat Vella', 'Quatre Carreres',
  'Jesús', 'Marítim', 'Poblats Marítims', 'Camins al Grau',
  "L'Olivereta", 'Patraix', 'La Saïdia', 'Plà del Real',
  'Benicalap', 'Pobles del Nord', "Pobles de l'Oest", 'Pobles del Sud',
]

export const QUESTIONS = [
  { key: 'categories', label: '¿Qué te apetece?', subtitle: 'Tipo de cocina' },
  { key: 'price', label: '¿Cuánto quieres gastar?', subtitle: 'Presupuesto' },
  { key: 'location', label: '¿Dónde quieres comer?', subtitle: 'Ubicación' },
] as const

export const FOOD_PHOTOS = [
  '1565299624946-b28f40a0ae38',
  '1442512595331-e89e73853f31',
  '1540189549336-e6e99c3679fe',
  '1567620905732-2d1ec7ab7445',
  '1555939594-58d7cb561ad1',
  '1432139555190-58524dae6a55',
  '1550304943-4f24f54ddde9',
  '1517248135467-4c7edcad34c4',
  '1507048331197-7d4ac70811cf',
  '1754842382582-b643e9af5a27',
  '1481070555726-e2fe8357725c',
  '1461023058943-07fcbe16d735',
]

export const FOOD_TYPES = [
  'Italiano', 'Brunch', 'Café de especialidad', 'Mediterráneo', 'Asiático',
  'Español', 'Argentino', 'Indio', 'Turco', 'Marroquí',
  'Peruano', 'Tailandés', 'Griego', 'Francés', 'Americano',
]


