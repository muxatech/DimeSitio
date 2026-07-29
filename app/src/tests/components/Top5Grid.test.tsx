import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Top5Grid from '@/components/top5-grid'
import { useFlowStore } from '@/store/flow-store'
import { TestWrapper } from '@/tests/helpers'

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children}</button>,
  },
}))

describe('Top5Grid', () => {
  beforeEach(() => {
    useFlowStore.setState({
      top5: [],
      step: 'top5',
    })
  })

  describe('Spanish (default)', () => {
    it('shows empty state when no top5', () => {
      render(<Top5Grid />, { wrapper: TestWrapper })
      expect(screen.getByText(/No encontramos/)).toBeInTheDocument()
    })

    it('shows selection count and subtitle', () => {
      useFlowStore.setState({
        top5: [
          { id: 'a', name: 'Rest A' },
          { id: 'b', name: 'Rest B' },
        ] as any,
      })
      render(<Top5Grid />, { wrapper: TestWrapper })
      expect(screen.getByText(/Hemos seleccionado/)).toBeInTheDocument()
      expect(screen.getByText('Ahora te ayudaremos a elegir el mejor.')).toBeInTheDocument()
    })

    it('shows choose favorite button when 2+ options', () => {
      useFlowStore.setState({
        top5: [
          { id: 'a', name: 'Rest A' },
          { id: 'b', name: 'Rest B' },
        ] as any,
      })
      render(<Top5Grid />, { wrapper: TestWrapper })
      expect(screen.getByText(/Elegir favorito/)).toBeInTheDocument()
    })

    it('does not show button when only 1 option', () => {
      useFlowStore.setState({
        top5: [{ id: 'a', name: 'Solo Rest' }] as any,
      })
      render(<Top5Grid />, { wrapper: TestWrapper })
      expect(screen.queryByText(/Elegir favorito/)).not.toBeInTheDocument()
    })
  })

  describe('English', () => {
    it('shows empty state in English', () => {
      render(<Top5Grid />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText(/No restaurants found with those filters/)).toBeInTheDocument()
    })

    it('shows change filters button in English', () => {
      render(<Top5Grid />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText('Change filters')).toBeInTheDocument()
    })

    it('shows subtitle and button in English', () => {
      useFlowStore.setState({
        top5: [
          { id: 'a', name: 'Rest A' },
          { id: 'b', name: 'Rest B' },
        ] as any,
      })
      render(<Top5Grid />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText("Now we'll help you choose the best one.")).toBeInTheDocument()
      expect(screen.getByText(/Choose favorite/)).toBeInTheDocument()
    })

    it('shows selection count in English', () => {
      useFlowStore.setState({
        top5: [
          { id: 'a', name: 'Rest A' },
          { id: 'b', name: 'Rest B' },
        ] as any,
      })
      render(<Top5Grid />, { wrapper: (p) => <TestWrapper locale="en" {...p} /> })
      expect(screen.getByText(/We've selected/)).toBeInTheDocument()
    })
  })
})
