import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'DimeSitio — Elige restaurante en 60 segundos'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const [fontData, imageSrc] = await Promise.all([
    readFile(join(process.cwd(), 'node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf')),
    fetchImageAsDataUri(),
  ])

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative' }}>
        {imageSrc && (
          <img
            src={imageSrc}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.15))',
          }}
        />
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: 100,
              fontWeight: 700,
              color: '#fafaf9',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            DimeSitio
          </span>
          <span
            style={{
              fontSize: 38,
              color: '#e7e5e4',
              marginTop: 20,
              lineHeight: 1.3,
            }}
          >
            Elige restaurante en 60 segundos
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginTop: 48,
            }}
          >
            {['Rápido', 'Gratis', 'Sin registrarte'].map((label) => (
              <span
                key={label}
                style={{
                  fontSize: 24,
                  color: '#d6d3d1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="4" fill="#d6d3d1" />
                </svg>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Geist',
          data: fontData,
          style: 'normal',
          weight: 400,
        },
      ],
    },
  )
}

async function fetchImageAsDataUri(): Promise<string | null> {
  try {
    const res = await fetch(
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&h=630&fit=crop&auto=format&q=75',
    )
    if (!res.ok) return null
    const buffer = await res.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return `data:image/jpeg;base64,${base64}`
  } catch {
    return null
  }
}
