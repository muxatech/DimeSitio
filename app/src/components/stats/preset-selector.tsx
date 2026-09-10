'use client'

import { Calendar } from 'lucide-react'
import type { StatsPreset } from '@/types'

export function PresetSelector({
  preset,
  setPreset,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
  label,
  todayStr,
}: {
  preset: StatsPreset
  setPreset: (p: StatsPreset) => void
  customFrom: string
  setCustomFrom: (v: string) => void
  customTo: string
  setCustomTo: (v: string) => void
  label: string
  todayStr: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-stone-200 bg-white p-1.5 shadow-sm">
      <div className="flex gap-1 rounded-xl bg-stone-100 p-0.5">
        {(['today', 'yesterday', '7d', '30d'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPreset(p)}
            className={preset === p ? 'rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-stone-900 shadow-sm' : 'rounded-lg px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-700'}
          >
            {p === 'today' ? 'Hoy' : p === 'yesterday' ? 'Ayer' : p === '7d' ? '7 días' : '30 días'}
          </button>
        ))}
        <button
          onClick={() => setPreset('custom')}
          className={preset === 'custom' ? 'rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm' : 'rounded-lg px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-700'}
        >
          <Calendar className="mr-1 inline h-3.5 w-3.5" /> Personalizado
        </button>
      </div>
      {preset === 'custom' && (
        <div className="flex items-center gap-2">
          <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} max={customTo || undefined} className="rounded-2xl border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-900 shadow-sm focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200" />
          <span className="text-stone-400">—</span>
          <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} min={customFrom || undefined} max={todayStr} className="rounded-2xl border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-900 shadow-sm focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200" />
        </div>
      )}
      <span className="ml-auto text-xs text-stone-400">{label}</span>
    </div>
  )
}
