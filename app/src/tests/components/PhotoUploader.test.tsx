import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PhotoUploader from '@/components/photo-uploader'
import { TestWrapper } from '@/tests/helpers'

vi.mock('@/lib/panel/api', () => ({
  getUploadUrls: vi.fn(async () => [
    { key: 'restaurants/x.webp', uploadUrl: 'https://upload.example/x', publicUrl: 'https://r2.example/restaurants/x.webp' },
  ]),
  getDeleteUrls: vi.fn(async () => [
    { key: 'restaurants/x.webp', deleteUrl: 'https://delete.example/x' },
  ]),
}))

vi.mock('@/lib/photos', () => ({
  MAX_PHOTOS: 8,
  compressImage: vi.fn(async () => ({
    blob: new Blob(['fake'], { type: 'image/webp' }),
    ext: 'webp',
    width: 10,
    height: 10,
  })),
  getImageExt: vi.fn(() => 'webp'),
  isAllowedImage: vi.fn(() => true),
}))

import { getUploadUrls } from '@/lib/panel/api'

const photos = [
  'https://r2.example/restaurants/a.webp',
  'https://r2.example/restaurants/b.webp',
  'https://r2.example/restaurants/c.webp',
]

function createDataTransfer() {
  const store = new Map<string, string>()
  const dt = {
    types: [] as string[],
    effectAllowed: 'all',
    dropEffect: 'move',
    files: [] as File[],
    setData: (type: string, value: string) => {
      store.set(type, value)
      if (!dt.types.includes(type)) dt.types.push(type)
    },
    getData: (type: string) => store.get(type) ?? '',
  }
  return dt
}

describe('PhotoUploader', () => {
  beforeEach(() => {
    vi.mocked(getUploadUrls).mockClear()
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true })))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the carousel preview with fullscreen option when there are photos', () => {
    render(<PhotoUploader photos={photos} onChange={vi.fn()} name="Resto" />, { wrapper: TestWrapper })
    expect(screen.getByRole('button', { name: 'Ver fotos en grande' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Añadir fotos' })).toBeInTheDocument()
  })

  it('shows thumbnails with remove buttons and a reorder hint', () => {
    render(<PhotoUploader photos={photos} onChange={vi.fn()} name="Resto" />, { wrapper: TestWrapper })
    expect(screen.getByText(/arrastra las fotos para ordenarlas/i)).toBeInTheDocument()
    const removeButtons = screen.getAllByRole('button', { name: 'Quitar foto' })
    expect(removeButtons).toHaveLength(3)
  })

  it('reorders photos when dragging a thumbnail over another', () => {
    const onChange = vi.fn()
    render(<PhotoUploader photos={photos} onChange={onChange} name="Resto" />, { wrapper: TestWrapper })

    const dt = createDataTransfer()
    fireEvent.dragStart(screen.getByTestId('photo-thumb-0'), { dataTransfer: dt })
    fireEvent.dragOver(screen.getByTestId('photo-thumb-2'), { dataTransfer: dt })
    fireEvent.drop(screen.getByTestId('photo-thumb-2'), { dataTransfer: dt })
    fireEvent.dragEnd(screen.getByTestId('photo-thumb-0'), { dataTransfer: dt })

    expect(onChange).toHaveBeenCalledWith([
      photos[1],
      photos[2],
      photos[0],
    ])
  })

  it('removes a photo when clicking the remove button', () => {
    const onChange = vi.fn()
    render(<PhotoUploader photos={photos} onChange={onChange} name="Resto" />, { wrapper: TestWrapper })
    fireEvent.click(screen.getAllByRole('button', { name: 'Quitar foto' })[0])
    expect(onChange).toHaveBeenCalledWith([photos[1], photos[2]])
  })

  it('uploads dropped files and appends the public url', async () => {
    const onChange = vi.fn()
    render(<PhotoUploader photos={[]} onChange={onChange} name="Resto" />, { wrapper: TestWrapper })

    const dt = createDataTransfer()
    dt.files = [new File(['data'], 'foto.jpg', { type: 'image/jpeg' })]
    ;(dt.types as string[]).push('Files')

    const dropzone = screen.getByTestId('photo-uploader-dropzone')
    fireEvent.dragOver(dropzone, { dataTransfer: dt })
    fireEvent.drop(dropzone, { dataTransfer: dt })

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(['https://r2.example/restaurants/x.webp'])
    })
  })

  it('keeps the hidden file input with multiple selection for click uploads', () => {
    const { container } = render(<PhotoUploader photos={[]} onChange={vi.fn()} name="Resto" />, { wrapper: TestWrapper })
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toHaveAttribute('multiple')
    expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp')
    expect(screen.getByText(/arrastra y suelta fotos/i)).toBeInTheDocument()
  })
})
