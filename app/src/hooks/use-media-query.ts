'use client'

import { useEffect, useLayoutEffect, useState } from 'react'

// En servidor no hay layout que sincronizar: useLayoutEffect no debe correr allí.
// `useEffect` se usa como equivalente para que React no avise en el render de SSR.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Suscripción a una media query de CSS. Devuelve `false` durante el render
 * inicial en servidor y en el primer render del cliente, y el valor real a
 * partir del efecto.
 *
 * El efecto es un *layout* effect a propósito: si fuera un efecto normal, el
 * navegador pintaría un frame con el valor conservador (`false`) y las
 * animaciones que dependen de él —la hoja inferior de la ficha— darían un salto
 * visible antes de corregirse. Los componentes siguen teniendo que asumir `false`
 * en ese primer render para que el HTML de servidor coincida.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** `true` en móvil: por debajo del breakpoint `lg` con el que la batalla cambia de layout. */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 1023px)')
}