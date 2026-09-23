'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useFlowStore } from '@/store/flow-store'
import { getSessionId } from '@/lib/utils'
import { trackFlowStart, trackPageView } from '@/lib/tracking'

export default function LandingHero() {
  const t = useTranslations('Landing')
  const { startNewFlow, setSessionId } = useFlowStore()

  useEffect(() => {
    trackPageView('/', window.location.pathname.startsWith('/en') ? 'en' : 'es')
  }, [])

  function handlePrimary() {
    startNewFlow()
    const sid = getSessionId()
    setSessionId(sid)
    trackFlowStart()
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleSecondary() {
    document.getElementById('repertorio')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-dvh bg-white">
      <section className="relative flex min-h-[86dvh] items-center justify-center overflow-hidden bg-stone-900 px-6 py-20 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        <div className="absolute inset-0 bg-stone-900" />
        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-center sm:gap-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-balance text-4xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {t('heroTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl text-pretty text-lg leading-relaxed text-white/80 sm:text-xl"
          >
            {t('heroSubtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4"
          >
            <button
              onClick={handlePrimary}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-8 py-4 text-base font-bold text-stone-900 shadow-xl transition hover:bg-stone-100 sm:w-auto sm:text-lg"
            >
              {t('ctaPrimary')}
            </button>
            <button
              onClick={handleSecondary}
              className="inline-flex w-full items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20 sm:w-auto sm:text-lg"
            >
              {t('ctaSecondary')}
            </button>
          </motion.div>
        </div>
      </section>
      <section id="repertorio" className="scroll-mt-16" />
      <section id="contacto" className="scroll-mt-16" />
    </div>
  )
}
