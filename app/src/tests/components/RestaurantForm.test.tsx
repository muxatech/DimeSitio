import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RestaurantForm from '@/app/(panel)/establecimientos/restaurant-form'
import type { RestaurantWithRole } from '@/types'

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: Record<string, unknown>) => <div {...props}>{children}</div>,
  },
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: Record<string, unknown>) => <a href={href as string} {...props}>{children}</a>,
}))

const { mockFormValues } = vi.hoisted(() => ({
  mockFormValues: {
    name: 'Test',
    price_level: 2,
    zone: 'centro',
    category_ids: ['cat-1'],
    description: '',
    phone: '',
    address: '',
    lat: null,
    lng: null,
    image_url: '',
    menu_url: '',
    reservations_url: '',
    instagram_url: '',
    active: false,
    is_demo: false,
    owner_email: '',
    plan_type: 'standard',
    payment_method: 'redirect',
  } as Record<string, unknown>,
}))

vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({
    register: vi.fn(),
    handleSubmit: vi.fn((cb: (d: unknown) => void) => () => cb(mockFormValues)),
    setValue: vi.fn(),
    getValues: vi.fn(() => []),
    watch: vi.fn((key: string) => {
      if (key === 'category_ids') return []
      if (key === 'price_level') return 1
      return null
    }),
    formState: { errors: {} },
  })),
}))

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(() => () => ({ values: {}, errors: {} })),
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({
    data: [
      { id: 'cat-1', name: 'Italiana' },
      { id: 'cat-2', name: 'Japonesa' },
    ],
    isLoading: false,
  })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}))

vi.mock('@/lib/panel/api', () => ({
  getCategories: vi.fn(() => Promise.resolve([])),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: [{ id: 'new-cat-1' }], error: null })),
      })),
    })),
  },
}))

