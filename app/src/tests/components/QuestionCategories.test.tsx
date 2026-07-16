import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuestionCategories } from '@/components/question-step'
import { TestWrapper } from '@/tests/helpers'

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
  describe('Spanish (default)', () => {
    it('renders all categories', () => {
      render(<QuestionCategories categories={mockCategories} onNext={() => {}} />, { wrapper: TestWrapper })
      expect(screen.getByText('Italiana')).toBeInTheDocument()
      expect(screen.getByText('Japonesa')).toBeInTheDocument()
      expect(screen.getByText('Mexicana')).toBeInTheDocument()
    })

    it('shows disabled button on init with correct text', () => {
      render(<QuestionCategories categories={mockCategories} onNext={() => {}} />, { wrapper: TestWrapper })
      const nextBtn = screen.getByText('Selecciona al menos una opción')
      expect(nextBtn).toBeDisabled()
    })

    it('shows back button text when onBack provided', () => {
      const onBack = vi.fn()
      render(<QuestionCategories categories={mockCategories} onNext={() => {}} onBack={onBack} />, { wrapper: TestWrapper })
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
        />,
        { wrapper: TestWrapper }
      )
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
    })
  })

  describe('English', () => {
    it('shows disabled button in English', () => {
      render(<QuestionCategories categories={mockCategories} onNext={() => {}} />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      const nextBtn = screen.getByText('Select at least one option')
      expect(nextBtn).toBeDisabled()
    })

    it('shows back button in English', () => {
      render(<QuestionCategories categories={mockCategories} onNext={() => {}} onBack={() => {}} />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText('Back')).toBeInTheDocument()
    })
  })
})
