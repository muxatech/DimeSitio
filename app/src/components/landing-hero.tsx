'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFlowStore } from '@/store/flow-store'
import { getSessionId } from '@/lib/utils'
import {
  Clock,
  Target,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Star,
} from 'lucide-react'

const stats = [
  { value: '18+', label: 'Restaurantes' },
  { value: '15', label: 'Tipos de cocina' },
  { value: '5', label: 'Zonas' },
  { value: '0€', label: 'Siempre gratis' },
]

const problems = [
  {
    icon: Clock,
    title: 'Decides en minutos',
    desc: 'Olvídate de comparar decenas de restaurantes. Elige tipo de comida, presupuesto y zona, y nosotros hacemos el resto.',
  },
  {
    icon: Target,
    title: 'Menos opciones, mejores decisiones',
    desc: 'No necesitas ver cien sitios para encontrar uno bueno. Te enseñamos solo las opciones que realmente encajan contigo.',
  },
  {
    icon: CheckCircle2,
    title: 'Todo listo para salir',
    desc: 'Consulta el menú, abre la ruta o llama directamente al restaurante. Sin vueltas. Sin estrés.',
  },
]

const foodPhotos = [
  '1565299624946-b28f40a0ae38',
  '1504674900247-0877df9cc836',
  '1540189549336-e6e99c3679fe',
  '1567620905732-2d1ec7ab7445',
  '1555939594-58d7cb561ad1',
  '1432139555190-58524dae6a55',
  '1414235077428-338989a2e8c0',
  '1517248135467-4c7edcad34c4',
  '1507048331197-7d4ac70811cf',
  '1476124369491-e7addf5db371',
  '1481070555726-e2fe8357725c',
  '1552566626-52f8b828add9',
]

const foodTypes = [
  'Italiano', 'Japonés', 'Mexicano', 'Mediterráneo', 'Asiático',
  'Español', 'Argentino', 'Indio', 'Turco', 'Marroquí',
  'Peruano', 'Tailandés', 'Griego', 'Francés', 'Americano',
]

