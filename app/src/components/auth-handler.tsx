'use client'

import { useEffect } from 'react'

export default function AuthHandler() {
  useEffect(() => {
    const hash = window.location.hash
    if (!hash || !hash.includes('access_token')) return
    if (window.location.pathname.startsWith('/auth/invite')) return

    window.location.replace('/auth/invite' + hash)
  }, [])

  return null
}
