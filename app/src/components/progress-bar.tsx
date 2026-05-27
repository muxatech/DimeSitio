'use client'

export default function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = ((current + 1) / total) * 100

  return (
    <div className="w-full">
      <div className="h-1 w-full rounded-full bg-zinc-200">
        <div
          className="h-1 rounded-full bg-orange-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-right text-xs text-zinc-400">
        {current + 1} / {total}
      </p>
    </div>
  )
}
