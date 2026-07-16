import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/es/login', '/en/login', '/es/register', '/en/register', '/es/dashboard', '/en/dashboard'],
      },
    ],
    sitemap: 'https://dimesitio.es/sitemap.xml',
  }
}
