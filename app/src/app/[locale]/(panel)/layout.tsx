'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from '@/i18n/navigation'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import DsMonogram from '@/components/ds-monogram'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Store, LogOut, Menu, X, CreditCard, Tags, UtensilsCrossed } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useFlowStore } from '@/store/flow-store'
import { checkStaffStatus } from '@/lib/panel/api'
import { useTranslations } from 'next-intl'

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<boolean | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [isStaff, setIsStaff] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const t = useTranslations('Panel')
  const tCommon = useTranslations('Common')

  const navLinks = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/establecimientos', label: t('establishments'), icon: Store },
    { href: '/suscripcion', label: t('subscription'), icon: CreditCard },
  ]

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        if (pathname !== '/login' && pathname !== '/register' && pathname !== '/forgot-password' && !pathname.startsWith('/set-password')) {
          router.replace('/login')
        }
        setSession(false)
      } else {
        setSession(true)
        setUserEmail(data.session.user.email ?? '')
        checkStaffStatus().then(setIsStaff)
        if (pathname === '/login' || pathname === '/register') {
          router.replace('/dashboard')
        }
      }
    })
  }, [router, pathname])

  function handleHome() {
    useFlowStore.getState().reset()
    sessionStorage.removeItem('dimesitio-flow')
    router.push('/')
  }

  async function handleLogout() {
    useFlowStore.getState().reset()
    sessionStorage.removeItem('dimesitio-flow')
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (session === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-900" />
      </div>
    )
  }

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname.startsWith('/set-password')

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-dvh bg-stone-50">
      {/* Mobile header */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-stone-200 bg-white px-5 lg:hidden">
        <button onClick={handleHome} className="flex items-center gap-2 text-lg font-bold tracking-tight text-stone-900">
          <DsMonogram className="h-8 w-8" />
          {tCommon('appName')}
        </button>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center justify-center rounded-xl p-2 transition-colors hover:bg-stone-100"
          aria-label={tCommon('menu')}
        >
          {sidebarOpen ? <X className="h-6 w-6 text-stone-700" /> : <Menu className="h-6 w-6 text-stone-700" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/45 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-stone-900 text-white transition-transform duration-[250ms] lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-stone-700 px-6">
          <button onClick={handleHome} className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
            <DsMonogram className="h-8 w-8 bg-stone-700" />
            {tCommon('appName')}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all',
                  active
                    ? 'bg-stone-700 text-white'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            )
          })}
          {isStaff && (
            <>
              <Link
                href="/gestion-restaurantes"
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all',
                  pathname.startsWith('/gestion-restaurantes')
                    ? 'bg-stone-700 text-white'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                )}
              >
                <UtensilsCrossed className="h-5 w-5" />
                {t('restaurants')}
              </Link>
              <Link
                href="/categorias"
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all',
                  pathname.startsWith('/categorias')
                    ? 'bg-stone-700 text-white'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                )}
              >
                <Tags className="h-5 w-5" />
                {t('categories')}
              </Link>
            </>
          )}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-stone-700 px-3 py-4">
          <div className="mb-2 truncate px-4 text-sm text-stone-400">{userEmail}</div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-stone-400 transition-all hover:bg-stone-800 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 pt-16 lg:pt-0">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          {children}
        </div>
      </div>
    </div>
  )
}
