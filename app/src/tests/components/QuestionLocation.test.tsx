import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import QuestionLocation from '@/components/question-location'
import { TestWrapper } from '@/tests/helpers'

vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
}))

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: React.PropsWithChildren<Record<string, unknown>>) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  Marker: () => null,
  Circle: () => null,
  useMapEvents: () => null,
  useMap: () => ({ setView: vi.fn() }),
}))

vi.mock('leaflet', () => ({
  Icon: class {
    constructor() { /* noop */ }
  },
}))

const mockGetCurrentPosition = vi.fn()

beforeEach(() => {
  mockGetCurrentPosition.mockReset()
  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition: mockGetCurrentPosition },
    configurable: true,
    writable: true,
  })
})

describe('QuestionLocation', () => {
  describe('Spanish (default)', () => {
    it('renders title and subtitle', () => {
      render(
        <QuestionLocation
          onNext={() => {}}
          onLocationChange={() => {}}
          locationCenter={null}
          locationRadius={null}
          title="¿Dónde quieres comer?"
          subtitle="Selecciona una zona en el mapa"
        />,
        { wrapper: TestWrapper }
      )
      expect(screen.getByText('¿Dónde quieres comer?')).toBeInTheDocument()
      expect(screen.getByText('Selecciona una zona en el mapa')).toBeInTheDocument()
    })

    it('renders the map container', () => {
      render(
        <QuestionLocation
          onNext={() => {}}
          onLocationChange={() => {}}
          locationCenter={null}
          locationRadius={null}
        />,
        { wrapper: TestWrapper }
      )
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })

    it('does not render back button when onBack is not provided', () => {
      render(
        <QuestionLocation
          onNext={() => {}}
          onLocationChange={() => {}}
          locationCenter={null}
          locationRadius={null}
        />,
        { wrapper: TestWrapper }
      )
      expect(screen.queryByText('Atrás')).not.toBeInTheDocument()
    })

    it('renders back button when onBack is provided', () => {
      render(
        <QuestionLocation
          onNext={() => {}}
          onBack={() => {}}
          onLocationChange={() => {}}
          locationCenter={null}
          locationRadius={null}
        />,
        { wrapper: TestWrapper }
      )
      expect(screen.getByText('Atrás')).toBeInTheDocument()
    })

    it('calls onBack when back button is clicked', () => {
      const onBack = vi.fn()
      render(
        <QuestionLocation
          onNext={() => {}}
          onBack={onBack}
          onLocationChange={() => {}}
          locationCenter={null}
          locationRadius={null}
        />,
        { wrapper: TestWrapper }
      )
      fireEvent.click(screen.getByText('Atrás'))
      expect(onBack).toHaveBeenCalledTimes(1)
    })

    it('renders the four radius options', () => {
      render(
        <QuestionLocation
          onNext={() => {}}
          onLocationChange={() => {}}
          locationCenter={null}
          locationRadius={null}
        />,
        { wrapper: TestWrapper }
      )
      expect(screen.getByText('500m')).toBeInTheDocument()
      expect(screen.getByText('1 km')).toBeInTheDocument()
      expect(screen.getByText('2 km')).toBeInTheDocument()
      expect(screen.getByText('5 km')).toBeInTheDocument()
    })

    it('renders the geolocation button', () => {
      render(
        <QuestionLocation
          onNext={() => {}}
          onLocationChange={() => {}}
          locationCenter={null}
          locationRadius={null}
        />,
        { wrapper: TestWrapper }
      )
      expect(screen.getByText('Usar mi ubicación')).toBeInTheDocument()
    })

    it('calls onLocationChange(null, null) and onNext when skip is clicked', () => {
      const onNext = vi.fn()
      const onLocationChange = vi.fn()
      render(
        <QuestionLocation
          onNext={onNext}
          onLocationChange={onLocationChange}
          locationCenter={null}
          locationRadius={null}
        />,
        { wrapper: TestWrapper }
      )
      fireEvent.click(screen.getByText('En cualquier zona'))
      expect(onLocationChange).toHaveBeenCalledWith(null, null)
      expect(onNext).toHaveBeenCalledTimes(1)
    })

    it('calls onLocationChange(center, radius) and onNext when confirm is clicked', () => {
      const onNext = vi.fn()
      const onLocationChange = vi.fn()
      render(
        <QuestionLocation
          onNext={onNext}
          onLocationChange={onLocationChange}
          locationCenter={null}
          locationRadius={null}
        />,
        { wrapper: TestWrapper }
      )
      fireEvent.click(screen.getByText('Ver resultados'))
      expect(onLocationChange).toHaveBeenCalledWith(
        expect.objectContaining({ lat: expect.any(Number), lng: expect.any(Number) }),
        expect.any(Number),
      )
      expect(onNext).toHaveBeenCalledTimes(1)
    })

    it('shows permission denied message when error code is 1', () => {
      mockGetCurrentPosition.mockImplementation((_success: PositionCallback, failure: PositionErrorCallback) => {
        failure({ code: 1, message: 'Permission denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as PositionError)
      })
      render(
        <QuestionLocation
          onNext={() => {}}
          onLocationChange={() => {}}
          locationCenter={null}
          locationRadius={null}
        />,
        { wrapper: TestWrapper }
      )
      fireEvent.click(screen.getByText('Usar mi ubicación'))
      expect(screen.getByText('Permiso de ubicación denegado. Actívalo en Ajustes > Privacidad > Localización > Safari')).toBeInTheDocument()
    })

    it('shows unavailable message when error code is 2', () => {
      mockGetCurrentPosition.mockImplementation((_success: PositionCallback, failure: PositionErrorCallback) => {
        failure({ code: 2, message: 'Position unavailable', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as PositionError)
      })
      render(
        <QuestionLocation
          onNext={() => {}}
          onLocationChange={() => {}}
          locationCenter={null}
          locationRadius={null}
        />,
        { wrapper: TestWrapper }
      )
      fireEvent.click(screen.getByText('Usar mi ubicación'))
      expect(screen.getByText('No pudimos obtener tu ubicación. Prueba en un sitio más abierto o busca en el mapa')).toBeInTheDocument()
    })

    it('shows timeout message when error code is 3', () => {
      mockGetCurrentPosition.mockImplementation((_success: PositionCallback, failure: PositionErrorCallback) => {
        failure({ code: 3, message: 'Timeout', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as PositionError)
      })
      render(
        <QuestionLocation
          onNext={() => {}}
          onLocationChange={() => {}}
          locationCenter={null}
          locationRadius={null}
        />,
        { wrapper: TestWrapper }
      )
      fireEvent.click(screen.getByText('Usar mi ubicación'))
      expect(screen.getByText('No pudimos obtener tu ubicación. Inténtalo de nuevo')).toBeInTheDocument()
    })

    it('calls geolocation getCurrentPosition when button is clicked', () => {
      mockGetCurrentPosition.mockImplementation((success: PositionCallback) => {
        success({
          coords: { latitude: 39.4699, longitude: -0.3763, accuracy: 10 } as GeolocationCoordinates,
          timestamp: Date.now(),
        })
      })
      render(
        <QuestionLocation
          onNext={() => {}}
          onLocationChange={() => {}}
          locationCenter={null}
          locationRadius={null}
        />,
        { wrapper: TestWrapper }
      )
      fireEvent.click(screen.getByText('Usar mi ubicación'))
      expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1)
    })

    it('renders default title and subtitle when not provided', () => {
      render(
        <QuestionLocation
          onNext={() => {}}
          onLocationChange={() => {}}
          locationCenter={null}
          locationRadius={null}
        />,
        { wrapper: TestWrapper }
      )
      expect(screen.getByText('¿Dónde quieres comer?')).toBeInTheDocument()
      expect(screen.getByText('Selecciona una zona en el mapa')).toBeInTheDocument()
    })
  })

  describe('English', () => {
    it('renders default title and subtitle in English', () => {
      render(
        <QuestionLocation
          onNext={() => {}}
          onLocationChange={() => {}}
          locationCenter={null}
          locationRadius={null}
        />,
        { wrapper: (p) => <TestWrapper locale="en" {...p} /> }
      )
      expect(screen.getByText('Where do you want to eat?')).toBeInTheDocument()
      expect(screen.getByText('Select an area on the map')).toBeInTheDocument()
    })

    it('renders back button in English', () => {
      render(
        <QuestionLocation
          onNext={() => {}}
          onBack={() => {}}
          onLocationChange={() => {}}
          locationCenter={null}
          locationRadius={null}
        />,
        { wrapper: (p) => <TestWrapper locale="en" {...p} /> }
      )
      expect(screen.getByText('Back')).toBeInTheDocument()
    })

    it('renders geolocation button in English', () => {
      render(
        <QuestionLocation
          onNext={() => {}}
          onLocationChange={() => {}}
          locationCenter={null}
          locationRadius={null}
        />,
        { wrapper: (p) => <TestWrapper locale="en" {...p} /> }
      )
      expect(screen.getByText('Use my location')).toBeInTheDocument()
    })

    it('renders any zone and see results in English', () => {
      render(
        <QuestionLocation
          onNext={() => {}}
          onLocationChange={() => {}}
          locationCenter={null}
          locationRadius={null}
        />,
        { wrapper: (p) => <TestWrapper locale="en" {...p} /> }
      )
      expect(screen.getByText('Any area')).toBeInTheDocument()
      expect(screen.getByText('See results')).toBeInTheDocument()
    })

    it('calls onLocationChange and onNext when skip is clicked in English', () => {
      const onNext = vi.fn()
      const onLocationChange = vi.fn()
      render(
        <QuestionLocation
          onNext={onNext}
          onLocationChange={onLocationChange}
          locationCenter={null}
          locationRadius={null}
        />,
        { wrapper: (p) => <TestWrapper locale="en" {...p} /> }
      )
      fireEvent.click(screen.getByText('Any area'))
      expect(onLocationChange).toHaveBeenCalledWith(null, null)
      expect(onNext).toHaveBeenCalledTimes(1)
    })

    it('shows permission denied in English', () => {
      mockGetCurrentPosition.mockImplementation((_success: PositionCallback, failure: PositionErrorCallback) => {
        failure({ code: 1, message: 'Permission denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as PositionError)
      })
      render(
        <QuestionLocation
          onNext={() => {}}
          onLocationChange={() => {}}
          locationCenter={null}
          locationRadius={null}
        />,
        { wrapper: (p) => <TestWrapper locale="en" {...p} /> }
      )
      fireEvent.click(screen.getByText('Use my location'))
      expect(screen.getByText('Location permission denied. Enable it in Settings > Privacy > Location > Safari')).toBeInTheDocument()
    })
  })
})
