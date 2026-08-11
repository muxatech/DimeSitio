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

import { getUploadUrls, getDeleteUrls } from '@/lib/panel/api'
import { isAllowedImage, MAX_PHOTOS } from '@/lib/photos'

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

// jsdom does not propagate `clientX` through fireEvent.drop/dragOver init,
// so we dispatch a real MouseEvent with clientX injected.
function fireDrag(
  el: Element,
  type: string,
  dt: ReturnType<typeof createDataTransfer>,
  clientX?: number
) {
  const evt = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    ...(clientX !== undefined ? { clientX } : {}),
  })
  Object.defineProperty(evt, 'dataTransfer', { value: dt })
  fireEvent(el, evt)
}

describe('PhotoUploader', () => {
  beforeEach(() => {
    vi.mocked(getUploadUrls).mockClear()
    vi.mocked(getDeleteUrls).mockClear()
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true })))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('shows thumbnails with remove buttons and a reorder hint', () => {
    render(<PhotoUploader photos={photos} onChange={vi.fn()} />, { wrapper: TestWrapper })
    expect(screen.getByText(/arrastra las fotos para ordenarlas/i)).toBeInTheDocument()
    const removeButtons = screen.getAllByRole('button', { name: 'Quitar foto' })
    expect(removeButtons).toHaveLength(3)
  })

  it('reorders photos when dragging a thumbnail over another', () => {
    const onChange = vi.fn()
    render(<PhotoUploader photos={photos} onChange={onChange} />, { wrapper: TestWrapper })

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

  it('shows the insertion indicator between thumbnails while dragging', () => {
    render(<PhotoUploader photos={photos} onChange={vi.fn()} />, { wrapper: TestWrapper })

    const dt = createDataTransfer()
    fireEvent.dragStart(screen.getByTestId('photo-thumb-0'), { dataTransfer: dt })
    fireEvent.dragOver(screen.getByTestId('photo-thumb-1'), { dataTransfer: dt })

    expect(screen.getByTestId('photo-drop-indicator')).toBeInTheDocument()
  })

  it('removes a photo when clicking the remove button', () => {
    const onChange = vi.fn()
    render(<PhotoUploader photos={photos} onChange={onChange} />, { wrapper: TestWrapper })
    fireEvent.click(screen.getAllByRole('button', { name: 'Quitar foto' })[0])
    expect(onChange).toHaveBeenCalledWith([photos[1], photos[2]])
  })

  it('uploads dropped files and appends the public url', async () => {
    const onChange = vi.fn()
    render(<PhotoUploader photos={[]} onChange={onChange} />, { wrapper: TestWrapper })

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

  it('shows photosLimit error when dropping more photos than the remaining slots', async () => {
    const fullPhotos = Array.from(
      { length: MAX_PHOTOS },
      (_, i) => `https://r2.example/restaurants/${i}.webp`
    )
    render(<PhotoUploader photos={fullPhotos} onChange={vi.fn()} />, { wrapper: TestWrapper })

    const dt = createDataTransfer()
    dt.files = [new File(['data'], 'foto.jpg', { type: 'image/jpeg' })]
    ;(dt.types as string[]).push('Files')

    fireEvent.drop(screen.getByTestId('photo-uploader-dropzone'), { dataTransfer: dt })

    expect(await screen.findByText('Máximo 8 fotos')).toBeInTheDocument()
  })

  it('shows photoInvalid error for unsupported file types', async () => {
    vi.mocked(isAllowedImage).mockReturnValueOnce(false)
    const onChange = vi.fn()
    render(<PhotoUploader photos={[]} onChange={onChange} />, { wrapper: TestWrapper })

    const dt = createDataTransfer()
    dt.files = [new File(['data'], 'foto.gif', { type: 'image/gif' })]
    ;(dt.types as string[]).push('Files')

    fireEvent.drop(screen.getByTestId('photo-uploader-dropzone'), { dataTransfer: dt })

    expect(await screen.findByText('Formato no válido. Usa JPG, PNG o WebP')).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows uploadFailed error when the PUT upload fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })))
    const onChange = vi.fn()
    render(<PhotoUploader photos={[]} onChange={onChange} />, { wrapper: TestWrapper })

    const dt = createDataTransfer()
    dt.files = [new File(['data'], 'foto.jpg', { type: 'image/jpeg' })]
    ;(dt.types as string[]).push('Files')

    fireEvent.drop(screen.getByTestId('photo-uploader-dropzone'), { dataTransfer: dt })

    expect(await screen.findByText('Error al subir la foto')).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('inserts before the target when dropping on the left half of a thumbnail', () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 100, right: 300, top: 0, bottom: 200, width: 200, height: 200, x: 100, y: 0,
      toJSON: () => ({}),
    } as DOMRect)
    const onChange = vi.fn()
    render(<PhotoUploader photos={photos} onChange={onChange} />, { wrapper: TestWrapper })

    const dt = createDataTransfer()
    fireEvent.dragStart(screen.getByTestId('photo-thumb-2'), { dataTransfer: dt })
    fireDrag(screen.getByTestId('photo-thumb-1'), 'dragover', dt, 150)
    fireDrag(screen.getByTestId('photo-thumb-1'), 'drop', dt, 150)
    fireEvent.dragEnd(screen.getByTestId('photo-thumb-2'), { dataTransfer: dt })

    expect(onChange).toHaveBeenCalledWith([photos[0], photos[2], photos[1]])
  })

  it('appends at the end when dropping on the dropzone container', () => {
    const onChange = vi.fn()
    render(<PhotoUploader photos={photos} onChange={onChange} />, { wrapper: TestWrapper })

    const dt = createDataTransfer()
    fireEvent.dragStart(screen.getByTestId('photo-thumb-0'), { dataTransfer: dt })
    fireEvent.dragOver(screen.getByTestId('photo-uploader-dropzone'), { dataTransfer: dt })
    fireEvent.drop(screen.getByTestId('photo-uploader-dropzone'), { dataTransfer: dt })
    fireEvent.dragEnd(screen.getByTestId('photo-thumb-0'), { dataTransfer: dt })

    expect(onChange).toHaveBeenCalledWith([photos[1], photos[2], photos[0]])
  })

  it('calls getDeleteUrls when removing a photo', async () => {
    const onChange = vi.fn()
    render(<PhotoUploader photos={photos} onChange={onChange} />, { wrapper: TestWrapper })
    fireEvent.click(screen.getAllByRole('button', { name: 'Quitar foto' })[0])
    expect(onChange).toHaveBeenCalledWith([photos[1], photos[2]])
    await waitFor(() => {
      expect(getDeleteUrls).toHaveBeenCalledWith(['restaurants/a.webp'])
    })
  })

  it('does not start a reorder drag from the remove button', () => {
    render(<PhotoUploader photos={photos} onChange={vi.fn()} />, { wrapper: TestWrapper })
    const dt = createDataTransfer()
    fireEvent.dragStart(screen.getAllByRole('button', { name: 'Quitar foto' })[0], { dataTransfer: dt })
    expect(dt.types).not.toContain('application/x-dimesitio-photo')
    expect(screen.queryByTestId('photo-drop-indicator')).not.toBeInTheDocument()
  })

  it('keeps the hidden file input with multiple selection for click uploads', () => {
    const { container } = render(<PhotoUploader photos={[]} onChange={vi.fn()} />, { wrapper: TestWrapper })
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toHaveAttribute('multiple')
    expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp')
    expect(screen.getByText(/arrastra y suelta fotos/i)).toBeInTheDocument()
  })
})
