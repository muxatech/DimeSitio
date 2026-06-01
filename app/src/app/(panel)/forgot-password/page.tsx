'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import DsMonogram from '@/components/ds-monogram'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Introduce un email válido'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/login`,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white px-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="w-full max-w-sm text-center"
        >
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-stone-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-800 text-lg font-bold text-white">
                D
              </span>
              DimeSitio
            </Link>
          </div>
          <h1 className="mb-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            Revisa tu email
          </h1>
          <p className="mb-8 text-sm text-stone-400 sm:text-base">
            Te hemos enviado un enlace para restablecer tu contraseña.
          </p>
          <Link
            href="/login"
            className="rounded-2xl bg-stone-800 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700"
          >
            Volver a iniciar sesión
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white px-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-stone-900">
            <DsMonogram className="h-9 w-9 rounded-xl" />
            DimeSitio
          </Link>
        </div>

        <h1 className="mb-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
          Restablecer contraseña
        </h1>
        <p className="mb-8 text-sm text-stone-400 sm:text-base">
          Te enviaremos un enlace para crear una nueva contraseña.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...register('email')}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            type="submit"
            disabled={loading}
            className={
              loading
                ? 'w-full rounded-2xl bg-stone-200 py-4 text-base font-semibold text-stone-400 sm:py-4 sm:text-lg'
                : 'w-full rounded-2xl bg-stone-800 py-4 text-base font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700 sm:py-4 sm:text-lg lg:py-5 lg:text-xl'
            }
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-white" />
                Enviando...
              </span>
            ) : (
              'Enviar enlace'
            )}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-400">
          <Link href="/login" className="font-medium text-stone-700 underline transition-colors hover:text-stone-900">
            Volver a iniciar sesión
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
