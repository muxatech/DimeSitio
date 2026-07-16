'use client'

const STRINGS = {
  es: {
    criticalError: 'Error crítico',
    cannotLoadApp: 'No se ha podido cargar la aplicación. Prueba a recargar la página.',
    backHome: 'Volver al inicio',
    reloadPage: 'Recargar página',
  },
  en: {
    criticalError: 'Critical error',
    cannotLoadApp: 'Could not load the application. Try reloading the page.',
    backHome: 'Back to home',
    reloadPage: 'Reload page',
  },
}

function getLocale(): 'es' | 'en' {
  if (typeof window === 'undefined') return 'es'
  const lang = document.documentElement.lang || navigator.language || 'es'
  return lang.startsWith('en') ? 'en' : 'es'
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = STRINGS[getLocale()]

  return (
    <html lang={getLocale()}>
      <body style={{
        margin: 0,
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '0 24px',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        color: '#1c1917',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}>
        <div style={{
          display: 'flex',
          height: '64px',
          width: '64px',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '16px',
          backgroundColor: '#f5f5f4',
        }}>
          <span style={{ fontSize: '24px' }}>!</span>
        </div>
        <div style={{ maxWidth: '320px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#1c1917' }}>
            {t.criticalError}
          </h2>
          <p style={{ marginTop: '8px', fontSize: '14px', color: '#78716c', lineHeight: 1.5 }}>
            {t.cannotLoadApp}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => { window.location.href = '/' }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '12px',
              border: '1px solid #e7e5e4',
              backgroundColor: '#ffffff',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#44403c',
              cursor: 'pointer',
            }}
          >
            {t.backHome}
          </button>
          <button
            onClick={() => reset()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#292524',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#fafaf9',
              cursor: 'pointer',
            }}
          >
            {t.reloadPage}
          </button>
        </div>
      </body>
    </html>
  )
}
