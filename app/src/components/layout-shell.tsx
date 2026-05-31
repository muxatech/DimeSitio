'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPanel = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/dashboard') || pathname.startsWith('/establecimientos') || pathname.startsWith('/suscripcion')

  if (isPanel) return <>{children}</>

  return (
    <>
      <Navbar />
      <main className="grow flex flex-col">{children}</main>
      <Footer />
    </>
  )
}
