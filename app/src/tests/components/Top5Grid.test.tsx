import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Top5Grid from '@/components/top5-grid'
import { useFlowStore } from '@/store/flow-store'

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children}</button>,
  },
}))

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: Record<string, unknown>) => <img alt={alt as string} {...props} />,
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
    expect(screen.getByText(/No encontramos/)).toBeInTheDocument()
  })

  it('shows VS preview for the first two and count of remaining', () => {
    useFlowStore.setState({
      top5: [
        { id: 'a', name: 'Rest A', image_url: null },
        { id: 'b', name: 'Rest B', image_url: null },
        { id: 'c', name: 'Rest C', image_url: null },
      ] as any,
    })
    render(<Top5Grid />)
    expect(screen.getByText('VS')).toBeInTheDocument()
    expect(screen.getByText('Rest A')).toBeInTheDocument()
    expect(screen.getByText('Rest B')).toBeInTheDocument()
    expect(screen.getByText('+1 más')).toBeInTheDocument()
    expect(screen.getByText(/Elegir favorito/)).toBeInTheDocument()
  })

  it('shows only one card when only 1 option', () => {
    useFlowStore.setState({
      top5: [{ id: 'a', name: 'Solo Rest', image_url: null }] as any,
    })
    render(<Top5Grid />)
    expect(screen.getByText('Solo Rest')).toBeInTheDocument()
    expect(screen.queryByText('VS')).not.toBeInTheDocument()
    expect(screen.queryByText(/Elegir favorito/)).not.toBeInTheDocument()
  })

  it('does not show +N more when only 2 options', () => {
    useFlowStore.setState({
      top5: [
        { id: 'a', name: 'Rest A', image_url: null },
        { id: 'b', name: 'Rest B', image_url: null },
      ] as any,
    })
    render(<Top5Grid />)
    expect(screen.queryByText(/más/)).not.toBeInTheDocument()
  })
})
