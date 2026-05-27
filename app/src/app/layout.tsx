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
  title: "DimeSitio — Encuentra dónde comer",
  description: "Responde unas preguntas y descubre el restaurante perfecto para hoy.",
  openGraph: {
    title: "DimeSitio",
    description: "Encuentra dónde comer en Valencia",
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
