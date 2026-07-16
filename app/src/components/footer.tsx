'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import DsMonogram from '@/components/ds-monogram'

export default function Footer() {
  const t = useTranslations('Common')

  const quickLinks = [
    { label: t('home'), href: '/' },
    { label: t('forRestaurants'), href: '/restaurantes' },
  ]

  const contactLinks = [
    { label: 'info@dimesitio.es', href: 'mailto:info@dimesitio.es' },
  ]

  const legalLinks = [
    { label: t('terms'), href: '/terminos' },
    { label: t('privacy'), href: '/privacidad' },
    { label: t('legalNotice'), href: '/aviso-legal' },
  ]

  return (
    <footer className="border-t border-stone-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 sm:px-8 sm:py-16 lg:flex-row lg:items-start lg:justify-between lg:px-12">
        {/* Brand */}
        <div className="flex max-w-xs flex-col gap-3">
          <div className="flex items-center gap-2 text-lg font-bold text-stone-900">
            <DsMonogram className="h-8 w-8 shadow-sm" />
            {t('appName')}
          </div>
          <p className="text-sm leading-relaxed text-stone-500">
            {t('tagline')}
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            {t('links')}
          </span>
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-stone-600 transition-colors hover:text-stone-900"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            {t('contact')}
          </span>
          {contactLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-stone-600 transition-colors hover:text-stone-900"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            {t('legal')}
          </span>
          {legalLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-stone-600 transition-colors hover:text-stone-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-100 px-6 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center text-xs text-stone-400 sm:flex-row sm:text-left">
          <span>&copy; {new Date().getFullYear()} DimeSitio. {t('allRightsReserved')}</span>
          <span>{t('madeInValencia')}</span>
        </div>
      </div>
    </footer>
  )
}
