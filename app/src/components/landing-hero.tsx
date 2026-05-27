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
        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #18181b 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-6 pb-20 pt-24 text-center sm:px-8 sm:pb-24 sm:pt-28 lg:px-12 lg:pb-28 lg:pt-32">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700"
          >
            <Sparkles className="h-4 w-4" />
            Encuentra tu sitio ideal en Valencia
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
          >
            DimeSitio
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-4 max-w-lg text-balance text-lg leading-relaxed text-zinc-500 sm:text-xl md:text-2xl"
          >
            Dile lo que te apetece y te recomendamos el mejor sitio para comer.
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
              className="group inline-flex items-center gap-3 rounded-2xl bg-zinc-900 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-zinc-900/20 transition-all hover:bg-zinc-800 sm:px-10 sm:py-5 sm:text-xl lg:px-12 lg:py-6 lg:text-2xl"
            >
              Encuentra dónde comer
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-700 text-white transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-5 w-5" />
              </span>
            </motion.button>
            <p className="mt-4 text-sm text-zinc-400 sm:text-base">
              Responde 3 preguntas. Te lleva menos de un minuto.
            </p>
          </motion.div>

          {/* Mini stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-400 sm:gap-8 md:gap-10"
          >
            <span>18+ restaurantes</span>
            <span>15 tipos de cocina</span>
            <span>5 zonas</span>
          </motion.div>
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
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-medium text-zinc-700">
              <Sparkles className="h-4 w-4" />
              El problema que resolvemos
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
              Comer fuera no debería ser un quebradero de cabeza
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-zinc-500 sm:text-lg">
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
                <div className="relative flex flex-col items-center gap-5 rounded-3xl border border-zinc-100 bg-white p-8 text-center shadow-sm transition-all hover:shadow-lg sm:p-10">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 shadow-lg sm:h-20 sm:w-20">
                    <item.icon className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 sm:text-2xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-500 sm:text-base">
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
      <section className="border-y border-zinc-100 bg-zinc-50">
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
              <span className="text-3xl font-extrabold text-zinc-900 sm:text-4xl lg:text-5xl">
                {stat.value}
              </span>
              <span className="text-xs font-medium text-zinc-400 sm:text-sm">
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
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
              ¿Listo para dejar de preguntarte dónde comer?
            </h2>
            <p className="mt-3 text-zinc-500 sm:text-lg">
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
            className="inline-flex items-center gap-3 rounded-2xl bg-zinc-900 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-zinc-200/50 transition-all hover:bg-zinc-800 sm:px-10 sm:py-4 sm:text-xl"
          >
            Empezar ahora
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </div>
      </section>
    </div>
  )
}
