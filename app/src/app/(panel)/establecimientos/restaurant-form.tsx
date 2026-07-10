'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ArrowLeft, ExternalLink, MapPin, UtensilsCrossed, Plus, X, ChevronDown, Coffee, Wine } from 'lucide-react'
import Link from 'next/link'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getCategories } from '@/lib/panel/api'
import { supabase } from '@/lib/supabase'
import { ZONES, groupCategories, CATEGORY_GROUPS } from '@/lib/constants'
import { cn, getPriceLabel, normalizeInstagramUrl } from '@/lib/utils'
import type { RestaurantFormData, RestaurantWithRole } from '@/types'

const restaurantSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  price_level: z.number().min(1).max(3),
  zone: z.string().min(1, 'La zona es obligatoria'),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  image_url: z.string().optional(),
  menu_url: z.string().optional(),
  reservations_url: z.string().optional(),
  instagram_url: z.string().optional(),
  active: z.boolean().optional(),
  is_demo: z.boolean().optional(),
  category_ids: z.array(z.string()),
  owner_email: z.string().email('El email del propietario no es válido').optional().or(z.literal('')),
  plan_type: z.enum(['standard', 'founder']),
  payment_method: z.enum(['redirect', 'email']),
})

type FormValues = z.infer<typeof restaurantSchema>

const priceOptions = [
  { value: 1, label: 'Barato' },
  { value: 2, label: 'Normal' },
  { value: 3, label: 'Caro' },
]

const phoneCountries = [
  { value: '+34', label: '+34' },
  { value: '+33', label: '+33' },
  { value: '+44', label: '+44' },
  { value: '+1', label: '+1' },
  { value: '+49', label: '+49' },
  { value: '+39', label: '+39' },
  { value: '+351', label: '+351' },
  { value: '+52', label: '+52' },
  { value: '+54', label: '+54' },
  { value: '+57', label: '+57' },
  { value: '+56', label: '+56' },
  { value: '+598', label: '+598' },
]

function parsePhone(phone: string | null | undefined): { prefix: string; number: string } {
  if (!phone) return { prefix: '+34', number: '' }
  const space = phone.indexOf(' ')
  if (space === -1) return { prefix: '+34', number: phone }
  return { prefix: phone.slice(0, space), number: phone.slice(space + 1) }
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  const parts: string[] = []
  if (digits.length > 0) parts.push(digits.slice(0, 3))
  if (digits.length > 3) parts.push(digits.slice(3, 6))
  if (digits.length > 6) parts.push(digits.slice(6, 9))
  return parts.join(' ')
}

