import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import NuevoEstablecimientoPage from '@/app/(panel)/establecimientos/nuevo/page'

const mockCreateRestaurant = vi.fn()
const mockCreateCheckout = vi.fn()
let mutationCallback: ((data: { name: string }) => void) | null = null

vi.mock('@/lib/panel/api', () => ({
  createRestaurant: (...args: unknown[]) => mockCreateRestaurant(...args),
  createCheckoutSession: (...args: unknown[]) => mockCreateCheckout(...args),
}))

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(({ mutationFn, onSuccess }: { mutationFn: (data: unknown) => Promise<unknown>; onSuccess: (data: unknown) => void }) => {
    mutationCallback = (data: { name: string }) => {
      const p = mutationFn(data)
      p.then((res) => onSuccess(res))
    }
    return {
      mutateAsync: (data: { name: string }) => {
        const p = mutationFn(data)
        p.then((res) => onSuccess(res))
        return p
      },
      isPending: false,
    }
  }),
  useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <button {...props}>{children}</button>,
  },
}))

vi.mock('@/app/(panel)/establecimientos/restaurant-form', () => ({
  default: ({ onSubmit, isSubmitting }: { onSubmit: (data: { name: string }) => void; isSubmitting: boolean }) => (
    <div>
      <button onClick={() => onSubmit({ name: 'Test' })} disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Crear'}
      </button>
    </div>
  ),
}))

describe('NuevoEstablecimientoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mutationCallback = null
  })

  it('shows created dialog after successful creation', async () => {
    mockCreateRestaurant.mockResolvedValue({ id: 'r-new' })
    mockCreateCheckout.mockResolvedValue('https://checkout.stripe.com/test')

    render(<NuevoEstablecimientoPage />)
    await act(async () => {
      fireEvent.click(screen.getByText('Crear'))
    })
    await waitFor(() => {
      expect(screen.getByText('Establecimiento creado')).toBeInTheDocument()
    })
  })

  it('shows error when checkout fails', async () => {
    mockCreateRestaurant.mockResolvedValue({ id: 'r-new' })
    mockCreateCheckout.mockRejectedValue(new Error('Error de pago'))

    render(<NuevoEstablecimientoPage />)
    await act(async () => {
      fireEvent.click(screen.getByText('Crear'))
    })
    await waitFor(() => {
      expect(screen.getByText('Completar activación')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Completar activación'))
    await waitFor(() => {
      expect(screen.getByText('Error de pago')).toBeInTheDocument()
    })
  })
})
