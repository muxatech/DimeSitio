'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import RestaurantForm from '@/app/[locale]/(panel)/establecimientos/restaurant-form'
import { createForClient, sendPaymentEmail } from '@/lib/panel/api'
import type { RestaurantFormData, StaffCreateData } from '@/types'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'

export default function CrearParaClientePage() {
  const t = useTranslations('CreateForClient')
  const tCommon = useTranslations('Common')
  const locale = useLocale()
  const [result, setResult] = useState<{ restaurant_id: string; checkout_url: string | null; sent: boolean } | null>(null)
  const [ownerEmail, setOwnerEmail] = useState('')
  const [planType, setPlanType] = useState<string>('standard')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)

  useEffect(() => {
    if (result?.checkout_url && !result.sent) {
      QRCode.toDataURL(result.checkout_url, { width: 280, margin: 2 }).then(setQrCodeUrl)
    }
  }, [result])

  async function handleSubmit(data: RestaurantFormData) {
    setIsSubmitting(true)
    try {
      setOwnerEmail((data as StaffCreateData).owner_email ?? '')
      setPlanType(data.plan_type ?? 'standard')
      const res = await createForClient(data as StaffCreateData, locale)
      setResult(res)
    } catch (e) {
      throw e
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResendEmail() {
    if (!result?.checkout_url) return
    setSendingEmail(true)
    try {
      await sendPaymentEmail({
        restaurant_id: result.restaurant_id,
        owner_email: ownerEmail,
        payment_url: result.checkout_url,
        plan_type: planType,
      }, locale)
      setEmailSent(true)
    } catch {
      // silent
    } finally {
      setSendingEmail(false)
    }
  }

  if (result) {
    const planLabel = planType === 'founder' ? t('founderPlanLabel') : t('standardPlanLabel')
    const isEmail = result.sent
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-900">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
            {isEmail ? t('emailSent') : t('readyToPay')}
          </h1>
          <p className="mt-2 text-sm text-stone-400 sm:text-base">
            {isEmail
              ? `${t('ownerWillReceive')} (${planLabel}).`
              : `${t('scanQr')} (${planLabel}).`}
          </p>
        </div>
        {isEmail ? (
          <div className="rounded-2xl bg-stone-50 px-6 py-4 text-sm text-stone-600">
            {t('emailSentTo')} <strong>{ownerEmail}</strong>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            {qrCodeUrl && (
              <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-stone-100">
                <img src={qrCodeUrl} alt={t('qrAlt')} width={280} height={280} />
              </div>
            )}
            {!emailSent ? (
              <button
                onClick={handleResendEmail}
                disabled={sendingEmail}
                className="text-xs text-stone-300 transition-colors hover:text-stone-400"
              >
                {sendingEmail ? tCommon('sending') : t('sendLinkByEmail')}
              </button>
            ) : (
              <div className="rounded-2xl bg-stone-50 px-6 py-4 text-sm text-stone-600">
                {t('emailSentTo')} <strong>{ownerEmail}</strong>
              </div>
            )}
          </div>
        )}
        <Link
          href="/establecimientos"
          className="mt-4 text-sm font-medium text-stone-400 transition-colors hover:text-stone-600"
        >
          {tCommon('backToEstablishments')}
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
        {tCommon('backToEstablishments')}
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
