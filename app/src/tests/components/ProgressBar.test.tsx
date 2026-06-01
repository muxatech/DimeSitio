import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProgressBar from '@/components/progress-bar'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
}))

describe('ProgressBar', () => {
  it('renders current / total text', () => {
    render(<ProgressBar current={1} total={3} />)
    expect(screen.getByText((c) => c.includes('2') && c.includes('3') && c.includes('/'))).toBeInTheDocument()
  })

  it('renders correct label for first step', () => {
    render(<ProgressBar current={0} total={3} />)
    expect(screen.getByText('¿Qué te apetece?')).toBeInTheDocument()
  })

  it('renders correct label for second step', () => {
    render(<ProgressBar current={1} total={3} />)
    expect(screen.getByText('¿Cuánto gastas?')).toBeInTheDocument()
  })

  it('renders fallback label when current exceeds labels', () => {
    render(<ProgressBar current={5} total={6} />)
    expect(screen.getByText('Paso 6')).toBeInTheDocument()
  })
})
