'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users,
  Target,
  Sparkles,
  ArrowRight,
  BarChart3,
  Crown,
  UtensilsCrossed,
  MapPin,
} from 'lucide-react'

const problems = [
  {
    icon: Target,
    title: 'Clientes que ya quieren lo que ofreces',
    desc: 'Los usuarios eligen por tipo de cocina, precio y zona. Cuando alguien selecciona tu categoría, ya está predispuesto a lo que ofreces. No es tráfico frío, son comensales que han elegido.',
  },
  {
    icon: BarChart3,
    title: 'Alto rendimiento',
    desc: 'La inversión vuelve rápido con los primeros clientes que te traemos. Sin anuncios ni pujas: cada recomendación es un comensal nuevo que llega a tu puerta.',
  },
  {
    icon: Users,
    title: 'Llegan listos para decidir',
    desc: 'Cuando un usuario llega a tu ficha ya ha decidido qué tipo de comida le apetece. No es un curioso: es alguien que va a salir a cenar y busca dónde.',
  },
]

const howItWorks = [
  {
    title: 'Crea tu perfil',
    desc: 'Regístrate y añade tu restaurante en menos de 5 minutos. Tipo de cocina, precios, zona, fotos y enlace al menú.',
  },
  {
    title: 'Te recomendamos',
    desc: 'Cuando alguien busque justo lo que ofreces, nuestro algoritmo le mostrará tu restaurante entre las mejores opciones.',
  },
  {
    title: 'Recibe clientes',
    desc: 'Ellos ven tu ficha, consultan el menú, abren la ruta o llaman. Tú solo tienes que estar ahí con la información actualizada.',
  },
]

const stats = [
  { value: 'Target', label: 'Clientes que ya buscan lo que ofreces' },
  { value: 'A medida', label: 'Recomendaciones a quien ya te busca' },
  { value: 'En 3 clics', label: 'De la búsqueda a tu puerta' },
]

