'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function PagoExitosoPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? 'tu email'

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-900">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
            Pago completado
          </h1>
          <p className="mt-3 text-sm text-stone-400 sm:text-base">
            Te hemos enviado un email a <strong className="text-stone-600">{email}</strong> para acceder a tu panel.
          </p>
          <p className="mt-2 text-sm text-stone-400 sm:text-base">
            Revisa tu bandeja de entrada y crea una contraseña para gestionar tu restaurante.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-2xl bg-stone-800 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700"
        >
          Ir a la página principal
        </Link>
        <p className="text-xs text-stone-300">
          ¿No recibiste el email? Revisa la carpeta de spam.
        </p>
      </motion.div>
    </div>
  )
}
