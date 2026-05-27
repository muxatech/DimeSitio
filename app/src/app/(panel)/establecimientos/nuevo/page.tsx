'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRestaurant } from '@/lib/panel/api'
import RestaurantForm from '@/app/(panel)/establecimientos/restaurant-form'
import type { RestaurantFormData } from '@/types'

export default function NuevoEstablecimientoPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-restaurants'] })
      router.push('/establecimientos')
    },
  })

  async function handleSubmit(data: RestaurantFormData) {
    await mutation.mutateAsync(data)
  }

  return (
    <RestaurantForm
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
    />
  )
}
