'use client'

import { motion } from 'framer-motion'
import { JetBrains_Mono } from 'next/font/google'

const panelMono = JetBrains_Mono({ subsets: ['latin'], weight: ['600', '700', '800'], display: 'swap' })

export function StatCard({ label, value, sub, highlight }: { label: string; value: number; sub?: string; highlight?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">{label}</div>
      <div className="mt-2 overflow-hidden">
        <motion.div
          animate={highlight ? { scaleY: [1, 1.35, 1], y: [6, 0, 0] } : { scaleY: 1, y: 0 }}
          style={{ originY: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className={`tabular-nums text-4xl font-extrabold tracking-tight sm:text-5xl ${panelMono.className} ${highlight ? 'text-emerald-600' : 'text-stone-900'}`}
        >
          {value.toLocaleString('es-ES')}
        </motion.div>
      </div>
      {sub && <div className="mt-1 text-xs font-medium tabular-nums text-stone-500">{sub}</div>}
    </div>
  )
}
