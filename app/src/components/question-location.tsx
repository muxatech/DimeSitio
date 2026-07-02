'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet'
import { Icon, type LatLng } from 'leaflet'
import { motion } from 'framer-motion'
import { ArrowLeft, Crosshair, MapPin } from 'lucide-react'
import type { LocationCenter } from '@/store/flow-store'
import { cn } from '@/lib/utils'

import 'leaflet/dist/leaflet.css'

const VALENCIA_CENTER: LocationCenter = { lat: 39.4699, lng: -0.3763 }

const RADIUS_OPTIONS = [
  { value: 500, label: '500m' },
  { value: 1000, label: '1 km' },
  { value: 2000, label: '2 km' },
  { value: 5000, label: '5 km' },
]

const markerIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function DraggableMarker({
  center,
  onCenterChange,
}: {
  center: LocationCenter
  onCenterChange: (c: LocationCenter) => void
}) {
  const markerRef = useRef<any>(null)

  useMapEvents({
    click(e) {
      onCenterChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([center.lat, center.lng])
    }
  }, [center])

  return (
    <Marker
      ref={markerRef}
      position={[center.lat, center.lng]}
      icon={markerIcon}
      draggable
      eventHandlers={{
        dragend(e) {
          const pos = e.target.getLatLng()
          onCenterChange({ lat: pos.lat, lng: pos.lng })
        },
      }}
    />
  )
}

function FitBoundsOnMount({ center }: { center: LocationCenter }) {
  const map = useMap()
  useEffect(() => {
    map.setView([center.lat, center.lng], 14)
  }, [])
  return null
}

interface QuestionLocationProps {
  onNext: () => void
  onBack?: () => void
  title?: string
  subtitle?: string
  locationCenter: LocationCenter | null
  locationRadius: number | null
  onLocationChange: (center: LocationCenter | null, radius: number | null) => void
}

function QuestionLocationInner({
  onNext,
  onBack,
  title = '¿Dónde quieres comer?',
  subtitle = 'Selecciona una zona en el mapa',
  locationCenter,
  locationRadius,
  onLocationChange,
}: QuestionLocationProps) {
  const [center, setCenter] = useState<LocationCenter>(locationCenter ?? VALENCIA_CENTER)
  const [radius, setRadius] = useState<number>(locationRadius ?? 1000)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const hasLocation = locationCenter !== null

  const handleCenterChange = useCallback((c: LocationCenter) => {
    setCenter(c)
  }, [])

  const handleUseMyLocation = useCallback(() => {
    setGeoLoading(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCenter(c)
        onLocationChange(c, radius)
        setGeoLoading(false)
      },
      (err) => {
        setGeoError('No pudimos obtener tu ubicación')
        setGeoLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [radius, onLocationChange])

  const handleConfirm = useCallback(() => {
    onLocationChange(center, radius)
    onNext()
  }, [center, radius, onLocationChange, onNext])

  const handleSkip = useCallback(() => {
    onLocationChange(null, null)
    onNext()
  }, [onLocationChange, onNext])

  return (
    <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
      {onBack && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-stone-400 transition-colors hover:text-stone-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Atrás
        </motion.button>
      )}
      <div className="space-y-1.5 sm:space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        <p className="text-sm text-stone-400 sm:text-base lg:text-lg">
          {subtitle}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
        <div className="h-72 w-full sm:h-96">
          <MapContainer
            center={[center.lat, center.lng]}
            zoom={14}
            className="h-full w-full"
            zoomControl={true}
          >
            <FitBoundsOnMount center={center} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <DraggableMarker center={center} onCenterChange={handleCenterChange} />
            <Circle
              center={[center.lat, center.lng]}
              radius={radius}
              pathOptions={{
                color: '#292524',
                fillColor: '#292524',
                fillOpacity: 0.08,
                weight: 2,
                dashArray: '6 4',
              }}
            />
          </MapContainer>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <p className="w-full text-sm font-medium text-stone-500 sm:w-auto">
          Radio de búsqueda:
        </p>
        {RADIUS_OPTIONS.map((opt) => (
          <motion.button
            key={opt.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => setRadius(opt.value)}
            className={cn(
              'rounded-xl border-2 px-4 py-2 text-sm font-medium shadow-sm transition-all',
              radius === opt.value
                ? 'border-stone-900 bg-stone-100 text-stone-900'
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:shadow-md',
            )}
          >
            {opt.label}
          </motion.button>
        ))}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleUseMyLocation}
          disabled={geoLoading}
          className="ml-auto inline-flex items-center gap-2 rounded-xl border-2 border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 shadow-sm transition-all hover:border-stone-300 hover:shadow-md disabled:opacity-50"
        >
          <Crosshair className={cn('h-4 w-4', geoLoading && 'animate-spin')} />
          {geoLoading ? 'Buscando...' : 'Usar mi ubicación'}
        </motion.button>
      </div>

      {geoError && (
        <p className="text-sm text-red-400">{geoError}</p>
      )}

      <p className="text-xs text-stone-400">
        Toca el mapa para mover el marcador, o arrastra el marcador a la posición deseada.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSkip}
          className="flex-1 rounded-2xl border-2 border-dashed border-stone-300 py-4 text-base font-medium text-stone-500 transition-all hover:border-stone-400 hover:text-stone-700 sm:py-4 sm:text-lg"
        >
          En cualquier zona
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleConfirm}
          className="flex-1 rounded-2xl bg-stone-800 py-4 text-base font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700 sm:py-4 sm:text-lg"
        >
          Ver resultados
        </motion.button>
      </div>
    </div>
  )
}

export default QuestionLocationInner
