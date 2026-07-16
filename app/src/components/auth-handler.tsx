'use client'

import { useEffect } from 'react'
import { stripLocalePrefix } from '@/lib/utils'

export default function AuthHandler() {
  useEffect(() => {
    const hash = window.location.hash
    if (!hash || !hash.includes('access_token')) return
    const pathname = stripLocalePrefix(window.location.pathname)
    if (pathname.startsWith('/auth/invite')) return

    window.location.replace('/auth/invite' + hash)
  }, [])

  return null
}
