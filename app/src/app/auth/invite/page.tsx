'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthInvitePage() {
  const router = useRouter()
  const [status, setStatus] = useState<'processing' | 'error'>('processing')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const hash = window.location.hash
    if (!hash || !hash.includes('access_token')) {
      setStatus('error')
      setErrorMessage('Enlace inválido.')
      return
    }

    let cancelled = false

    ;(async () => {
      const { supabase } = await import('@/lib/supabase')
      if (cancelled) return

      const params = new URLSearchParams(hash.replace('#', '?'))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const type = params.get('type')

      if (!accessToken) {
        setStatus('error')
        setErrorMessage('Enlace inválido.')
        return
      }

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken ?? '',
      })

      if (cancelled) return

      if (error) {
        setStatus('error')
        if (
          error.message.toLowerCase().includes('expired') ||
          error.message.toLowerCase().includes('invalid')
        ) {
          setErrorMessage('Este enlace ya fue usado o ha expirado. Solicita un nuevo enlace de invitación.')
        } else {
          setErrorMessage(error.message)
        }
        return
      }

      window.history.replaceState(null, '', '/auth/invite')
      if (type === 'invite') {
        router.replace('/set-password')
      } else {
        router.replace('/dashboard')
      }
    })()

    return () => { cancelled = true }
  }, [router])

  if (status === 'processing') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-stone-500">Procesando...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-xl font-bold text-stone-900">Enlace inválido</h1>
        <p className="mt-3 text-sm text-stone-500">{errorMessage}</p>
        <a
          href="/"
          className="mt-6 inline-block rounded-2xl bg-stone-800 px-6 py-3 text-sm font-semibold text-white"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  )
}
