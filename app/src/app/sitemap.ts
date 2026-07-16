import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
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

  return entries
}
