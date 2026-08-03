'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { getUploadUrls, getDeleteUrls } from '@/lib/panel/api'
import { compressImage, getImageExt, isAllowedImage, MAX_PHOTOS } from '@/lib/photos'

function extractKey(publicUrl: string): string | null {
  const match = publicUrl.match(/(restaurants\/.+)$/)
  return match ? match[1] : null
}

export default function PhotoUploader({
  photos,
  onChange,
}: {
  photos: string[]
  onChange: (next: string[]) => void
}) {
  const t = useTranslations('RestaurantForm')
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFiles(files: FileList | null) {
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

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
        {photos.map((photo, i) => (
          <div
            key={photo}
            className="relative aspect-square overflow-hidden rounded-2xl border border-stone-200 bg-stone-100"
          >
            <img
              src={photo}
              alt={t('photoAlt', { n: i + 1 })}
              className="h-full w-full object-cover"
            />
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
      {photos.length > 0 && (
        <p className="mt-1.5 text-xs text-stone-400">
          {t('photosHint', { count: photos.length, max: MAX_PHOTOS })}
        </p>
      )}
      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
    </div>
  )
}
