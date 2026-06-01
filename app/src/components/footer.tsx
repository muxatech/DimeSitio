import Link from 'next/link'
import DsMonogram from '@/components/ds-monogram'

const quickLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Para restaurantes', href: '/restaurantes' },
]

const legalLinks = [
  { label: 'Términos y Condiciones', href: '/terminos' },
  { label: 'Política de Privacidad', href: '/privacidad' },
  { label: 'Aviso Legal', href: '/aviso-legal' },
]

export default function Footer() {
  return (
    <footer className="border-t border-stone-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 sm:px-8 sm:py-16 lg:flex-row lg:items-start lg:justify-between lg:px-12">
        {/* Brand */}
        <div className="flex max-w-xs flex-col gap-3">
          <div className="flex items-center gap-2 text-lg font-bold text-stone-900">
            <DsMonogram className="h-8 w-8 shadow-sm" />
            DimeSitio
          </div>
          <p className="text-sm leading-relaxed text-stone-500">
            Dinos qué te apetece y encuentra restaurante en Valencia sin perder tiempo decidiendo.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            Enlaces
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

        {/* Legal */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            Legal
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
          <span>&copy; {new Date().getFullYear()} DimeSitio. Todos los derechos reservados.</span>
          <span>Hecho en Valencia ❤️</span>
        </div>
      </div>
    </footer>
  )
}
