'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, Maximize2, UtensilsCrossed, X } from 'lucide-react'

interface PhotoCarouselProps {
  photos?: string[] | null
  name: string
  className?: string
  showArrows?: boolean
}

const SWIPE_THRESHOLD = 50
const MAX_DRAG_OFFSET = 120

export default function PhotoCarousel({ photos, name, className = '', showArrows = false }: PhotoCarouselProps) {
  const t = useTranslations('PhotoCarousel')
  const list = (photos ?? []).filter(Boolean)
  const count = list.length

  const [index, setIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [wrapJump, setWrapJump] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const dragStartX = useRef<number | null>(null)
  const wasDragged = useRef(false)

  const showControls = count > 1

  useEffect(() => {
    if (!fullscreen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [fullscreen])

  if (count === 0) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-stone-100 ${className}`}>
        <UtensilsCrossed className="h-8 w-8 text-stone-300 sm:h-10 sm:w-10" />
      </div>
    )
  }

  function paginate(d: 1 | -1) {
    const next = index + d
    if (next < 0 || next >= count) {
      jumpTo(next < 0 ? count - 1 : 0)
    } else {
      setIndex(next)
      setDragOffset(0)
    }
  }

  function jumpTo(i: number) {
    setWrapJump(true)
    setIndex(i)
    setDragOffset(0)
    requestAnimationFrame(() => setWrapJump(false))
  }

  function goTo(i: number) {
    if (i === index) {
      setDragOffset(0)
      return
    }
    if (Math.abs(i - index) === 1) {
      setIndex(i)
      setDragOffset(0)
    } else {
      jumpTo(i)
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!showControls) return
    dragStartX.current = e.clientX
    wasDragged.current = false
    setDragging(true)
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (dragStartX.current == null) return
    const dx = e.clientX - dragStartX.current
    if (Math.abs(dx) > 8) wasDragged.current = true
    const clamped = Math.max(-MAX_DRAG_OFFSET, Math.min(MAX_DRAG_OFFSET, dx))
    setDragOffset(clamped)
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (dragStartX.current == null) return
    const dx = e.clientX - dragStartX.current
    dragStartX.current = null
    setDragging(false)
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      paginate(dx < 0 ? 1 : -1)
    } else {
      setDragOffset(0)
    }
  }

  function onPointerCancel() {
    if (dragStartX.current == null) return
    dragStartX.current = null
    setDragging(false)
    setDragOffset(0)
    wasDragged.current = false
  }

  function onPointerLeave() {
    if (dragStartX.current == null) return
    dragStartX.current = null
    setDragging(false)
    setDragOffset(0)
  }

  function onClickCapture(e: React.MouseEvent<HTMLDivElement>) {
    if (wasDragged.current) {
      e.stopPropagation()
      e.preventDefault()
      wasDragged.current = false
    }
  }

  return (
    <div
      data-testid="photo-carousel"
      className={`relative h-full w-full touch-pan-y select-none overflow-hidden bg-stone-100 ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerLeave={onPointerLeave}
      onClickCapture={onClickCapture}
    >
      <div
        className="flex h-full w-full"
        style={{
          transform: `translateX(calc(${-index * 100}% + ${dragOffset}px))`,
          transition: dragging || wrapJump
            ? 'none'
            : 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {list.map((src, i) => (
          <div key={src} className="h-full w-full shrink-0" aria-hidden={i !== index}>
            <img
              src={src}
              alt={t('photoLabel', { n: i + 1 })}
              title={name}
              draggable={false}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label={t('openFullscreen')}
        onClick={(e) => {
          e.stopPropagation()
          setFullscreen(true)
        }}
        className="absolute right-2 top-2 rounded-full bg-black/40 p-1.5 text-white shadow-md backdrop-blur-md transition-all hover:bg-black/60 hover:scale-105 active:scale-90"
      >
        <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {showControls && (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/30 to-transparent" />

          {showArrows && (
            <>
              <button
                type="button"
                aria-label={t('previous')}
                onClick={(e) => {
                  e.stopPropagation()
                  paginate(-1)
                }}
                className="absolute left-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/40 p-1.5 text-white shadow-md backdrop-blur-md transition-all hover:bg-black/60 hover:scale-105 active:scale-90 sm:flex sm:p-2"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                type="button"
                aria-label={t('next')}
                onClick={(e) => {
                  e.stopPropagation()
                  paginate(1)
                }}
                className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/40 p-1.5 text-white shadow-md backdrop-blur-md transition-all hover:bg-black/60 hover:scale-105 active:scale-90 sm:flex sm:p-2"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </>
          )}

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {list.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={t('photoLabel', { n: i + 1 })}
                onClick={(e) => {
                  e.stopPropagation()
                  goTo(i)
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/90'
                }`}
              />
            ))}
          </div>

          <span className="absolute bottom-2 right-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
            {index + 1} / {count}
          </span>
        </>
      )}

      {fullscreen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={name}
            className="fixed inset-0 z-50 touch-pan-y select-none bg-black/95"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onPointerLeave={onPointerLeave}
            onClickCapture={onClickCapture}
          >
            <div
              className="flex h-full w-full"
              style={{
                transform: `translateX(calc(${-index * 100}% + ${dragOffset}px))`,
                transition: dragging || wrapJump
                  ? 'none'
                  : 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {list.map((src, i) => (
                <div key={src} className="h-full w-full shrink-0" aria-hidden={i !== index}>
                  <img
                    src={src}
                    alt={t('photoLabel', { n: i + 1 })}
                    title={name}
                    draggable={false}
                    className="h-full w-full object-contain"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              aria-label={t('closeFullscreen')}
              onClick={(e) => {
                e.stopPropagation()
                setFullscreen(false)
              }}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition-all hover:bg-white/20"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {showControls && (
              <>
                <button
                  type="button"
                  aria-label={t('previous')}
                  onClick={(e) => {
                    e.stopPropagation()
                    paginate(-1)
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white shadow-md backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-90 sm:p-2.5"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <button
                  type="button"
                  aria-label={t('next')}
                  onClick={(e) => {
                    e.stopPropagation()
                    paginate(1)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white shadow-md backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-90 sm:p-2.5"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </>
            )}

            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              {index + 1} / {count}
            </span>

            {showControls && (
              <div className="absolute bottom-16 left-1/2 flex -translate-x-1/2 items-center gap-2">
                {list.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={t('photoLabel', { n: i + 1 })}
                    onClick={(e) => {
                      e.stopPropagation()
                      goTo(i)
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  )
}
