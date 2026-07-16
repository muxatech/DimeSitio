'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const locales = [
  { code: 'es', flag: '🇪🇸', label: 'ES' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
] as const

export default function LocaleSwitcher({ isDark, className }: { isDark?: boolean; className?: string }) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  function switchLocale(nextLocale: string) {
    if (nextLocale === locale) return
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <div className={cn('relative flex items-center gap-0.5 rounded-xl p-0.5', isDark ? 'border border-white/30 bg-white/10' : 'bg-stone-100', className)}>
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => switchLocale(l.code)}
          className={cn(
            'relative z-10 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-200',
            locale === l.code
              ? isDark ? 'text-white' : 'text-stone-900'
              : isDark
                ? 'text-white/40 hover:text-white/70'
                : 'text-stone-500 hover:text-stone-700'
          )}
        >
          {locale === l.code && (
            <motion.span
              layoutId="locale-pill"
              className={cn(
                'absolute inset-0 rounded-lg',
                isDark ? 'bg-white/30' : 'bg-white shadow-sm'
              )}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative z-10 text-sm">{l.flag}</span>
          <span className="relative z-10">{l.label}</span>
        </button>
      ))}
    </div>
  )
}
