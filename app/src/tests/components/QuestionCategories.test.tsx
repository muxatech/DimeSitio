import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuestionCategories } from '@/components/question-step'

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
}))

const mockCategories = [
  { id: 'cat-1', name: 'Italiana' },
  { id: 'cat-2', name: 'Japonesa' },
  { id: 'cat-3', name: 'Mexicana' },
]

describe('QuestionCategories', () => {
  it('renders all categories', () => {
    render(<QuestionCategories categories={mockCategories} onNext={() => {}} />)
    expect(screen.getByText('Italiana')).toBeInTheDocument()
    expect(screen.getByText('Japonesa')).toBeInTheDocument()
    expect(screen.getByText('Mexicana')).toBeInTheDocument()
  })

  it('shows disabled button on init with correct text', () => {
    render(<QuestionCategories categories={mockCategories} onNext={() => {}} />)
    const nextBtn = screen.getByText('Selecciona al menos una opción')
    expect(nextBtn).toBeDisabled()
  })

  it('shows back button text when onBack provided', () => {
    const onBack = vi.fn()
    render(<QuestionCategories categories={mockCategories} onNext={() => {}} onBack={onBack} />)
    const backBtn = screen.getByText('Atrás')
    expect(backBtn).toBeInTheDocument()
    fireEvent.click(backBtn)
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('renders header title and subtitle', () => {
    render(
      <QuestionCategories
        categories={mockCategories}
        onNext={() => {}}
        title="Test Title"
        subtitle="Test Subtitle"
      />
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
  })
})
