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
    title: 'Decides en 30 segundos',
    desc: 'Olvídate de perder horas decidiendo dónde comer. Elige tipo de cocina, precio y zona al instante.',
  },
  {
    icon: Target,
    title: 'Encuentras tu sitio perfecto',
    desc: 'Sin agobiarte con cien opciones. Te emparejamos con el restaurante ideal para ti.',
  },
  {
    icon: CheckCircle2,
    title: 'Sales a comer sin estrés',
    desc: 'Llama, consulta el menú o abre el mapa. Todo en un clic, sin complicaciones.',
  },
]

const foodPhotos = [
  '1565299624946-b28f40a0ae38',
  '1504674900247-0877df9cc836',
  '1546069901-b8e1f7c5d7a0',
  '1567620905732-2d1ec7ab7445',
  '1555939594-58d7cb561ad1',
  '1476224203421-9ac39bcb332e',
  '1414235077428-338989a2e8c0',
  '1517248135467-4c7edcad34c4',
  '1507048331197-7d4ac70811cf',
  '1466978913424-d6f5f97f1f2b',
  '1490645935968-1fb47d0b24c3',
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
      <div className="absolute inset-0 bg-black/15" />

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

  function handleStart() {
    setSessionId(getSessionId())
    setStep('questions')
  }

  return (
    <div className="min-h-dvh">
      {/* ===== HERO SECTION ===== */}
      <section className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-white">
        {/* Dynamic image carousel */}
        <Carousel images={foodPhotos} />

          <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-6 py-20 sm:px-8 sm:py-24 lg:gap-10 lg:py-28 xl:px-12">
            {/* Badge - outside card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-900"
            >
              <Sparkles className="h-4 w-4 text-stone-800" />
              Encuentra tu sitio ideal en Valencia
            </motion.div>

            {/* Content card - only title & subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex w-full flex-col items-center gap-4 rounded-3xl bg-white/60 px-8 py-10 text-center shadow-xl shadow-black/5 backdrop-blur-sm sm:gap-5 sm:px-12 sm:py-12 lg:gap-6 lg:px-16 lg:py-14"
            >
              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl font-extrabold tracking-tight text-stone-900 sm:text-6xl md:text-7xl lg:text-8xl"
              >
                DimeSitio
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="max-w-xl text-balance text-lg leading-relaxed text-stone-500 sm:text-xl md:text-2xl"
              >
                Cientos de restaurantes en Valencia. Una pregunta cada 10 segundos.
                Tu sitio perfecto en 30.
              </motion.p>
            </motion.div>

            {/* Big CTA button - outside card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStart}
                className="group inline-flex items-center gap-3 rounded-2xl bg-stone-800 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-black/20 transition-all hover:bg-stone-700 hover:shadow-2xl hover:shadow-black/30 sm:px-10 sm:py-5 sm:text-xl lg:px-12 lg:py-6 lg:text-2xl"
              >
                Encuentra dónde comer
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-600 text-white transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </motion.button>
              <p className="mt-4 text-sm text-stone-400 sm:text-base">
                Responde 3 preguntas. Te lleva menos de un minuto.
              </p>
              <p className="mt-4 text-sm text-stone-400 sm:text-base">
                Responde 3 preguntas. Te lleva menos de un minuto.
              </p>
            </motion.div>

            {/* Food-type tags - outside card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex w-full flex-wrap items-center justify-center gap-2 lg:gap-2.5"
            >
              {foodTypes.slice(0, 8).map((t) => (
                <span
                  key={t}
                  className="rounded-lg bg-stone-100/80 px-3 py-1.5 text-xs font-medium text-stone-700/80"
                >
                  {t}
                </span>
              ))}
              <span className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-400">
                +{foodTypes.length - 8} más
              </span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="text-xs text-stone-400"
            >
              Más de {foodTypes.length} tipos de cocina · {stats[0].value} restaurantes · {stats[2].value} zonas
            </motion.p>
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
              Variedad para todos los gustos
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              Más de {foodTypes.length} tipos de cocina
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
              Comer fuera no debería ser un quebradero de cabeza
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-stone-500 sm:text-lg">
            &ldquo;¿Dónde comemos hoy?&rdquo; — esa conversación de 45 minutos que acaba siempre en el mismo sitio.
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
              ¿Listo para dejar de preguntarte dónde comer?
            </h2>
            <p className="mt-3 text-stone-500 sm:text-lg">
              Te llevará menos de un minuto.
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