describe('RestaurantForm T&C acceptance', () => {
  const onSubmit = vi.fn()

  it('renders T&C checkbox when creating', () => {
    render(<RestaurantForm onSubmit={onSubmit} isSubmitting={false} />)
    expect(screen.getByText(/Términos y Condiciones/)).toBeInTheDocument()
    expect(screen.getByText(/Política de Privacidad/)).toBeInTheDocument()
  })

  it('submit button is disabled when checkbox is not checked', () => {
    render(<RestaurantForm onSubmit={onSubmit} isSubmitting={false} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
    const submitBtn = screen.getByText('Crear establecimiento')
    expect(submitBtn.closest('button')).toBeDisabled()
  })

  it('submit button is enabled after checking the checkbox', () => {
    render(<RestaurantForm onSubmit={onSubmit} isSubmitting={false} />)
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(true)
    const submitBtn = screen.getByText('Crear establecimiento')
    expect(submitBtn.closest('button')).not.toBeDisabled()
  })

  it('does not render T&C checkbox when editing an existing restaurant', () => {
    render(
      <RestaurantForm
        onSubmit={onSubmit}
        isSubmitting={false}
        defaultValues={{ id: 'r-1', name: 'Existing' } as unknown as RestaurantWithRole}
      />
    )
    expect(screen.queryByText(/Términos y Condiciones/)).not.toBeInTheDocument()
  })

  it('T&C link points to /terminos and privacy link to /privacidad', () => {
    render(<RestaurantForm onSubmit={onSubmit} isSubmitting={false} />)
    const termLink = screen.getByText('Términos y Condiciones')
    expect(termLink.closest('a')).toHaveAttribute('href', '/terminos')
    const privLink = screen.getByText('Política de Privacidad')
    expect(privLink.closest('a')).toHaveAttribute('href', '/privacidad')
  })
})

describe('RestaurantForm staff category creation', () => {
  const onSubmit = vi.fn()

  it('does not show Nueva button without staffMode', () => {
    render(<RestaurantForm onSubmit={onSubmit} isSubmitting={false} />)
    expect(screen.queryByText('Nueva')).not.toBeInTheDocument()
  })

  it('shows Nueva button with staffMode', () => {
    render(<RestaurantForm onSubmit={onSubmit} isSubmitting={false} staffMode />)
    expect(screen.getByText('Nueva')).toBeInTheDocument()
  })

  it('opens dialog when Nueva is clicked', () => {
    render(<RestaurantForm onSubmit={onSubmit} isSubmitting={false} staffMode />)
    fireEvent.click(screen.getByText('Nueva'))
    expect(screen.getByText('Nueva categoría')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ej: Kebab')).toBeInTheDocument()
  })

  it('closes dialog on Cancel', () => {
    render(<RestaurantForm onSubmit={onSubmit} isSubmitting={false} staffMode />)
    fireEvent.click(screen.getByText('Nueva'))
    expect(screen.getByText('Nueva categoría')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByText('Nueva categoría')).not.toBeInTheDocument()
  })
})

describe('RestaurantForm is_demo toggle', () => {
  const onSubmit = vi.fn()

  it('does not show demo section without staffMode', () => {
    render(<RestaurantForm onSubmit={onSubmit} isSubmitting={false} />)
    expect(screen.queryByText('Restaurante demo')).not.toBeInTheDocument()
  })

  it('shows demo section with staffMode', () => {
    render(<RestaurantForm onSubmit={onSubmit} isSubmitting={false} staffMode />)
    expect(screen.getByText('Restaurante demo')).toBeInTheDocument()
  })

  it('checkbox is unchecked by default', () => {
    render(<RestaurantForm onSubmit={onSubmit} isSubmitting={false} staffMode />)
    const checkboxes = screen.getAllByRole('checkbox')
    const demoCheckbox = checkboxes.find((cb) => cb.closest('section')?.textContent?.includes('Restaurante demo'))
    expect(demoCheckbox).toBeDefined()
    expect(demoCheckbox).not.toBeChecked()
  })

  it('checkbox can be checked', () => {
    render(<RestaurantForm onSubmit={onSubmit} isSubmitting={false} staffMode />)
    const checkboxes = screen.getAllByRole('checkbox')
    const demoCheckbox = checkboxes.find((cb) => cb.closest('section')?.textContent?.includes('Restaurante demo')) as HTMLInputElement
    fireEvent.click(demoCheckbox)
    expect(demoCheckbox.checked).toBe(true)
  })
})

describe('RestaurantForm Instagram field', () => {
  const onSubmit = vi.fn()

  it('renders Instagram input with placeholder', () => {
    render(<RestaurantForm onSubmit={onSubmit} isSubmitting={false} />)
    expect(screen.getByText('Instagram')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('@usuario')).toBeInTheDocument()
  })
})

describe('RestaurantForm Instagram normalization on submit', () => {
  let onSubmit: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onSubmit = vi.fn()
    Object.assign(mockFormValues, {
      name: 'Test',
      price_level: 2,
      zone: 'centro',
      category_ids: ['cat-1'],
      description: '',
      phone: '',
      address: '',
      lat: null,
      lng: null,
      image_url: '',
      menu_url: '',
      reservations_url: '',
      instagram_url: '',
      active: false,
      is_demo: false,
      owner_email: '',
      plan_type: 'standard',
      payment_method: 'redirect',
    })
  })

  it('normalizes @handle to full URL', () => {
    mockFormValues.instagram_url = '@test_user'
    render(<RestaurantForm onSubmit={onSubmit} isSubmitting={false} />)

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    fireEvent.click(checkbox)
    fireEvent.click(screen.getByText('Crear establecimiento'))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ instagram_url: 'https://instagram.com/test_user' })
    )
  })

  it('does not duplicate already normalized URL', () => {
    mockFormValues.instagram_url = 'https://instagram.com/test_user'
    render(<RestaurantForm onSubmit={onSubmit} isSubmitting={false} />)

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    fireEvent.click(checkbox)
    fireEvent.click(screen.getByText('Crear establecimiento'))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ instagram_url: 'https://instagram.com/test_user' })
    )
  })

  it('adds https:// to instagram.com/handle without protocol', () => {
    mockFormValues.instagram_url = 'instagram.com/test_user'
    render(<RestaurantForm onSubmit={onSubmit} isSubmitting={false} />)

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    fireEvent.click(checkbox)
    fireEvent.click(screen.getByText('Crear establecimiento'))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ instagram_url: 'https://instagram.com/test_user' })
    )
  })

  it('strips plan_type and payment_method before calling onSubmit', () => {
    mockFormValues.instagram_url = '@test'
    render(<RestaurantForm onSubmit={onSubmit} isSubmitting={false} />)

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    fireEvent.click(checkbox)
    fireEvent.click(screen.getByText('Crear establecimiento'))

    const calledData = onSubmit.mock.calls[0][0]
    expect(calledData).not.toHaveProperty('plan_type')
    expect(calledData).not.toHaveProperty('payment_method')
  })
})
