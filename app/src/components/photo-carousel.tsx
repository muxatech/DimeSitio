'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, UtensilsCrossed } from 'lucide-react'

interface PhotoCarouselProps {
  photos?: string[] | null
  name: string
  className?: string
}

export default function PhotoCarousel({ photos, name, className = '' }: PhotoCarouselProps) {
  const t = useTranslations('PhotoCarousel')
  const list = (photos ?? []).filter(Boolean)
  const [index, setIndex] = useState(0)
  const count = list.length
  const safeIndex = count === 0 ? 0 : Math.min(index, count - 1)
  const showControls = count > 1

  if (count === 0) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-stone-100 ${className}`}>
        <UtensilsCrossed className="h-8 w-8 text-stone-300 sm:h-10 sm:w-10" />
      </div>
    )
  }

  function go(dir: 1 | -1) {
    setIndex((i) => (i + dir + count) % count)
  }

  return (
    <div className={`relative h-full w-full overflow-hidden bg-stone-100 ${className}`}>
      <img
        key={list[safeIndex]}
        src={list[safeIndex]}
        alt={t('photoLabel', { n: safeIndex + 1 })}
        className="h-full w-full object-cover"
      />
      {showControls && (
        <>
          <button
            type="button"
            aria-label={t('previous')}
            onClick={(e) => {
              e.stopPropagation()
              go(-1)
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white shadow-md transition-all hover:bg-black/60 sm:p-2"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            type="button"
            aria-label={t('next')}
            onClick={(e) => {
              e.stopPropagation()
              go(1)
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white shadow-md transition-all hover:bg-black/60 sm:p-2"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1">
            {list.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={t('photoLabel', { n: i + 1 })}
                onClick={(e) => {
                  e.stopPropagation()
                  setIndex(i)
                }}
                className={`h-1.5 rounded-full transition-all ${i === safeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
