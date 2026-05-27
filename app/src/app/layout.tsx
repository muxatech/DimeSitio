import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-white font-sans text-zinc-900">
        <main className="mx-auto max-w-lg px-5 py-6">{children}</main>
      </body>
    </html>
  )
}
