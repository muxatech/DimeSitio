'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { UtensilsCrossed } from 'lucide-react'

interface PhotoCarouselProps {
  photos?: string[] | null
  name: string
  className?: string
}

const SWIPE_THRESHOLD = 50
const MAX_DRAG_OFFSET = 120

export default function PhotoCarousel({ photos, name, className = '' }: PhotoCarouselProps) {
  const t = useTranslations('PhotoCarousel')
  const list = (photos ?? []).filter(Boolean)
  const count = list.length

  const [index, setIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [wrapJump, setWrapJump] = useState(false)

  const dragStartX = useRef<number | null>(null)
  const wasDragged = useRef(false)

  const showControls = count > 1

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
    if (typeof e.currentTarget.setPointerCapture === 'function') {
      e.currentTarget.setPointerCapture(e.pointerId)
    }
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

      {showControls && (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/30 to-transparent" />

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
    </div>
  )
}