function ViewportWrapper({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}

export default function RestaurantesPage() {
  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-b from-stone-800 to-stone-900">
        {/* Subtle pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, white 1px, transparent 0)`,
            backgroundSize: '50px 50px',
          }}
        />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-20 sm:px-8 sm:py-24 lg:gap-10 lg:py-28 xl:px-12">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/25 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-white/80" />
            Para restaurantes de Valencia
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl text-balance text-center text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
          >
          Hemos hecho que elegir restaurante sea fácil.<br />
          <span className="text-white/90">Ahora haz que te elijan a ti.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="max-w-2xl text-balance text-center text-lg leading-relaxed text-white/80 sm:text-xl"
            style={{ textShadow: '0 1px 12px rgba(0,0,0,0.25)' }}
          >
            Cada día hay gente indecisa buscando dónde comer en Valencia.
            Con DimeSitio, tu restaurante aparece justo cuando te buscan.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center gap-3 rounded-2xl border border-white/40 bg-white/20 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-white/30 sm:px-10 sm:py-5 sm:text-xl"
              >
                Publica tu restaurante
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/25 text-white transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </motion.button>
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-white/60 transition-colors hover:text-white/90"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {['Sin comisiones', 'Sin contratos', 'Date de baja cuando quieras'].map(
              (text) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-white/60"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                  {text}
                </span>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* ===== PROBLEM SECTION ===== */}
      <section className="relative bg-white px-6 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-5xl">
          <ViewportWrapper>
            <div className="mb-14 text-center sm:mb-20">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-1.5 text-sm font-medium text-stone-700">
                <Sparkles className="h-4 w-4" />
                Por qué aparecer en DimeSitio
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
                El problema no es la competencia.<br />Es que no te encuentran.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-stone-500 sm:text-lg">
                Tus clientes potenciales están ahí, mirando Google Maps y sin decidirse.
                Nosotros les llevamos a tu puerta.
              </p>
            </div>
          </ViewportWrapper>

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
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-900 shadow-lg sm:h-20 sm:w-20">
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

      {/* ===== HOW IT WORKS ===== */}
      <section className="bg-stone-50 px-6 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-5xl">
          <ViewportWrapper>
            <div className="mb-14 text-center sm:mb-20">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-stone-700 shadow-sm">
                <Sparkles className="h-4 w-4" />
                Cómo funciona
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
                De registrarte a recibir clientes en 3 pasos
              </h2>
            </div>
          </ViewportWrapper>

          <div className="grid gap-6 sm:grid-cols-3 sm:gap-8 lg:gap-12">
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative flex flex-col items-center gap-5 text-center"
              >
                {/* Step number */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white shadow-sm">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-900 sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-500 sm:text-base">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOUNDER SECTION ===== */}
      <section className="bg-white px-6 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-5xl">
          <ViewportWrapper>
            <div className="mb-14 text-center sm:mb-20">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-800">
                <Crown className="h-4 w-4" />
                Exclusivo para los primeros
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
                Sé uno de los 100 restaurantes fundadores
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-stone-500 sm:text-lg">
                Los 100 primeros restaurantes en unirse a DimeSitio reciben la insignia <strong className="text-stone-900">Fundador</strong>.
                Una corona dorada visible para todos los usuarios que los distingue como pioneros.
              </p>
            </div>
          </ViewportWrapper>

          <div className="mx-auto grid max-w-lg gap-6 sm:grid-cols-2 sm:gap-8 lg:max-w-2xl lg:gap-12">
            {/* Normal card mock */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
            >
              <div className="flex h-28 items-center justify-center bg-stone-100 sm:h-32">
                <UtensilsCrossed className="h-7 w-7 text-stone-300" />
              </div>
              <div className="space-y-1 p-3 sm:p-4">
                <p className="truncate text-sm font-bold text-stone-400">Tu restaurante</p>
                <p className="flex items-center gap-1 text-xs text-stone-300">
                  <MapPin className="h-3 w-3 shrink-0" />
                  Valencia · €€
                </p>
              </div>
              <div className="border-t border-stone-100 px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-300">
                  Normal
                </span>
              </div>
            </motion.div>

            {/* Founder card mock */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm ring-1 ring-amber-100"
            >
              <div className="relative flex h-28 items-center justify-center bg-stone-100 sm:h-32">
                <UtensilsCrossed className="h-7 w-7 text-stone-300" />
                <div className="absolute right-2 top-2">
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 shadow-sm">
                    <Crown className="h-2.5 w-2.5" />
                    Fundador
                  </span>
                </div>
              </div>
              <div className="space-y-1 p-3 sm:p-4">
                <p className="truncate text-sm font-bold text-stone-900">Tu restaurante</p>
                <p className="flex items-center gap-1 text-xs text-stone-400">
                  <MapPin className="h-3 w-3 shrink-0" />
                  Valencia · €€
                </p>
              </div>
              <div className="border-t border-stone-100 px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                  <Crown className="h-3 w-3" />
                  Fundador
                </span>
              </div>
            </motion.div>
          </div>

          <ViewportWrapper>
            <div className="mx-auto mt-10 max-w-2xl text-center sm:mt-14">
              <p className="text-sm leading-relaxed text-stone-500 sm:text-base">
                Además del reconocimiento, los restaurantes fundadores aparecen siempre antes en los resultados.
                Una ventaja que solo tienen los 100 primeros.
              </p>
            </div>
          </ViewportWrapper>
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
          <ViewportWrapper>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              Que no te cuenten lo que buscan.<br />Sé tú la respuesta.
            </h2>
            <p className="mt-3 text-stone-500 sm:text-lg">
              Registra tu restaurante y empieza a aparecer ante los indecisos de Valencia.
            </p>
          </ViewportWrapper>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 rounded-2xl bg-stone-800 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-stone-200/50 transition-all hover:bg-stone-700 sm:px-10 sm:py-4 sm:text-xl"
              >
                Publica tu restaurante
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
