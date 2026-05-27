'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/lib/panel/api'
import { cn } from '@/lib/utils'
import type { RestaurantFormData, RestaurantWithRole } from '@/types'

const restaurantSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  price_level: z.number().min(1).max(3),
  zone: z.string().min(1, 'La zona es obligatoria'),
  image_url: z.string().optional(),
  menu_url: z.string().optional(),
  category_ids: z.array(z.string()),
})

type FormValues = z.infer<typeof restaurantSchema>

const priceOptions = [
  { value: 1, label: 'Barato' },
  { value: 2, label: 'Normal' },
  { value: 3, label: 'Caro' },
]

interface RestaurantFormProps {
  defaultValues?: RestaurantWithRole | null
  onSubmit: (data: RestaurantFormData) => Promise<void>
  isSubmitting: boolean
}

export default function RestaurantForm({ defaultValues, onSubmit, isSubmitting }: RestaurantFormProps) {
  const [error, setError] = useState('')
  const isEditing = !!defaultValues

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
      lat: defaultValues?.lat ?? null,
      lng: defaultValues?.lng ?? null,
      price_level: defaultValues?.price_level ?? 1,
      zone: defaultValues?.zone ?? '',
      image_url: defaultValues?.image_url ?? '',
      menu_url: defaultValues?.menu_url ?? '',
      category_ids: defaultValues?.restaurant_categories?.map((c: { category_id: string }) => c.category_id) ?? [],
    },
  })

  const selectedPriceLevel = watch('price_level')
  const selectedCategoryIds = watch('category_ids')

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
      await onSubmit(data as RestaurantFormData)
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
      <Link
        href="/establecimientos"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-400 transition-colors hover:text-stone-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a establecimientos
      </Link>

      <h1 className="mb-8 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
        {isEditing ? 'Editar establecimiento' : 'Nuevo establecimiento'}
      </h1>

      <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-8">
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

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
                  Teléfono
                </label>
                <input
                  {...register('phone')}
                  placeholder="+34 600 00 00 00"
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
                />
              </div>
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
          </div>
        </section>

        {/* Location & price */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-stone-900 sm:text-xl">Ubicación y precio</h2>
          <div className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
                  Zona <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('zone')}
                  placeholder="Ej: Centro, Ruzafa, Carmen..."
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
                />
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
                  type="number"
                  step="any"
                  {...register('lat', { valueAsNumber: true })}
                  placeholder="39.4699"
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
                  Longitud
                </label>
                <input
                  type="number"
                  step="any"
                  {...register('lng', { valueAsNumber: true })}
                  placeholder="-0.3763"
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-stone-900 sm:text-xl">Categorías</h2>
          {catsLoading ? (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900" />
              <span className="text-sm text-stone-400">Cargando categorías...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {categories?.map((cat) => (
                <motion.button
                  key={cat.id}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    'rounded-2xl border-2 px-4 py-2.5 text-sm font-medium shadow-sm transition-all sm:px-5 sm:py-3 sm:text-base',
                    selectedCategoryIds.includes(cat.id)
                      ? 'border-stone-900 bg-stone-100 text-stone-900'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:shadow-md'
                  )}
                >
                  {cat.name}
                </motion.button>
              ))}
            </div>
          )}
        </section>

        {/* Links & media */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-stone-900 sm:text-xl">Enlaces y multimedia</h2>
          <div className="flex flex-col gap-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700 sm:text-base">
                URL del menú
              </label>
              <input
                {...register('menu_url')}
                placeholder="https://..."
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
              />
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
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
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
            disabled={isSubmitting}
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
              isEditing ? 'Guardar cambios' : 'Crear establecimiento'
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}
