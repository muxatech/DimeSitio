export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">{title}</h3>
        <div className="h-px flex-1 bg-stone-100" />
      </div>
      {children}
    </div>
  )
}
