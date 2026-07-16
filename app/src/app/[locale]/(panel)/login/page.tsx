'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import DsMonogram from '@/components/ds-monogram'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations('Login')
  const tAuth = useTranslations('Auth')
  const tCommon = useTranslations('Common')
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loginSchema = z.object({
    email: z.string().email(tAuth('invalidEmail')),
    password: z.string().min(6, tAuth('minPassword')),
  })

  type LoginForm = z.infer<typeof loginSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginForm) {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    setLoading(false)
    if (error) {
      if (error.message === 'Invalid login credentials') {
        setError(t('invalidCredentials'))
      } else {
        setError(error.message)
      }
      return
    }
    router.push('/dashboard')
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
            {tCommon('appName')}
          </Link>
        </div>

        <h1 className="mb-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
          {t('title')}
        </h1>
        <p className="mb-8 text-sm text-stone-400 sm:text-base">
          {t('subtitle')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
              {tAuth('email')}
            </label>
            <input
              id="email"
              type="email"
              placeholder={tCommon('emailPlaceholder')}
              {...register('email')}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
              {tAuth('password')}
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="text-right">
            <Link href="/forgot-password" className="text-sm text-stone-400 underline transition-colors hover:text-stone-600">
              {t('forgotPassword')}
            </Link>
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
                {t('signingIn')}
              </span>
            ) : (
              t('signInBtn')
            )}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-400">
          {t('noAccount')}{' '}
          <Link href="/register" className="font-medium text-stone-700 underline transition-colors hover:text-stone-900">
            {t('register')}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
