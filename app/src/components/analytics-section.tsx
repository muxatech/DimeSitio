'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { getRestaurantAnalytics } from '@/lib/panel/api'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { StatCard } from '@/components/stats/stat-card'
import { Section } from '@/components/stats/section'
import { PresetSelector } from '@/components/stats/preset-selector'
import { DailyChart } from '@/components/stats/daily-chart'
import type { StatsPreset } from '@/types'
import { RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }

export function AnalyticsSection({ restaurantId, restaurantName }: { restaurantId: string; restaurantName: string }) {
  const t = useTranslations('Dashboard')
  const [preset, setPreset] = useState<StatsPreset>('7d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const range = preset === 'custom' ? { preset, from: customFrom || undefined, to: customTo || undefined } : { preset }

  const queryClient = useQueryClient()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [live, setLive] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const prevTotalsRef = useRef<Record<string, number> | null>(null)
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['analytics', restaurantId, preset, customFrom, customTo],
    queryFn: () => getRestaurantAnalytics(restaurantId, range as import('@/types').StatsRange),
    enabled: preset !== 'custom' || (!!customFrom && !!customTo && customFrom <= customTo),
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
    for (const k of Object.keys(curr)) if (curr[k] !== prev[k]) changed.add(k)
    if (changed.size) {
      setHighlighted(changed)
      const tm = setTimeout(() => setHighlighted(new Set()), 1200)
      return () => clearTimeout(tm)
    }
  }, [data])

  const scheduleInvalidate = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['analytics', restaurantId] })
      setLastUpdate(new Date())
    }, 500)
  }, [queryClient, restaurantId])

  useEffect(() => {
    const channel = supabase
      .channel(`analytics-${restaurantId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'impressions', filter: `restaurant_id=eq.${restaurantId}` }, scheduleInvalidate)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'selections', filter: `restaurant_id=eq.${restaurantId}` }, scheduleInvalidate)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cta_clicks', filter: `restaurant_id=eq.${restaurantId}` }, scheduleInvalidate)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'calls', filter: `restaurant_id=eq.${restaurantId}` }, scheduleInvalidate)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setLive(true)
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') setLive(false)
      })
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      supabase.removeChannel(channel)
    }
  }, [restaurantId, scheduleInvalidate])

  const todayStr = new Date().toISOString().slice(0, 10)
  const presetLabel = (data as { range?: { label: string } } | undefined)?.range?.label ?? (preset === '7d' ? 'Últimos 7 días' : preset === '30d' ? 'Últimos 30 días' : preset === 'today' ? 'Hoy' : preset === 'yesterday' ? 'Ayer' : `${customFrom} → ${customTo}`)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-stone-100" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-100" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <RefreshCw className="h-6 w-6 text-red-400" />
        <p className="text-sm text-stone-500">{t('analyticsLoadError')}</p>
        <button onClick={() => refetch()} className="rounded-xl bg-stone-800 px-4 py-2 text-xs font-semibold text-white">
          {t('retry')}
        </button>
      </div>
    )
  }

  if (!data) return null
  const { totals, daily } = data

  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-stone-900 sm:text-lg">{restaurantName}</h3>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide ${live ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />{live ? 'LIVE' : 'conectando...'}
          </span>
          {lastUpdate && <span className="hidden text-[11px] text-stone-400 sm:inline">{lastUpdate.toLocaleTimeString()}</span>}
          {isFetching && <span className="h-3 w-3 animate-spin rounded-full border-2 border-stone-200 border-t-stone-500" />}
        </div>
      </div>

      <PresetSelector preset={preset} setPreset={setPreset} customFrom={customFrom} setCustomFrom={setCustomFrom} customTo={customTo} setCustomTo={setCustomTo} label={presetLabel} todayStr={todayStr} />

      <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
        <Section title="Visibilidad">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Impresiones" value={totals.impressions} highlight={highlighted.has('impressions')} />
            <StatCard label="Selecciones" value={totals.selections} highlight={highlighted.has('selections')} />
            <StatCard label="Winner" value={totals.winner} sub="ganador final" highlight={highlighted.has('winner')} />
            <StatCard label="Ratio selección" value={Math.round(totals.selection_rate * 100)} sub={`${(totals.selection_rate * 100).toFixed(1)}%`} highlight={highlighted.has('selection_rate')} />
          </div>
        </Section>
      </div>

      <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
        <Section title="Conversión por CTA">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Calls" value={totals.cta_call || totals.calls} highlight={highlighted.has('cta_call') || highlighted.has('calls')} />
            <StatCard label="Maps" value={totals.cta_maps} highlight={highlighted.has('cta_maps')} />
            <StatCard label="Menú" value={totals.cta_menu} highlight={highlighted.has('cta_menu')} />
            <StatCard label="Reservas" value={totals.cta_reservations} highlight={highlighted.has('cta_reservations')} />
            <StatCard label="Instagram" value={totals.cta_instagram} highlight={highlighted.has('cta_instagram')} />
          </div>
        </Section>
      </div>

      <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
        <Section title="Rendimiento">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            <StatCard label="Conversión" value={Math.round(totals.conversion_rate * 100)} sub={`${(totals.conversion_rate * 100).toFixed(1)}%`} highlight={highlighted.has('conversion_rate')} />
            <StatCard label="Selección" value={Math.round(totals.selection_rate * 100)} sub={`${(totals.selection_rate * 100).toFixed(1)}%`} highlight={highlighted.has('selection_rate')} />
          </div>
        </Section>
      </div>

      <DailyChart data={daily} label={presetLabel} isFetching={isFetching} />
    </motion.div>
  )
}
