'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { GripVertical, ImagePlus, Loader2, X } from 'lucide-react'
import { getUploadUrls, getDeleteUrls } from '@/lib/panel/api'
import { compressImage, getImageExt, isAllowedImage, MAX_PHOTOS } from '@/lib/photos'
import PhotoCarousel from '@/components/photo-carousel'

const REORDER_TYPE = 'application/x-dimesitio-photo'

function extractKey(publicUrl: string): string | null {
  const match = publicUrl.match(/(restaurants\/.+)$/)
  return match ? match[1] : null
}

function hasFiles(e: { dataTransfer: DataTransfer | null }): boolean {
  return !!e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')
}

function isReorderDrag(e: { dataTransfer: DataTransfer | null }): boolean {
  return !!e.dataTransfer && Array.from(e.dataTransfer.types).includes(REORDER_TYPE)
}

export default function PhotoUploader({
  photos,
  onChange,
  name = '',
}: {
  photos: string[]
  onChange: (next: string[]) => void
  name?: string
}) {
  const t = useTranslations('RestaurantForm')
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dropActive, setDropActive] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropTarget, setDropTarget] = useState<number | null>(null)

  async function handleFiles(files: FileList | File[] | null) {
    if (!files || files.length === 0) return
    setError('')

    const selected = Array.from(files).slice(0, Math.max(0, MAX_PHOTOS - photos.length))
    if (selected.length === 0) {
      setError(t('photosLimit', { max: MAX_PHOTOS }))
      return
    }

    let next = [...photos]
    for (const file of selected) {
      if (!isAllowedImage(file)) {
        setError(t('photoInvalid'))
        continue
      }
      const ext = getImageExt(file)
      if (!ext) continue

      setUploading(true)
      try {
        const compressed = await compressImage(file)
        const [item] = await getUploadUrls([{ ext: compressed.ext }])
        if (!item) throw new Error(t('uploadFailed'))

        const putRes = await fetch(item.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': compressed.blob.type,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
          body: compressed.blob,
        })
        if (!putRes.ok) throw new Error(t('uploadFailed'))

        next = [...next, item.publicUrl]
        onChange(next)
      } catch (e) {
        setError(e instanceof Error ? e.message : t('uploadFailed'))
      } finally {
        setUploading(false)
      }
    }

    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleRemove(publicUrl: string) {
    const index = photos.indexOf(publicUrl)
    if (index === -1) return
    onChange(photos.filter((_, i) => i !== index))

    const key = extractKey(publicUrl)
    if (!key) return
    try {
      const [item] = await getDeleteUrls([key])
      if (item) await fetch(item.deleteUrl, { method: 'DELETE' })
    } catch {
      // Best effort: the object is orphaned, the next full cleanup can remove it
    }
  }

  function handleReorder(from: number, to: number) {
    if (from === to) return
    const next = [...photos]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
  }

  function resetDrag() {
    setDragIndex(null)
    setDropTarget(null)
  }

  function handleDragStart(e: React.DragEvent<HTMLDivElement>, i: number) {
    if ((e.target as HTMLElement).closest('button')) {
      e.preventDefault()
      return
    }
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData(REORDER_TYPE, String(i))
    setDragIndex(i)
  }

  function handleDragOverItem(e: React.DragEvent<HTMLDivElement>, i: number) {
    if (!isReorderDrag(e)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTarget(i)
  }

  function handleDropItem(e: React.DragEvent<HTMLDivElement>, i: number) {
    e.preventDefault()
    const from = Number(e.dataTransfer.getData(REORDER_TYPE))
    if (!Number.isNaN(from)) handleReorder(from, i)
    resetDrag()
  }

  function handleDragOverContainer(e: React.DragEvent<HTMLDivElement>) {
    if (!hasFiles(e)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setDropActive(true)
  }

  function handleDragLeaveContainer(e: React.DragEvent<HTMLDivElement>) {
    if (!hasFiles(e)) return
    const related = e.relatedTarget as Node | null
    if (related && e.currentTarget.contains(related)) return
    setDropActive(false)
  }

  function handleDropContainer(e: React.DragEvent<HTMLDivElement>) {
    if (!hasFiles(e)) return
    e.preventDefault()
    setDropActive(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div>
      {photos.length > 0 && (
        <div className="mb-3 overflow-hidden rounded-2xl bg-stone-100">
          <div className="relative h-52 sm:h-64">
            <PhotoCarousel photos={photos} name={name} showArrows />
          </div>
        </div>
      )}

      <div
        data-testid="photo-uploader-dropzone"
        className={`relative rounded-2xl transition-colors ${
          dropActive ? 'bg-stone-50 ring-2 ring-stone-900 ring-offset-2' : ''
        }`}
        onDragOver={handleDragOverContainer}
        onDragLeave={handleDragLeaveContainer}
        onDrop={handleDropContainer}
      >
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
          {photos.map((photo, i) => (
            <div
              key={photo}
              data-testid={`photo-thumb-${i}`}
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={(e) => handleDragOverItem(e, i)}
              onDrop={(e) => handleDropItem(e, i)}
              onDragEnd={resetDrag}
              className={`relative aspect-square cursor-grab overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 transition-all ${
                dragIndex === i ? 'opacity-40' : ''
              } ${dropTarget === i ? 'ring-2 ring-stone-900 ring-offset-2' : ''}`}
            >
              <img
                src={photo}
                alt={t('photoAlt', { n: i + 1 })}
                draggable={false}
                className="h-full w-full object-cover"
              />
              <span className="absolute left-1 top-1 rounded-md bg-black/40 p-0.5 text-white">
                <GripVertical className="h-3.5 w-3.5" />
              </span>
              <button
                type="button"
                aria-label={t('removePhoto')}
                onClick={() => handleRemove(photo)}
                className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white shadow-sm transition-colors hover:bg-black/70"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              aria-label={t('addPhotos')}
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-stone-300 text-stone-400 shadow-sm transition-all hover:border-stone-400 hover:text-stone-600 disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <ImagePlus className="h-6 w-6" />
              )}
              <span className="px-1 text-center text-xs leading-tight">
                {uploading ? t('uploadingPhoto') : t('addPhotos')}
              </span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {dropActive && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-2xl bg-white/80">
            <ImagePlus className="h-7 w-7 text-stone-700" />
            <p className="text-sm font-medium text-stone-700">{t('dropPhotos')}</p>
          </div>
        )}
      </div>

      {photos.length > 0 && (
        <p className="mt-1.5 text-xs text-stone-400">
          {t('photosHint', { count: photos.length, max: MAX_PHOTOS })} · {t('photosReorderHint')}
        </p>
      )}
      {photos.length === 0 && (
        <p className="mt-1.5 text-xs text-stone-400">{t('photosDropHint')}</p>
      )}
      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
    </div>
  )
}
