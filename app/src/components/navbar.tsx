'use client'

import { useState } from 'react'
import { useFlowStore } from '@/store/flow-store'
import { getSessionId } from '@/lib/utils'
import { cn } from '@/lib/utils'

const links = [
  { label: 'Inicio', action: 'home' as const },
]

export default function Navbar() {
  const step = useFlowStore((s) => s.step)
  const reset = useFlowStore((s) => s.reset)
  const setStep = useFlowStore((s) => s.setStep)
  const setSessionId = useFlowStore((s) => s.setSessionId)
  const isLanding = step === 'landing'
  const [menuOpen, setMenuOpen] = useState(false)

  function startFlow() {
    setSessionId(getSessionId())
    setStep('questions')
  }

  function handleNav(action: 'home' | 'explore') {
    setMenuOpen(false)
    if (action === 'home') {
      reset()
    }
    if (action === 'explore') {
      startFlow()
    }
  }

  return (
    <nav
      className={cn(
        'z-50 flex h-16 items-center justify-between px-5 transition-all duration-300 sm:px-8 lg:px-12',
        isLanding
          ? 'absolute inset-x-0 top-0 text-white'
          : 'sticky top-0 border-b border-stone-100 bg-white/90 text-stone-900 shadow-sm backdrop-blur-md'
      )}
    >
      {/* Logo */}
      <button
        onClick={() => handleNav('home')}
        className={cn('flex items-center gap-2 text-lg font-bold tracking-tight', isLanding ? 'text-white' : 'text-stone-900')}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-800 text-sm font-bold text-white shadow-sm">
          D
        </span>
        DimeSitio
      </button>

      {/* Desktop links */}
      <div className="hidden items-center gap-1 sm:flex">
        {links.map((link) => (
          <button
            key={link.label}
            onClick={() => handleNav(link.action)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
              isLanding
                ? 'text-white/70 hover:bg-white/10 hover:text-white'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            )}
          >
            {link.label}
          </button>
        ))}
        <button
          onClick={startFlow}
          className={cn(
            'ml-2 rounded-xl px-5 py-2 text-sm font-semibold transition-all',
            isLanding
              ? 'border border-white/30 bg-white/10 text-white hover:bg-white/20'
              : 'bg-stone-800 text-white shadow-lg shadow-stone-200/50 hover:bg-stone-700'
          )}
        >
          Empezar
        </button>
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={cn(
          'flex items-center justify-center rounded-xl p-2 transition-colors sm:hidden',
          isLanding ? 'hover:bg-white/10' : 'hover:bg-black/5'
        )}
        aria-label="Menú"
      >
        {menuOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-16 flex flex-col gap-1 border-b border-stone-100 bg-white px-5 pb-5 pt-3 shadow-lg sm:hidden">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNav(link.action)}
              className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false)
              startFlow()
            }}
            className="mt-1 w-full rounded-xl bg-stone-800 px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Empezar
          </button>
        </div>
      )}
    </nav>
  )
}
