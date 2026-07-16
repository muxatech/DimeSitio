import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuestionPrice } from '@/components/question-step'
import { TestWrapper } from '@/tests/helpers'
import { useFlowStore } from '@/store/flow-store'

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
}))

describe('QuestionPrice', () => {
  beforeEach(() => {
    useFlowStore.setState({ selectedPriceLevel: null })
  })

  describe('Spanish (default)', () => {
    it('renders price options', () => {
      render(<QuestionPrice onNext={() => {}} />, { wrapper: TestWrapper })
      expect(screen.getByText('Barato')).toBeInTheDocument()
      expect(screen.getByText('Normal')).toBeInTheDocument()
      expect(screen.getByText('Caro')).toBeInTheDocument()
    })

    it('button is disabled on init', () => {
      render(<QuestionPrice onNext={() => {}} />, { wrapper: TestWrapper })
      const btn = screen.getByText('Selecciona un rango de precio')
      expect(btn).toBeDisabled()
    })

    it('button is enabled after selecting a price', () => {
      render(<QuestionPrice onNext={() => {}} />, { wrapper: TestWrapper })
      fireEvent.click(screen.getByText('Normal'))
      const btn = screen.getByText('Continuar')
      expect(btn).not.toBeDisabled()
    })

    it('calls onNext when clicked with selection', () => {
      const onNext = vi.fn()
      render(<QuestionPrice onNext={onNext} />, { wrapper: TestWrapper })
      fireEvent.click(screen.getByText('Normal'))
      fireEvent.click(screen.getByText('Continuar'))
      expect(onNext).toHaveBeenCalledTimes(1)
    })
  })

  describe('English', () => {
    it('renders price options in English', () => {
      render(<QuestionPrice onNext={() => {}} />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText('Budget')).toBeInTheDocument()
      expect(screen.getByText('Mid-range')).toBeInTheDocument()
      expect(screen.getByText('Premium')).toBeInTheDocument()
    })

    it('button is disabled on init in English', () => {
      render(<QuestionPrice onNext={() => {}} />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      const btn = screen.getByText('Select a price range')
      expect(btn).toBeDisabled()
    })

    it('button shows Continue in English after selection', () => {
      render(<QuestionPrice onNext={() => {}} />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      fireEvent.click(screen.getByText('Mid-range'))
      const btn = screen.getByText('Continue')
      expect(btn).not.toBeDisabled()
    })
  })
})
