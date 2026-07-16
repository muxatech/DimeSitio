import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { getLocale } from "next-intl/server"
import "./globals.css"

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()

  return (
    <html
      lang={locale}
      className={`${jakartaSans.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-white font-sans text-stone-900">
        {children}
      </body>
    </html>
  )
}
