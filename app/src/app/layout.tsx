import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import Providers from "@/components/providers"
import LayoutShell from "@/components/layout-shell"

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://dimesitio.es'),
  title: {
    default: 'DimeSitio — Encuentra dónde comer en Valencia',
    template: '%s | DimeSitio',
  },
  description: 'Responde 3 preguntas y descubre el restaurante perfecto para hoy en Valencia. Rápido, gratis y sin registrarte.',
  openGraph: {
    siteName: 'DimeSitio',
    title: 'DimeSitio — Encuentra dónde comer',
    description: 'Responde unas preguntas y descubre el restaurante perfecto para hoy.',
    url: 'https://dimesitio.es',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DimeSitio — Encuentra dónde comer',
    description: 'Responde 3 preguntas y descubre el restaurante perfecto para hoy en Valencia.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${jakartaSans.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-white font-sans text-stone-900">
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  )
}
