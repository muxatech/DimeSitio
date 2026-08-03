import { describe, it, expect } from 'vitest'
import { getImageExt, isAllowedImage, MAX_PHOTOS, MAX_OUTPUT_BYTES } from '@/lib/photos'

function makeFile(type: string): File {
  return new File(['fake'], `image.${type.split('/')[1]}`, { type })
}

describe('lib/photos', () => {
  it('exposes the photo limits', () => {
    expect(MAX_PHOTOS).toBe(8)
    expect(MAX_OUTPUT_BYTES).toBe(1024 * 1024)
  })

  it('detects supported extensions by mime type', () => {
    expect(getImageExt(makeFile('image/webp'))).toBe('webp')
    expect(getImageExt(makeFile('image/jpeg'))).toBe('jpeg')
    expect(getImageExt(makeFile('image/png'))).toBe('png')
    expect(getImageExt(makeFile('image/gif'))).toBeNull()
    expect(getImageExt(makeFile('image/svg+xml'))).toBeNull()
  })

  it('accepts only jpeg, png and webp files', () => {
    expect(isAllowedImage(makeFile('image/webp'))).toBe(true)
    expect(isAllowedImage(makeFile('image/jpeg'))).toBe(true)
    expect(isAllowedImage(makeFile('image/png'))).toBe(true)
    expect(isAllowedImage(makeFile('image/gif'))).toBe(false)
    expect(isAllowedImage(makeFile('image/svg+xml'))).toBe(false)
    expect(isAllowedImage(makeFile('application/pdf'))).toBe(false)
  })
})