function LivePreviewCard({ name, imageUrl, zone, priceLevel, description }: {
  name?: string
  imageUrl?: string
  zone?: string
  priceLevel?: 1 | 2 | 3
  description?: string
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="relative h-32 w-full overflow-hidden bg-stone-100 sm:h-36">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name || 'Preview'}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.classList.add('hidden')
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <div className={imageUrl ? 'hidden' : 'flex h-full w-full items-center justify-center'}>
          <UtensilsCrossed className="h-7 w-7 text-stone-300" />
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <p className="truncate font-bold text-stone-900 sm:text-lg">
          {name || 'Nombre del restaurante'}
        </p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-stone-400">
          {zone && (
            <>
              <MapPin className="h-3 w-3 shrink-0" />
              {zone}
              <span className="mx-1">·</span>
            </>
          )}
          {getPriceLabel(priceLevel ?? 1)}
        </p>
        {description && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-stone-500 sm:text-sm">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

interface RestaurantFormProps {
  defaultValues?: RestaurantWithRole | null
  onSubmit: (data: RestaurantFormData) => Promise<void>
  isSubmitting: boolean
  staffMode?: boolean
  hideBackButton?: boolean
}

export default function RestaurantForm({ defaultValues, onSubmit, isSubmitting, staffMode, hideBackButton }: RestaurantFormProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryGroupKeys, setNewCategoryGroupKeys] = useState<string[]>([])
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['comer-cenar'])
  const isEditing = !!defaultValues

  const parsedPhone = parsePhone(defaultValues?.phone)
  const [phonePrefix, setPhonePrefix] = useState(parsedPhone.prefix)
  const [phoneNumber, setPhoneNumber] = useState(parsedPhone.number)
  const [hasReservations, setHasReservations] = useState(!!defaultValues?.reservations_url)

  const { data: categories, isLoading: catsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      phone: defaultValues?.phone ?? '',
      address: defaultValues?.address ?? '',
      price_level: defaultValues?.price_level ?? 1,
      zone: defaultValues?.zone ?? '',
      lat: defaultValues?.lat ?? null,
      lng: defaultValues?.lng ?? null,
      image_url: defaultValues?.image_url ?? '',
      menu_url: defaultValues?.menu_url ?? '',
      reservations_url: defaultValues?.reservations_url ?? '',
      instagram_url: defaultValues?.instagram_url ?? '',
      active: defaultValues?.active ?? false,
      is_demo: defaultValues?.is_demo ?? false,
      plan_type: defaultValues?.plan_type ?? 'standard',
      payment_method: 'redirect',
      category_ids: defaultValues?.restaurant_categories?.map((c: { category_id: string }) => c.category_id) ?? [],
    },
  })

  const selectedPriceLevel = watch('price_level')
  const selectedCategoryIds = watch('category_ids')
  const imageUrlValue = watch('image_url')
  const menuUrlValue = watch('menu_url')
  const reservationsUrlValue = watch('reservations_url')
  const instagramUrlValue = watch('instagram_url')
  const zoneValue = watch('zone')
  const previewName = watch('name')
  const previewDescription = watch('description')
  const previewPriceLevel = watch('price_level')

  const [customZone, setCustomZone] = useState(
    defaultValues?.zone && !ZONES.includes(defaultValues.zone) ? defaultValues.zone : ''
  )
  const [isCustomZone, setIsCustomZone] = useState(
    defaultValues?.zone ? !ZONES.includes(defaultValues.zone) : false
  )

  function toggleCategory(id: string) {
    const current = getValues('category_ids') ?? []
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id]
    setValue('category_ids', next, { shouldValidate: true })
  }

  async function onFormSubmit(data: FormValues) {
    setError('')
    try {
      data.phone = phonePrefix + ' ' + phoneNumber
      if (!hasReservations || !data.reservations_url) {
        data.reservations_url = ''
      }
      if (data.instagram_url) {
        data.instagram_url = normalizeInstagramUrl(data.instagram_url)
      }
      if (staffMode) {
        await onSubmit(data as unknown as RestaurantFormData)
      } else {
        const { plan_type, payment_method, ...cleanData } = data
        await onSubmit(cleanData as RestaurantFormData)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {!hideBackButton && (
        <Link
          href="/establecimientos"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-400 transition-colors hover:text-stone-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a establecimientos
        </Link>
      )}

      <h1 className="mb-8 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
        {isEditing ? 'Editar establecimiento' : 'Nuevo establecimiento'}
      </h1>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8 xl:gap-12">
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-8 lg:col-span-2">
        {/* Basic info */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-stone-900 sm:text-xl">Información básica</h2>
          <div className="flex flex-col gap-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
                Nombre <span className="text-red-400">*</span>
              </label>
              <input
                {...register('name')}
                placeholder="Ej: La Tasquita de Enfrente"
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
              />
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
                Descripción
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Breve descripción del restaurante..."
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
              />
            </div>

            <div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
                  Teléfono
                </label>
                <div className="flex gap-2">
                  <select
                    value={phonePrefix}
                    onChange={(e) => setPhonePrefix(e.target.value)}
                    className="w-24 shrink-0 rounded-2xl border border-stone-200 bg-white px-2 py-3 text-sm text-stone-900 shadow-sm transition-all focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-3 sm:text-base"
                  >
                    {phoneCountries.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
                    placeholder="666 66 66 66"
                    className="flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
                  />
                </div>
              </div>
            </div>

            <div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
                  Dirección
                </label>
                <input
                  {...register('address')}
                  placeholder="Calle, número, ciudad..."
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
                  Zona <span className="text-red-400">*</span>
                </label>
                {isCustomZone ? (
                  <input
                    value={customZone}
                    onChange={(e) => {
                      setCustomZone(e.target.value)
                      setValue('zone', e.target.value, { shouldValidate: true })
                    }}
                    placeholder="Escribe tu zona..."
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
                  />
                ) : (
                  <select
                    value={ZONES.includes(zoneValue) ? zoneValue : ''}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomZone(true)
                        setValue('zone', '', { shouldValidate: true })
                      } else {
                        setValue('zone', e.target.value, { shouldValidate: true })
                      }
                    }}
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
                  >
                    <option value="">Selecciona una zona...</option>
                    {ZONES.map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                    <option value="__custom__">Otra...</option>
                  </select>
                )}
                {isCustomZone && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomZone(false)
                      setCustomZone('')
                      setValue('zone', '', { shouldValidate: true })
                    }}
                    className="mt-1.5 text-sm text-stone-400 hover:text-stone-600"
                  >
                    Volver a seleccionar zona
                  </button>
                )}
                {errors.zone && <p className="mt-1 text-sm text-red-400">{errors.zone.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
                  Precio <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2 sm:gap-3">
                  {priceOptions.map((opt) => (
                    <motion.button
                      key={opt.value}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setValue('price_level', opt.value as 1 | 2 | 3, { shouldValidate: true })}
                      className={cn(
                        'flex-1 rounded-2xl border-2 px-3 py-3 text-sm font-medium shadow-sm transition-all sm:text-base',
                        selectedPriceLevel === opt.value
                          ? 'border-stone-900 bg-stone-100 text-stone-900'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:shadow-md'
                      )}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
                  Latitud
                </label>
                <input
                  {...register('lat', { valueAsNumber: true })}
                  type="number"
                  step="any"
                  placeholder="39.4699"
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
                  Longitud
                </label>
                <input
                  {...register('lng', { valueAsNumber: true })}
                  type="number"
                  step="any"
                  placeholder="-0.3763"
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 sm:text-xl">Categorías</h2>
            {staffMode && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setNewCategoryGroupKeys([])
                  setShowNewCategory(true)
                }}
                className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-dashed border-stone-300 px-4 py-2 text-sm font-medium text-stone-500 shadow-sm transition-all hover:border-stone-400 hover:text-stone-700"
              >
                <Plus className="h-4 w-4" />
                Nueva
              </motion.button>
            )}
          </div>

          {catsLoading ? (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900" />
              <span className="text-sm text-stone-400">Cargando categorías...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {groupCategories(categories ?? []).map((group) => {
                const Icon = group.key === 'cafe-brunch' ? Coffee
                  : group.key === 'tomar-algo' ? Wine
                  : UtensilsCrossed
                const isExpanded = expandedGroups.includes(group.key)
                const selectedInGroup = group.availableCats.filter(
                  (c) => selectedCategoryIds.includes(c.id)
                )

                return (
                  <div
                    key={group.key}
                    className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all"
                  >
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setExpandedGroups((prev) =>
                          prev.includes(group.key)
                            ? prev.filter((k) => k !== group.key)
                            : [...prev, group.key]
                        )
                      }
                      className="flex w-full items-center gap-3 px-4 py-3 text-left sm:px-5 sm:py-4"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-500 sm:h-10 sm:w-10">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-stone-900 sm:text-base">
                          {group.label}
                        </p>
                        <p className="text-xs text-stone-400 truncate">
                          {selectedInGroup.length > 0
                            ? selectedInGroup.map((c) => c.name).join(', ')
                            : `${group.availableCats.length} categorías`}
                        </p>
                      </div>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 shrink-0 text-stone-400 transition-transform sm:h-5 sm:w-5',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </motion.button>

                    <motion.div
                      initial={false}
                      animate={{ height: isExpanded ? 'auto' : 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-2 border-t border-stone-100 px-4 py-3 sm:px-5 sm:py-4">
                        {group.availableCats.map((cat) => (
                          <motion.button
                            key={cat.id}
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleCategory(cat.id)}
                            className={cn(
                              'rounded-2xl border-2 px-3 py-1.5 text-xs font-medium shadow-sm transition-all sm:px-4 sm:py-2 sm:text-sm',
                              selectedCategoryIds.includes(cat.id)
                                ? 'border-stone-900 bg-stone-100 text-stone-900'
                                : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:shadow-md'
                            )}
                          >
                            {cat.name}
                          </motion.button>
                        ))}
                        {group.availableCats.length === 0 && (
                          <p className="text-xs text-stone-400">
                            Sin categorías disponibles
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {showNewCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex w-full max-w-sm flex-col gap-6 rounded-2xl bg-white p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-900">Nueva categoría</h3>
                <button
                  onClick={() => setShowNewCategory(false)}
                  className="rounded-xl p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ej: Kebab"
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  Grupos <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-col gap-2">
                  {CATEGORY_GROUPS.map((g) => {
                    const selected = newCategoryGroupKeys.includes(g.key)
                    return (
                      <label
                        key={g.key}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 text-sm font-medium transition-all',
                          selected
                            ? 'border-stone-900 bg-stone-100 text-stone-900'
                            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() =>
                            setNewCategoryGroupKeys((prev) =>
                              selected
                                ? prev.filter((k) => k !== g.key)
                                : [...prev, g.key]
                            )
                          }
                          className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                        />
                        {g.label}
                      </label>
                    )
                  })}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewCategory(false)}
                  className="flex-1 rounded-2xl border border-stone-200 py-3 text-sm font-semibold text-stone-700 transition-all hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (!newCategoryName.trim()) return
                    if (newCategoryGroupKeys.length === 0) return
                    setCreatingCategory(true)
                    const { data, error } = await supabase
                      .from('categories')
                      .insert({ name: newCategoryName.trim(), group_keys: newCategoryGroupKeys })
                      .select('id')
                    setCreatingCategory(false)
                    if (error) {
                      setError(error.message)
                      return
                    }
                    setShowNewCategory(false)
                    setNewCategoryName('')
                    setNewCategoryGroupKeys([])
                    queryClient.invalidateQueries({ queryKey: ['categories'] })
                    if (data?.[0]?.id) {
                      setValue('category_ids', [...selectedCategoryIds, data[0].id], { shouldValidate: true })
                    }
                  }}
                  disabled={creatingCategory || !newCategoryName.trim() || newCategoryGroupKeys.length === 0}
                  className="flex-1 rounded-2xl bg-stone-800 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-stone-700 disabled:bg-stone-200 disabled:text-stone-400"
                >
                  {creatingCategory ? (
                    <span className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-white" />
                      Creando...
                    </span>
                  ) : (
                    'Crear'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {staffMode && (
          <section>
            <h2 className="mb-4 text-lg font-bold text-stone-900 sm:text-xl">Propietario</h2>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
                Email del propietario <span className="text-red-400">*</span>
              </label>
              <input
                {...register('owner_email')}
                type="email"
                placeholder="propietario@ejemplo.com"
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
              />
              {errors.owner_email && (
                <p className="mt-1 text-xs text-red-400">{errors.owner_email.message as string}</p>
              )}
            </div>
          </section>
        )}

        {staffMode && (
          <section>
            <h2 className="mb-4 text-lg font-bold text-stone-900 sm:text-xl">Demo</h2>
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all hover:border-stone-300 sm:p-5">
              <div>
                <p className="text-sm font-medium text-stone-900 sm:text-base">Restaurante demo</p>
                <p className="mt-0.5 text-sm text-stone-400">
                  Aparece en el flujo público pero no es un restaurante real
                </p>
              </div>
              <input
                type="checkbox"
                {...register('is_demo')}
                className="h-5 w-5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
            </label>
          </section>
        )}

        {staffMode && (
          <section>
            <h2 className="mb-4 text-lg font-bold text-stone-900 sm:text-xl">Plan</h2>
            <div className="flex flex-col gap-3">
              <label className={`flex cursor-pointer items-center rounded-2xl border p-4 shadow-sm transition-all sm:p-5 ${watch('plan_type') === 'standard' ? 'border-stone-900 bg-stone-50' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
                <div className="flex flex-1 items-center gap-3">
                  <input type="radio" value="standard" {...register('plan_type')} className="h-4 w-4 border-stone-300 text-stone-900 focus:ring-stone-900" />
                  <div>
                    <p className="text-sm font-medium text-stone-900 sm:text-base">Normal — 29€/mes</p>
                    <p className="mt-0.5 text-sm text-stone-400">Suscripción mensual, sin compromiso de permanencia</p>
                  </div>
                </div>
              </label>
              <label className={`flex cursor-pointer items-center rounded-2xl border p-4 shadow-sm transition-all sm:p-5 ${watch('plan_type') === 'founder' ? 'border-amber-400 bg-amber-50' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
                <div className="flex flex-1 items-center gap-3">
                  <input type="radio" value="founder" {...register('plan_type')} className="h-4 w-4 border-stone-300 text-amber-600 focus:ring-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-stone-900 sm:text-base">Founder — 39€ (pago único)</p>
                    <p className="mt-0.5 text-sm text-stone-400">Pago único hasta el 31 de diciembre de 2026. Luego suscripción mensual (precio por confirmar).</p>
                  </div>
                </div>
              </label>
            </div>
          </section>
        )}

        {staffMode && (
          <section>
            <h2 className="mb-4 text-lg font-bold text-stone-900 sm:text-xl">Método de pago</h2>
            <div className="flex flex-col gap-3">
              <label className={`flex cursor-pointer items-center rounded-2xl border p-4 shadow-sm transition-all sm:p-5 ${watch('payment_method') === 'redirect' ? 'border-stone-900 bg-stone-50' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
                <div className="flex flex-1 items-center gap-3">
                  <input type="radio" value="redirect" {...register('payment_method')} className="h-4 w-4 border-stone-300 text-stone-900 focus:ring-stone-900" />
                  <div>
                    <p className="text-sm font-medium text-stone-900 sm:text-base">Pagar ahora</p>
                    <p className="mt-0.5 text-sm text-stone-400">Mostrar enlace de pago para que el cliente pague en el momento</p>
                  </div>
                </div>
              </label>
              <label className={`flex cursor-pointer items-center rounded-2xl border p-4 shadow-sm transition-all sm:p-5 ${watch('payment_method') === 'email' ? 'border-stone-900 bg-stone-50' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
                <div className="flex flex-1 items-center gap-3">
                  <input type="radio" value="email" {...register('payment_method')} className="h-4 w-4 border-stone-300 text-stone-900 focus:ring-stone-900" />
                  <div>
                    <p className="text-sm font-medium text-stone-900 sm:text-base">Enviar enlace por email</p>
                    <p className="mt-0.5 text-sm text-stone-400">El propietario recibe un email con un enlace seguro para pagar</p>
                  </div>
                </div>
              </label>
            </div>
          </section>
        )}

        {/* Links & media */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-stone-900 sm:text-xl">Enlaces y multimedia</h2>
          <div className="flex flex-col gap-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
                URL del menú
              </label>
              <div className="relative">
                <input
                  {...register('menu_url')}
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 pr-12 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
                />
                {menuUrlValue && (
                  <a
                    href={menuUrlValue}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
                URL de la imagen
              </label>
              <input
                {...register('image_url')}
                placeholder="https://..."
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
              />
              {imageUrlValue && (
                <div className="mt-3 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
                  <img
                    src={imageUrlValue}
                    alt="Preview"
                    className="h-48 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.classList.add('hidden')
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                  <div className="hidden h-48 w-full items-center justify-center bg-stone-100 px-4 text-sm text-stone-400">
                    No se puede previsualizar la imagen
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
                Instagram
              </label>
              <div className="relative">
                <input
                  {...register('instagram_url')}
                  placeholder="@usuario"
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 pr-12 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
                />
                {instagramUrlValue && (
                  <a
                    href={normalizeInstagramUrl(instagramUrlValue)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
                Reservas web
              </label>
              <div className="mb-3 flex gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setHasReservations(true)}
                  className={cn(
                    'rounded-xl border-2 px-4 py-2 text-sm font-medium shadow-sm transition-all',
                    hasReservations
                      ? 'border-stone-900 bg-stone-100 text-stone-900'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  )}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setHasReservations(false)}
                  className={cn(
                    'rounded-xl border-2 px-4 py-2 text-sm font-medium shadow-sm transition-all',
                    !hasReservations
                      ? 'border-stone-900 bg-stone-100 text-stone-900'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  )}
                >
                  No
                </button>
              </div>
              {hasReservations && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
                    URL de la página de reservas
                  </label>
                  <div className="relative">
                    <input
                      {...register('reservations_url')}
                      placeholder="https://..."
                      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 pr-12 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
                    />
                    {reservationsUrlValue && (
                      <a
                        href={reservationsUrlValue}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Visibility */}
        {isEditing && (
          <section>
            <h2 className="mb-4 text-lg font-bold text-stone-900 sm:text-xl">Visibilidad</h2>
            {defaultValues?.subscription_status === 'active' ? (
              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all hover:border-stone-300 sm:p-5">
                <div>
                  <p className="text-sm font-medium text-stone-900 sm:text-base">Activo</p>
                  <p className="mt-0.5 text-sm text-stone-400">
                    Visible en la página pública y en las búsquedas de usuarios
                  </p>
                </div>
                <input
                  type="checkbox"
                  {...register('active')}
                  className="h-5 w-5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                />
              </label>
            ) : (
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-400 sm:text-base">Activo</p>
                    <p className="mt-0.5 text-sm text-stone-400">
                      Necesitas una suscripción activa para publicar el establecimiento
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    disabled
                    className="h-5 w-5 rounded border-stone-200 bg-stone-100 opacity-50"
                  />
                </div>
                <Link
                  href="/suscripcion"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 underline underline-offset-2 transition-colors hover:text-stone-800"
                >
                  Gestionar suscripción &rarr;
                </Link>
              </div>
            )}
          </section>
        )}

        {error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {!isEditing && (
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all hover:border-stone-300 sm:p-5">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <span className="text-sm leading-relaxed text-stone-600">
              He leído y acepto los{' '}
              <Link href="/terminos" target="_blank" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-700">
                Términos y Condiciones
              </Link>{' '}
              y la{' '}
              <Link href="/privacidad" target="_blank" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-700">
                Política de Privacidad
              </Link>.
            </span>
          </label>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/establecimientos"
            className="inline-flex items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white py-4 text-base font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md sm:px-8 sm:py-4"
          >
            Cancelar
          </Link>
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            type="submit"
            disabled={isSubmitting || (!isEditing && !termsAccepted)}
            className={
              isSubmitting
                ? 'flex-1 rounded-2xl bg-stone-200 py-4 text-base font-semibold text-stone-400 sm:py-4 sm:text-lg'
                : 'flex-1 rounded-2xl bg-stone-800 py-4 text-base font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700 sm:py-4 sm:text-lg lg:py-5 lg:text-xl'
            }
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-white" />
                Guardando...
              </span>
            ) : (
              isEditing
                ? 'Guardar cambios'
                : staffMode
                  ? watch('payment_method') === 'email'
                    ? 'Crear y enviar email'
                    : watch('plan_type') === 'founder'
                      ? 'Crear y cobrar 39€'
                      : 'Crear y enviar a pago'
                  : 'Crear establecimiento'
            )}
          </motion.button>
        </div>
        </form>

        {/* Desktop sidebar preview */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <h3 className="mb-3 text-sm font-semibold text-stone-500">Vista previa</h3>
            <LivePreviewCard
              name={previewName}
              imageUrl={imageUrlValue}
              zone={zoneValue}
              priceLevel={previewPriceLevel as 1 | 2 | 3}
              description={previewDescription}
            />
          </div>
        </div>
      </div>

      {/* Mobile preview below form */}
      <div className="lg:hidden">
        <h3 className="mb-3 text-sm font-semibold text-stone-500">Vista previa</h3>
        <LivePreviewCard
          name={previewName}
          imageUrl={imageUrlValue}
          zone={zoneValue}
          priceLevel={previewPriceLevel as 1 | 2 | 3}
          description={previewDescription}
        />
      </div>
    </motion.div>
  )
}
