export default function Loading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-stone-800" />
      <p className="text-sm text-stone-400">Cargando…</p>
    </div>
  )
}
