import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CategoriasPage from '@/app/[locale]/(panel)/categorias/page'
import { TestWrapper } from '../helpers'

const { mockReplace, mockCheckStaff } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockCheckStaff: vi.fn(),
}))

let mockOrderFn = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

vi.mock('@/lib/panel/api', () => ({
  checkStaffStatus: (...args: unknown[]) => mockCheckStaff(...args),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ order: mockOrderFn })),
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: [{ id: 'new-cat' }], error: null })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}))

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: Record<string, unknown>) => <div {...props}>{children}</div>,
  },
}))

describe('CategoriasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckStaff.mockResolvedValue(true)
    mockOrderFn = vi.fn().mockResolvedValue({
      data: [
        { id: 'cat-1', name: 'Italiana' },
        { id: 'cat-2', name: 'Japonesa' },
      ],
      error: null,
    })
  })

  it('redirects to dashboard if not staff', async () => {
    mockCheckStaff.mockResolvedValue(false)
    render(<TestWrapper><CategoriasPage /></TestWrapper>)
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('renders categories list when staff', async () => {
    render(<TestWrapper><CategoriasPage /></TestWrapper>)
    await waitFor(() => {
      expect(screen.getByText('Italiana')).toBeInTheDocument()
      expect(screen.getByText('Japonesa')).toBeInTheDocument()
    })
  })

  it('shows Añadir categoría button', async () => {
    render(<TestWrapper><CategoriasPage /></TestWrapper>)
    await waitFor(() => {
      expect(screen.getByText('Añadir categoría')).toBeInTheDocument()
    })
  })

  it('opens create modal on Añadir click', async () => {
    render(<TestWrapper><CategoriasPage /></TestWrapper>)
    await waitFor(() => {
      fireEvent.click(screen.getByText('Añadir categoría'))
    })
    expect(screen.getByText('Nueva categoría')).toBeInTheDocument()
  })

  it('opens edit modal on pencil click', async () => {
    render(<TestWrapper><CategoriasPage /></TestWrapper>)
    await waitFor(() => {
      expect(screen.getByLabelText('Editar Italiana')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByLabelText('Editar Italiana'))
    expect(screen.getByText('Editar categoría')).toBeInTheDocument()
  })

  it('shows empty state when no categories', async () => {
    mockOrderFn = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    })
    render(<TestWrapper><CategoriasPage /></TestWrapper>)
    await waitFor(() => {
      expect(screen.getByText('No hay categorías')).toBeInTheDocument()
    })
  })
})
