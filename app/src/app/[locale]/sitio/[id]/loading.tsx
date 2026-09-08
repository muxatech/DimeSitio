export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="h-64 animate-pulse rounded-2xl bg-stone-100 sm:h-80 lg:h-[28rem]" />
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:gap-8">
        <div className="flex-1 space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded-xl bg-stone-100" />
          <div className="h-24 animate-pulse rounded-2xl bg-stone-100" />
        </div>
        <div className="space-y-2 lg:w-80">
          <div className="h-14 animate-pulse rounded-2xl bg-stone-100" />
          <div className="h-14 animate-pulse rounded-2xl bg-stone-100" />
          <div className="h-14 animate-pulse rounded-2xl bg-stone-100" />
        </div>
      </div>
    </div>
  )
}
