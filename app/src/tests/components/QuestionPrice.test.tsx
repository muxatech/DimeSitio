import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuestionPrice } from '@/components/question-step'

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
}))

describe('QuestionPrice', () => {
  it('renders price options', () => {
    render(<QuestionPrice onNext={() => {}} />)
    expect(screen.getByText('Barato')).toBeInTheDocument()
    expect(screen.getByText('Normal')).toBeInTheDocument()
    expect(screen.getByText('Caro')).toBeInTheDocument()
  })

  it('button is disabled on init', () => {
    render(<QuestionPrice onNext={() => {}} />)
    const btn = screen.getByText('Selecciona un rango de precio')
    expect(btn).toBeDisabled()
  })

  it('button is enabled after selecting a price', () => {
    render(<QuestionPrice onNext={() => {}} />)
    fireEvent.click(screen.getByText('Normal'))
    const btn = screen.getByText('Continuar')
    expect(btn).not.toBeDisabled()
  })

  it('calls onNext when clicked with selection', () => {
    const onNext = vi.fn()
    render(<QuestionPrice onNext={onNext} />)
    fireEvent.click(screen.getByText('Normal'))
    fireEvent.click(screen.getByText('Continuar'))
    expect(onNext).toHaveBeenCalledTimes(1)
  })
})
