import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'DimeSitio — Encuentra dónde comer en Valencia'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const fontData = await readFile(
    join(process.cwd(), 'node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf'),
  )

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&h=630&fit=crop&auto=format&q=75"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
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
              fontSize: 80,
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
              fontSize: 32,
              color: '#e7e5e4',
              marginTop: 16,
              lineHeight: 1.3,
            }}
          >
            Encuentra dónde comer en Valencia
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 40,
            }}
          >
            {['Rápido', 'Gratis', 'Sin registrarte'].map((label) => (
              <span
                key={label}
                style={{
                  fontSize: 20,
                  color: '#d6d3d1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <svg width="6" height="6" viewBox="0 0 6 6">
                  <circle cx="3" cy="3" r="3" fill="#d6d3d1" />
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
