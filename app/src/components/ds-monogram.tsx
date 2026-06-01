import { cn } from '@/lib/utils'

export default function DsMonogram({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center justify-center rounded-lg bg-stone-800', className)}>
      <svg viewBox="0 0 32 32" className="h-[26px] w-[26px] text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="10" y="16" textAnchor="middle" dominantBaseline="central" fill="currentColor" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="18">
          D
        </text>
        <text x="22" y="16" textAnchor="middle" dominantBaseline="central" fill="currentColor" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="18">
          S
        </text>
      </svg>
    </span>
  )
}