function Carousel({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((prev) => (prev + 1) % images.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [images.length])

  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      <AnimatePresence initial={false} custom={idx}>
        <motion.img
          key={idx}
          src={`https://images.unsplash.com/photo-${images[idx]}?w=1600&h=1000&fit=crop&auto=format`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </AnimatePresence>

      {/* Overlay for contrast */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Dots indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === idx ? 'w-6 bg-stone-600' : 'w-1.5 bg-stone-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function LandingHero() {
  const { setStep, setSessionId } = useFlowStore()

  const [wordIdx, setWordIdx] = useState(0)
  const words = ['comer', 'cenar', 'tapear', 'picar']

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIdx((prev) => (prev + 1) % words.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [words.length])

  function handleStart() {
    setSessionId(getSessionId())
    setStep('questions')
  }

  return (
    <div className="min-h-dvh">
      {/* ===== HERO SECTION ===== */}
      <section className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-stone-900">
        {/* Dynamic image carousel */}
        <Carousel images={foodPhotos} />

          <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-6 py-20 sm:px-8 sm:py-24 lg:gap-10 lg:py-28 xl:px-12">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/25 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4 text-white/80" />
              Encuentra restaurante en Valencia en menos de un minuto
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
            >
              DimeSitio
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="max-w-xl text-balance text-center text-lg leading-relaxed text-white/85 sm:text-xl md:text-2xl"
              style={{ textShadow: '0 1px 12px rgba(0,0,0,0.25)' }}
            >
              Deja de perder 40 minutos eligiendo restaurante.
            </motion.p>

            {/* Big CTA button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStart}
                className="group inline-flex items-center gap-3 rounded-2xl border border-white/40 bg-white/20 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-white/30 sm:px-10 sm:py-5 sm:text-xl lg:px-12 lg:py-6 lg:text-2xl"
              >
                <span className="inline-flex items-center gap-1">
                  Encuentra dónde{' '}
                  <span className="relative inline-flex items-center overflow-hidden" style={{ height: '1.25em' }}>
                    <span className="invisible">{words.reduce((a, b) => a.length >= b.length ? a : b)}</span>
                    <span className="absolute inset-0 inline-flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={words[wordIdx]}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {words[wordIdx]}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </span>
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/25 text-white transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </motion.button>
              <p className="mt-4 text-center text-sm text-white/70 sm:text-base">
                Rápido, gratis y sin registrarte.
              </p>
            </motion.div>

            {/* Food-type tags */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex w-full flex-wrap items-center justify-center gap-2 lg:gap-2.5"
            >
              {foodTypes.slice(0, 8).map((t) => (
                <span
                  key={t}
                  className="rounded-lg bg-white/25 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm"
                >
                  {t}
                </span>
              ))}
              <span className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white/50 backdrop-blur-sm">
                +{foodTypes.length - 8} más
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="flex items-center justify-center gap-5 sm:gap-8"
            >
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold text-white/80">{foodTypes.length} tipos de cocina</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold text-white/80">{stats[0].value} restaurantes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold text-white/80">{stats[2].value} zonas de Valencia</span>
              </div>
            </motion.div>
          </div>
      </section>

      {/* ===== PHOTO GALLERY ===== */}
      <section className="overflow-hidden bg-white px-6 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="mb-10 text-center sm:mb-14"
          >
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-1.5 text-sm font-medium text-stone-900">
              <Sparkles className="h-4 w-4" />
              Opciones para todos los gustos
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              Más de {foodTypes.length} tipos de cocina para elegir
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {foodPhotos.map((id, i) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: (i % 8) * 0.06 }}
                className={i >= 8 ? 'hidden sm:block' : ''}
              >
                <div className="group relative h-48 overflow-hidden rounded-2xl bg-stone-100 shadow-sm transition-shadow hover:shadow-lg sm:h-56 lg:h-64">
                  <div className="absolute inset-0 flex items-center justify-center text-stone-200">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                    </svg>
                  </div>
                  <img
                    src={`https://images.unsplash.com/photo-${id}?w=600&h=500&fit=crop&auto=format`}
                    alt=""
                    className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROBLEMS WE SOLVE ===== */}
      <section className="relative bg-white px-6 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="mb-14 text-center sm:mb-20"
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-1.5 text-sm font-medium text-stone-700">
              <Sparkles className="h-4 w-4" />
              El problema que resolvemos
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              Elegir restaurante no debería llevar más tiempo que la comida
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-stone-500 sm:text-lg">
            &ldquo;¿Dónde comemos hoy?&rdquo; — la pregunta que acaba en 40 minutos mirando Google Maps para terminar yendo al mismo sitio de siempre.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-3 sm:gap-8 lg:gap-12">
            {problems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group relative"
              >
                <div className="relative flex flex-col items-center gap-5 rounded-3xl border border-stone-100 bg-white p-8 text-center shadow-sm transition-all hover:shadow-lg sm:p-10">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br bg-stone-900 shadow-lg sm:h-20 sm:w-20">
                    <item.icon className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 sm:text-2xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-500 sm:text-base">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS BANNER ===== */}
      <section className="border-y border-stone-100 bg-stone-50">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-8 px-6 py-12 sm:gap-12 sm:py-16 lg:gap-16 lg:px-12">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-3xl font-extrabold text-stone-900 sm:text-4xl lg:text-5xl">
                {stat.value}
              </span>
              <span className="text-xs font-medium text-stone-400 sm:text-sm">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="relative bg-white px-6 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center sm:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              Tu próximo restaurante está a menos de un minuto
            </h2>
            <p className="mt-3 text-stone-500 sm:text-lg">
              Responde 3 preguntas y decide sin complicarte.
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.15 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStart}
            className="inline-flex items-center gap-3 rounded-2xl bg-stone-800 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-stone-200/50 transition-all hover:bg-stone-700 sm:px-10 sm:py-4 sm:text-xl"
          >
            Empezar ahora
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </div>
      </section>
    </div>
  )
}
