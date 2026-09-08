import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://dimesitio.es'
  const locales = ['es', 'en']

  const publicPages = [
    { path: '', priority: 1, changeFrequency: 'weekly' as const },
    { path: '/restaurantes', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/terminos', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/privacidad', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/aviso-legal', priority: 0.3, changeFrequency: 'yearly' as const },
  ]

  const entries: MetadataRoute.Sitemap = []

  for (const page of publicPages) {
    for (const locale of locales) {
      entries.push({
        url: `${base}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      })
    }
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (url && key) {
      const res = await fetch(`${url}/rest/v1/restaurants?select=id,created_at&active=eq.true&is_demo=eq.false`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 3600 },
      })
      if (res.ok) {
        const rows = (await res.json()) as { id: string; created_at: string }[]
        for (const row of rows) {
          for (const locale of locales) {
            entries.push({
              url: `${base}/${locale}/sitio/${row.id}`,
              lastModified: new Date(row.created_at),
              changeFrequency: 'weekly',
              priority: 0.7,
            })
          }
        }
      }
    }
  } catch {}

  return entries
}
