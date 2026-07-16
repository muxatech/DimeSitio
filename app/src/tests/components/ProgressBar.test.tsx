import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProgressBar from '@/components/progress-bar'
import { TestWrapper } from '@/tests/helpers'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
}))

describe('ProgressBar', () => {
  describe('Spanish (default)', () => {
    it('renders current / total text', () => {
      render(<ProgressBar current={1} total={3} />, { wrapper: TestWrapper })
      expect(screen.getByText((c) => c.includes('2') && c.includes('3') && c.includes('/'))).toBeInTheDocument()
    })

    it('renders correct label for first step', () => {
      render(<ProgressBar current={0} total={3} />, { wrapper: TestWrapper })
      expect(screen.getByText('¿Qué te apetece?')).toBeInTheDocument()
    })

    it('renders correct label for second step', () => {
      render(<ProgressBar current={1} total={3} />, { wrapper: TestWrapper })
      expect(screen.getByText('¿Cuánto gastas?')).toBeInTheDocument()
    })

    it('renders fallback label when current exceeds labels', () => {
      render(<ProgressBar current={5} total={6} />, { wrapper: TestWrapper })
      expect(screen.getByText('Paso 6')).toBeInTheDocument()
    })
  })

  describe('English', () => {
    it('renders correct label for first step', () => {
      render(<ProgressBar current={0} total={3} />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText('What do you feel like?')).toBeInTheDocument()
    })

    it('renders correct label for second step', () => {
      render(<ProgressBar current={1} total={3} />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText('How much do you spend?')).toBeInTheDocument()
    })

    it('renders fallback label in English', () => {
      render(<ProgressBar current={5} total={6} />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText('Step 6')).toBeInTheDocument()
    })
  })
})
