import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuestionZone } from '@/components/question-step'

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
}))

const mockZones = ['centro', 'extensión', 'playa']

describe('QuestionZone', () => {
  it('renders all zones', () => {
    render(<QuestionZone zones={mockZones} onNext={() => {}} />)
    expect(screen.getByText('centro')).toBeInTheDocument()
    expect(screen.getByText('extensión')).toBeInTheDocument()
    expect(screen.getByText('playa')).toBeInTheDocument()
  })

  it('renders "me da igual" button', () => {
    render(<QuestionZone zones={mockZones} onNext={() => {}} />)
    expect(screen.getByText('Me da igual la zona')).toBeInTheDocument()
  })

  it('shows back button and calls onBack', () => {
    const onBack = vi.fn()
    render(<QuestionZone zones={mockZones} onNext={() => {}} onBack={onBack} />)
    fireEvent.click(screen.getByText('Atrás'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('calls onNext on "Ver resultados" click', () => {
    const onNext = vi.fn()
    render(<QuestionZone zones={mockZones} onNext={onNext} />)
    fireEvent.click(screen.getByText('Ver resultados'))
    expect(onNext).toHaveBeenCalledTimes(1)
  })
})
