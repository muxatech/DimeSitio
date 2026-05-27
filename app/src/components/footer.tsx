import Link from 'next/link'

const quickLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Explorar', href: '/explorar' },
  { label: 'Para restaurantes', href: '/restaurantes' },
]

export default function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 sm:px-8 sm:py-16 lg:flex-row lg:items-start lg:justify-between lg:px-12">
        {/* Brand */}
        <div className="flex max-w-xs flex-col gap-3">
          <div className="flex items-center gap-2 text-lg font-bold text-zinc-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white shadow-sm">
              D
            </span>
            DimeSitio
          </div>
          <p className="text-sm leading-relaxed text-zinc-500">
            Dile lo que te apetece y te recomendamos el mejor sitio para comer en Valencia.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Enlaces
          </span>
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-100 px-6 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center text-xs text-zinc-400 sm:flex-row sm:text-left">
          <span>&copy; {new Date().getFullYear()} DimeSitio. Todos los derechos reservados.</span>
          <span>Hecho con ❤️ en Valencia</span>
        </div>
      </div>
    </footer>
  )
}
