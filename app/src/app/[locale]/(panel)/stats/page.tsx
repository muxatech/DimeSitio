'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { useRouter } from '@/i18n/navigation'
import { checkStaffStatus, getGlobalMetrics } from '@/lib/panel/api'
import { supabase } from '@/lib/supabase'
import { StatCard } from '@/components/stats/stat-card'
import { Section } from '@/components/stats/section'
import { PresetSelector } from '@/components/stats/preset-selector'
import { DailyChart } from '@/components/stats/daily-chart'

export default function StatsPage() {
  const router = useRouter()
  const [isStaff, setIsStaff] = useState<boolean | null>(null)

  useEffect(() => {
    checkStaffStatus().then((staff) => {
      if (!staff) router.replace('/dashboard')
      else setIsStaff(true)
    })
  }, [router])

  const queryClient = useQueryClient()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [live, setLive] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const [preset, setPreset] = useState<import('@/types').StatsPreset>('7d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const range = preset === 'custom' ? { preset, from: customFrom || undefined, to: customTo || undefined } : { preset }

  const prevTotalsRef = useRef<Record<string, number> | null>(null)
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['global-metrics', preset, customFrom, customTo],
    queryFn: () => getGlobalMetrics(range as import('@/types').StatsRange),
    enabled: isStaff === true && (preset !== 'custom' || (!!customFrom && !!customTo && customFrom <= customTo)),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    if (!data?.totals) return
    const curr = data.totals as unknown as Record<string, number>
    const prev = prevTotalsRef.current
    prevTotalsRef.current = { ...curr }
    if (!prev) return
    const changed = new Set<string>()
    for (const k of Object.keys(curr)) {
      if (curr[k] !== prev[k]) changed.add(k)
    }
    if (changed.size) {
      setHighlighted(changed)
      const t = setTimeout(() => setHighlighted(new Set()), 1200)
      return () => clearTimeout(t)
    }
  }, [data])

  const scheduleInvalidate = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['global-metrics'] })
      setLastUpdate(new Date())
    }, 500)
  }, [queryClient])

  const todayStr = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (isStaff !== true) return
    const channel = supabase
      .channel('muro-stats-global-v1')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'page_views' }, scheduleInvalidate)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'question_views' }, scheduleInvalidate)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cta_clicks' }, scheduleInvalidate)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'impressions' }, scheduleInvalidate)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'selections' }, scheduleInvalidate)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'flow_starts' }, scheduleInvalidate)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'calls' }, scheduleInvalidate)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setLive(true)
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') setLive(false)
      })

    let wakeLock: { release: () => Promise<void> } | null = null
    if ('wakeLock' in navigator) {
      ;(navigator as unknown as { wakeLock: { request: (t: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock
        .request('screen')
        .then((w) => { wakeLock = w })
        .catch(() => {})
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({ queryKey: ['global-metrics'] })
        if ('wakeLock' in navigator) {
          ;(navigator as unknown as { wakeLock: { request: (t: string) => Promise<unknown> } }).wakeLock.request('screen').catch(() => {})
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      document.removeEventListener('visibilitychange', onVisibility)
      if (wakeLock) wakeLock.release().catch(() => {})
      supabase.removeChannel(channel)
    }
  }, [isStaff, scheduleInvalidate, queryClient])

  const presetLabel = data?.range?.label ?? (preset === '7d' ? 'Últimos 7 días' : preset === '30d' ? 'Últimos 30 días' : preset === 'today' ? 'Hoy' : preset === 'yesterday' ? 'Ayer' : `${customFrom} → ${customTo}`)

  if (isStaff === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-900" />
      </div>
    )
  }

  if (isError) {
    const msg = (error as Error)?.message ?? ''
    const isMissingTable = msg.includes('page_views') || msg.includes('does not exist') || msg.includes('relation')
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="font-semibold text-amber-900">Métricas aún no disponibles</p>
        <p className="mt-1 text-sm text-amber-700">
          {isMissingTable
            ? 'Las tablas de stats no existen aún en producción. Ejecuta la migración 20260731000002 y despliega la Edge Function analytics (ver instrucciones abajo).'
            : msg}
        </p>
        {isMissingTable && (
          <div className="mt-4 rounded-xl bg-white p-3 text-left text-xs text-stone-600">
            <div className="font-semibold">Para activar en prod:</div>
            <div className="mt-1 font-mono text-[11px]">supabase db push --linked</div>
            <div className="font-mono text-[11px]">supabase functions deploy analytics --no-verify-jwt</div>
          </div>
        )}
      </div>
    )
  }

  const t = data?.totals

  const showSkeleton = isLoading && !data

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-[30px] font-extrabold tracking-tight text-stone-900 sm:text-[34px]">Stats</h1>
          <p className="mt-1 text-[13px] leading-relaxed text-stone-400">Métricas generales y por sitio · {presetLabel}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide ${live ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} /> {live ? 'LIVE' : 'conectando...'}
            </span>
            {lastUpdate && <span className="text-[11px] text-stone-400">{lastUpdate.toLocaleTimeString()}</span>}
            {isFetching && <span className="h-3 w-3 animate-spin rounded-full border-2 border-stone-200 border-t-stone-500" />}
          </div>
        </div>
        <button
          onClick={() => document.documentElement.requestFullscreen().catch(() => {})}
          className="hidden items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-stone-600 hover:bg-stone-50 sm:inline-flex"
        >
          Pantalla completa
        </button>
      </div>

      <PresetSelector preset={preset} setPreset={setPreset} customFrom={customFrom} setCustomFrom={setCustomFrom} customTo={customTo} setCustomTo={setCustomTo} label={presetLabel} todayStr={todayStr} />

      {showSkeleton ? (
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, s) => (
            <div key={s} className="space-y-3">
              <div className="h-5 w-32 animate-pulse rounded-lg bg-stone-100" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-100" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
            <Section title="Tráfico">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Visitas" value={t!.page_views} highlight={highlighted.has('page_views')} />
                <StatCard label="Únicas" value={t!.uniques} highlight={highlighted.has('uniques')} />
                <StatCard label="/restaurantes" value={t!.restaurantes_views} highlight={highlighted.has('restaurantes_views')} />
                <StatCard label="Activos" value={t!.restaurants_active} sub="reales" highlight={highlighted.has('restaurants_active')} />
              </div>
            </Section>
          </div>

          <Section title="Embudo">
            <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Flow starts" value={t!.flow_starts} highlight={highlighted.has('flow_starts')} />
                <StatCard label="Q categorías" value={t!.q_categories} sub="paso 1" highlight={highlighted.has('q_categories')} />
                <StatCard label="Q precio" value={t!.q_price} sub="paso 2" highlight={highlighted.has('q_price')} />
                <StatCard label="Q zona" value={t!.q_location} sub="paso 3" highlight={highlighted.has('q_location')} />
              </div>
            </div>
          </Section>

          <Section title="Distribución">
            <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard label="Top5 impres." value={t!.impressions} highlight={highlighted.has('impressions')} />
                <StatCard label="Selecciones" value={t!.selections} highlight={highlighted.has('selections')} />
                <StatCard label="Winners" value={t!.cta_winner} sub="ganador final" highlight={highlighted.has('cta_winner')} />
              </div>
            </div>
          </Section>

          <Section title="Conversión por sitio">
            <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <StatCard label="Calls" value={t!.cta_call} highlight={highlighted.has('cta_call')} />
                <StatCard label="Maps" value={t!.cta_maps} highlight={highlighted.has('cta_maps')} />
                <StatCard label="Menú" value={t!.cta_menu} highlight={highlighted.has('cta_menu')} />
                <StatCard label="Reservas" value={t!.cta_reservations} highlight={highlighted.has('cta_reservations')} />
                <StatCard label="Instagram" value={t!.cta_instagram} highlight={highlighted.has('cta_instagram')} />
              </div>
            </div>
          </Section>

      <DailyChart data={data!.daily} label={presetLabel} isFetching={isFetching} />

          <div className={`rounded-[22px] border border-stone-200 bg-white p-6 shadow-[0_1px_12px_rgba(0,0,0,0.04)] sm:p-7 ${isFetching ? 'opacity-60' : ''}`}>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Restaurantes destacados · {presetLabel}</h3>
            {data!.topRestaurants.length === 0 ? (
              <div className="py-6 text-center text-sm text-stone-400">Sin rankings aún — aparecerán tras las primeras impresiones</div>
            ) : (
              <div className="divide-y divide-stone-100">
                {data!.topRestaurants.map((r) => (
                  <a key={`${r.type}-${r.restaurant_id}`} href={`/sitio/${r.restaurant_id}`} className="flex items-center justify-between rounded-2xl px-2 py-2.5 hover:bg-stone-50">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">{r.type === 'impressions' ? 'Top5' : r.type === 'winner' ? 'Winner' : 'Call'}</span>
                      <span className="text-sm font-medium text-stone-800">{r.name}</span>
                    </div>
                    <span className="text-sm font-bold text-stone-900">{r.count}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
