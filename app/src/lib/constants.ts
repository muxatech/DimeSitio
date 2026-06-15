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
  { key: 'zone', label: '¿Por qué zona?', subtitle: 'Zona de Valencia' },
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

export const PROBLEMS = [
  {
    title: 'Decides en minutos',
    desc: 'Olvídate de comparar decenas de restaurantes. Elige tipo de comida, presupuesto y zona, y nosotros hacemos el resto.',
  },
  {
    title: 'Menos opciones, mejores decisiones',
    desc: 'No necesitas ver cien sitios para encontrar uno bueno. Te enseñamos solo las opciones que realmente encajan contigo.',
  },
  {
    title: 'Todo listo para salir',
    desc: 'Consulta el menú, abre la ruta o llama directamente al restaurante. Sin vueltas. Sin estrés.',
  },
]

export const HERO_STATS = [
  { value: '18+', label: 'Establecimientos' },
  { value: '15', label: 'Tipos de cocina' },
  { value: '22', label: 'Zonas' },
  { value: '0€', label: 'Siempre gratis' },
]
