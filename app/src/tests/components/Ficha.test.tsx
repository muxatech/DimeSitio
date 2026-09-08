import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UUID_RE } from '@/app/[locale]/sitio/[id]/page'

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))

vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    getAll: () => [],
    set: () => {},
  }),
}))

vi.mock('@/components/photo-carousel', () => ({
  default: ({ photos, name }: { photos: string[]; name: string }) => (
    <div data-testid="photo-carousel" data-name={name}>
      {photos?.map((p: string) => <img key={p} src={p} alt={name} />)}
    </div>
  ),
}))

vi.mock('@/lib/tracking', () => ({
  trackPageView: vi.fn(),
  trackFlowStart: vi.fn(),
  trackQuestionView: vi.fn(),
  trackImpressions: vi.fn(),
  trackSelection: vi.fn(),
  trackCall: vi.fn(),
  trackCta: vi.fn(),
}))

vi.mock('@/app/[locale]/sitio/[id]/sitio-cta', () => ({
  default: ({ labels }: { labels: Record<string, string> }) => (
    <div>
      {Object.values(labels).map((l: string) => (
        <span key={l}>{l}</span>
      ))}
    </div>
  ),
}))

const mockRestaurant = {
  id: '69bb3b50-1df8-4369-b285-d9018496a5a3',
  name: 'MUMA Restaurante',
  description: 'Cocina mediterránea creativa en Ciutat Vella',
  phone: '+34963123456',
  address: 'C/ de la Paz 12',
  zone: 'Ciutat Vella',
  price_level: 2,
  image_url: 'https://images.unsplash.com/photo-1',
  photos: ['https://r2.dev/restaurants/a.webp', 'https://r2.dev/restaurants/b.webp'],
  menu_url: 'https://muma.es/menu',
  reservations_url: 'https://muma.es/reservas',
  instagram_url: 'https://instagram.com/muma',
  google_maps_url: null,
  lat: 39.47,
  lng: -0.37,
  founder_rank: null,
  is_demo: null,
  active: true,
  city: 'Valencia',
  owner_id: null,
  restaurant_categories: [{ category_id: 'cat-1' }],
}

const mockSingle = vi.fn()
const mockIn = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'restaurants') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: mockSingle,
              })),
            })),
          })),
        }
      }
      if (table === 'categories') {
        return {
          select: vi.fn(() => ({
            in: mockIn,
          })),
        }
      }
      return { select: vi.fn(() => ({ eq: vi.fn(), in: vi.fn() })) }
    }),
  })),
}))

describe('Ficha - UUID_RE', () => {
  it('accepts valid UUIDv4', () => {
    expect(UUID_RE.test('69bb3b50-1df8-4369-b285-d9018496a5a3')).toBe(true)
    expect(UUID_RE.test('00000000-0000-4000-a000-000000000000')).toBe(true)
  })

  it('rejects invalid IDs', () => {
    expect(UUID_RE.test('')).toBe(false)
    expect(UUID_RE.test('123')).toBe(false)
    expect(UUID_RE.test("' OR 1=1 --")).toBe(false)
    expect(UUID_RE.test('69bb3b50-1df8-4369-b285-d9018496a5a3; DROP TABLE restaurants')).toBe(false)
    expect(UUID_RE.test('not-a-uuid')).toBe(false)
  })

  it('is case insensitive', () => {
    expect(UUID_RE.test('69BB3B50-1DF8-4369-B285-D9018496A5A3')).toBe(true)
  })
})

describe('Ficha page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSingle.mockResolvedValue({ data: mockRestaurant, error: null })
    mockIn.mockResolvedValue({ data: [{ id: 'cat-1', name: 'Mediterráneo' }] })
  })

  it('renders restaurant name, description, zone and price', async () => {
    const { default: Page } = await import('@/app/[locale]/sitio/[id]/page')
    render(await Page({ params: Promise.resolve({ locale: 'es', id: mockRestaurant.id }) }))
    expect(screen.getByText('MUMA Restaurante')).toBeInTheDocument()
    expect(screen.getByText('Cocina mediterránea creativa en Ciutat Vella')).toBeInTheDocument()
    expect(screen.getByText('Ciutat Vella')).toBeInTheDocument()
    expect(screen.getByText('€€')).toBeInTheDocument()
    expect(screen.getByText('Mediterráneo')).toBeInTheDocument()
  })

  it('renders CTA links when urls present', async () => {
    const { default: Page } = await import('@/app/[locale]/sitio/[id]/page')
    render(await Page({ params: Promise.resolve({ locale: 'es', id: mockRestaurant.id }) }))
    expect(screen.getByText('call')).toBeInTheDocument()
    expect(screen.getByText('directions')).toBeInTheDocument()
    expect(screen.getByText('viewMenu')).toBeInTheDocument()
    expect(screen.getByText('reserve')).toBeInTheDocument()
    expect(screen.getByText('viewInstagram')).toBeInTheDocument()
  })

  it('renders photo carousel when photos exist', async () => {
    const { default: Page } = await import('@/app/[locale]/sitio/[id]/page')
    render(await Page({ params: Promise.resolve({ locale: 'es', id: mockRestaurant.id }) }))
    expect(screen.getByTestId('photo-carousel')).toBeInTheDocument()
  })

  it('renders json-ld script', async () => {
    const { default: Page } = await import('@/app/[locale]/sitio/[id]/page')
    const { container } = render(await Page({ params: Promise.resolve({ locale: 'es', id: mockRestaurant.id }) }))
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).toBeInTheDocument()
    expect(script?.textContent).toContain('MUMA Restaurante')
    expect(script?.textContent).toContain('Restaurant')
  })

  it('calls notFound for invalid UUID', async () => {
    const { default: Page } = await import('@/app/[locale]/sitio/[id]/page')
    const { notFound } = await import('next/navigation')
    await expect(Page({ params: Promise.resolve({ locale: 'es', id: 'invalid-id' }) })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('calls notFound when restaurant not found or inactive', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })
    const { default: Page } = await import('@/app/[locale]/sitio/[id]/page')
    const { notFound } = await import('next/navigation')
    await expect(Page({ params: Promise.resolve({ locale: 'es', id: '00000000-0000-4000-a000-000000000000' }) })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('generateMetadata returns title and description', async () => {
    const { generateMetadata } = await import('@/app/[locale]/sitio/[id]/page')
    const meta = await generateMetadata({ params: Promise.resolve({ locale: 'es', id: mockRestaurant.id }) }) as { title: string; description: string }
    expect(meta.title).toContain('MUMA Restaurante')
    expect(meta.description).toContain('Cocina mediterránea')
  })

  it('generateMetadata returns fallback for invalid id', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })
    const { generateMetadata } = await import('@/app/[locale]/sitio/[id]/page')
    const meta = await generateMetadata({ params: Promise.resolve({ locale: 'es', id: 'invalid' }) }) as { title: string }
    expect(meta.title).toBe('Restaurante no encontrado')
  })
})
