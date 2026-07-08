import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Top5Grid from '@/components/top5-grid'
import { useFlowStore } from '@/store/flow-store'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: Record<string, unknown>) => <>{children}</>,
}))

describe('Top5Grid', () => {
  beforeEach(() => {
    useFlowStore.setState({
      top5: [],
      step: 'top5',
    })
  })

  it('shows empty state when no top5', () => {
    render(<Top5Grid />)
    expect(screen.getByText(/no encontramos rest/)).toBeInTheDocument()
  })

  it('shows option count and start button when top5 exists', () => {
    useFlowStore.setState({ top5: [{ id: 'a' }, { id: 'b' }] as any })
    render(<Top5Grid />)
    expect(screen.getByText(/2 opciones/)).toBeInTheDocument()
    expect(screen.getByText(/Elegir favorito/)).toBeInTheDocument()
  })

  it('does not show start button with only 1 option', () => {
    useFlowStore.setState({ top5: [{ id: 'a' }] as any })
    render(<Top5Grid />)
    expect(screen.queryByText(/Elegir favorito/)).not.toBeInTheDocument()
  })
})


