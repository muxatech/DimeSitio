'use client'

import { motion } from 'framer-motion'
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

const foodTypes = [
  'Italiano', 'Japonés', 'Mexicano', 'Mediterráneo', 'Asiático',
  'Español', 'Argentino', 'Indio', 'Turco', 'Marroquí',
  'Peruano', 'Tailandés', 'Griego', 'Francés', 'Americano',
]

export default function LandingHero() {
  const { setStep, setSessionId } = useFlowStore()

  function handleStart() {
    setSessionId(getSessionId())
    setStep('questions')
  }

  return (
    <div className="min-h-dvh">
      {/* ===== HERO SECTION ===== */}
      <section className="relative flex min-h-dvh items-center overflow-hidden bg-white">
        {/* Warm ambient glow */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-orange-100/60 to-amber-100/30 blur-3xl lg:h-[500px] lg:w-[500px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-gradient-to-tr from-stone-100/60 to-orange-50/30 blur-3xl lg:h-[400px] lg:w-[400px]" />

        {/* Decorative food-grid backdrop — suggests abundance */}
        <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-2/5 overflow-hidden lg:block">
          <div className="absolute inset-0 grid grid-cols-2 gap-4 p-12 opacity-[0.06]">
            {[
              'from-orange-200 to-amber-100',
              'from-amber-100 to-yellow-100',
              'from-stone-200 to-orange-100',
              'from-rose-200 to-orange-100',
              'from-orange-100 to-amber-200',
              'from-stone-100 to-amber-100',
              'from-amber-100 to-rose-100',
              'from-orange-50 to-stone-200',
            ].map((g, i) => (
              <div key={i} className={`rounded-2xl bg-gradient-to-br ${g}`} />
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white via-white/80 to-transparent" />
        </div>

        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #18181b 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-6 pb-20 pt-24 text-center sm:px-8 sm:pb-24 sm:pt-28 lg:items-start lg:text-left xl:px-12 xl:pb-28 xl:pt-32">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700"
          >
            <Sparkles className="h-4 w-4" />
            Encuentra tu sitio ideal en Valencia
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl font-extrabold tracking-tight text-stone-900 sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
          >
            DimeSitio
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-4 max-w-lg text-balance text-lg leading-relaxed text-stone-500 sm:text-xl md:text-2xl lg:mx-0"
          >
            Cientos de restaurantes en Valencia. Una pregunta cada 10 segundos.
            Tu sitio perfecto en 30.
          </motion.p>

          {/* Big CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 sm:mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              className="group inline-flex items-center gap-3 rounded-2xl bg-stone-800 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-stone-800/20 transition-all hover:bg-stone-700 sm:px-10 sm:py-5 sm:text-xl lg:px-12 lg:py-6 lg:text-2xl"
            >
              Encuentra dónde comer
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-600 text-white transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-5 w-5" />
              </span>
            </motion.button>
            <p className="mt-4 text-sm text-stone-400 sm:text-base">
              Responde 3 preguntas. Te lleva menos de un minuto.
            </p>
          </motion.div>

          {/* Food-type tags — show variety / abundance */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 flex w-full flex-wrap items-center justify-center gap-2 lg:justify-start lg:gap-2.5"
          >
            {foodTypes.slice(0, 8).map((t) => (
              <span
                key={t}
                className="rounded-lg bg-orange-50/80 px-3 py-1.5 text-xs font-medium text-orange-700/80"
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
            className="mt-3 text-xs text-stone-400"
          >
            Más de {foodTypes.length} tipos de cocina · {stats[0].value} restaurantes · {stats[2].value} zonas
          </motion.p>
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
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-800 shadow-lg sm:h-20 sm:w-20">
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
