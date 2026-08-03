export const MAX_PHOTOS = 8
export const MAX_OUTPUT_BYTES = 1024 * 1024
const MAX_DIMENSION = 1600
const OUTPUT_QUALITY = 0.82

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

export interface CompressedImage {
  blob: Blob
  ext: 'webp' | 'jpeg'
  width: number
  height: number
}

export function getImageExt(file: File): 'webp' | 'jpeg' | 'png' | null {
  if (file.type === 'image/webp') return 'webp'
  if (file.type === 'image/jpeg') return 'jpeg'
  if (file.type === 'image/png') return 'png'
  return null
}

export function isAllowedImage(file: File): boolean {
  return ALLOWED_MIME.has(file.type)
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Invalid image'))
    }
    img.src = url
  })
}

function toBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, mime, quality))
}

export async function compressImage(file: File): Promise<CompressedImage> {
  const img = await loadImage(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight))
  const width = Math.max(1, Math.round(img.naturalWidth * scale))
  const height = Math.max(1, Math.round(img.naturalHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.drawImage(img, 0, 0, width, height)

  const canWebp = canvas.toDataURL('image/webp').startsWith('data:image/webp')
  const mime = canWebp ? 'image/webp' : 'image/jpeg'
  const ext = canWebp ? 'webp' : 'jpeg'

  let quality = OUTPUT_QUALITY
  let blob = await toBlob(canvas, mime, quality)
  while (blob && blob.size > MAX_OUTPUT_BYTES && quality > 0.4) {
    quality -= 0.15
    blob = await toBlob(canvas, mime, quality)
  }
  if (!blob) throw new Error('Failed to compress image')

  return { blob, ext, width, height }
}
