'use client'

import { useState } from 'react'
import RestaurantForm from '@/app/(panel)/establecimientos/restaurant-form'
import { createForClient } from '@/lib/panel/api'
import type { RestaurantFormData, StaffCreateData } from '@/types'
import { ArrowLeft, ExternalLink, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function CrearParaClientePage() {
  const [result, setResult] = useState<{ restaurant_id: string; checkout_url: string | null; sent: boolean } | null>(null)
  const [ownerEmail, setOwnerEmail] = useState('')
  const [planType, setPlanType] = useState<string>('standard')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(data: RestaurantFormData) {
    setIsSubmitting(true)
    try {
      setOwnerEmail((data as StaffCreateData).owner_email ?? '')
      setPlanType(data.plan_type ?? 'standard')
      const res = await createForClient(data as StaffCreateData)
      setResult(res)
    } catch (e) {
      throw e
    } finally {
      setIsSubmitting(false)
    }
  }

  if (result) {
    const planLabel = planType === 'founder' ? 'Plan Founder — 39€ (pago único)' : 'Plan Normal — 29€/mes'
    const isEmail = result.sent
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-900">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
            {isEmail ? 'Email enviado' : 'Datos guardados'}
          </h1>
          <p className="mt-2 text-sm text-stone-400 sm:text-base">
            {isEmail
              ? `El propietario recibirá un enlace para completar el pago (${planLabel}).`
              : `Ahora el propietario debe pagar para activar el establecimiento (${planLabel}).`}
          </p>
        </div>
        {isEmail ? (
          <div className="rounded-2xl bg-stone-50 px-6 py-4 text-sm text-stone-600">
            Email enviado a <strong>{ownerEmail}</strong>
          </div>
        ) : (
          <>
            <a
              href={result.checkout_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-stone-800 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700"
            >
              Ir a pago
              <ExternalLink className="h-5 w-5" />
            </a>
            <p className="text-xs text-stone-300">
              Se abrirá la página de pago segura de Stripe
            </p>
          </>
        )}
        <Link
          href="/establecimientos"
          className="mt-4 text-sm font-medium text-stone-400 transition-colors hover:text-stone-600"
        >
          Volver a establecimientos
        </Link>
      </div>
    )
  }

  return (
    <>
      <Link
        href="/establecimientos"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-400 transition-colors hover:text-stone-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a establecimientos
      </Link>

      <RestaurantForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        staffMode
        hideBackButton
      />
    </>
  )
}
