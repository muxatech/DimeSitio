'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@/i18n/navigation'
import { checkStaffStatus, getGlobalMetrics } from '@/lib/panel/api'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { motion } from 'framer-motion'
import { Cormorant_Garamond } from 'next/font/google'
import { Eye, Users, Play, HelpCircle, Store, Trophy, Phone, MapPin, Menu, Calendar, Crown, Camera, TrendingUp, Layers, MousePointer, Maximize } from 'lucide-react'
import Link from 'next/link'

const telvaSerif = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' })

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } }
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

function StatCard({ label, value, sub, highlight }: { label: string; value: number; sub?: string; highlight?: boolean }) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-stone-200 bg-white p-6 shadow-[0_1px_12px_rgba(0,0,0,0.04)]">
      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-400">{label}</div>
      <div className="mt-3 overflow-hidden">
        <motion.div
          animate={highlight ? { scaleY: [1, 1.35, 1], y: [6, 0, 0] } : { scaleY: 1, y: 0 }}
          style={{ originY: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className={`text-5xl font-light tracking-[-0.03em] sm:text-[46px] ${telvaSerif.className} ${highlight ? 'text-emerald-600' : 'text-stone-800'}`}
        >
          {value.toLocaleString('es-ES')}
        </motion.div>
      </div>
      {sub && <div className="mt-2 text-[11px] font-medium tracking-wide text-stone-400">{sub}</div>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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

  const prevTotalsRef = useRef<Record<string, number> | null>(null)
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['global-metrics'],
    queryFn: getGlobalMetrics,
    enabled: isStaff === true,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
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

  if (isStaff === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-900" />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-stone-100" />
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

  const t = data!.totals

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-10">
      <motion.div variants={item} className="flex items-start justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className={`text-[34px] font-light tracking-[-0.03em] text-stone-800 sm:text-[38px] ${telvaSerif.className}`}>Stats</h1>
          <p className="mt-1 text-[13px] leading-relaxed text-stone-400">Métricas generales y por sitio · últimos 7 días <span className="text-stone-300">· 30d entre paréntesis</span></p>
          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide ${live ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} /> {live ? 'LIVE' : 'conectando...'}
            </span>
            {lastUpdate && <span className="text-[11px] text-stone-400">{lastUpdate.toLocaleTimeString()}</span>}
          </div>
        </div>
        <button
          onClick={() => document.documentElement.requestFullscreen().catch(() => {})}
          className="hidden items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-stone-600 hover:bg-stone-50 sm:inline-flex"
        >
          <Maximize className="h-3.5 w-3.5" /> Pantalla completa
        </button>
      </motion.div>

      <Section title="Tráfico">
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Visitas" value={t.page_views_7d} sub={`30d · ${t.page_views_30d.toLocaleString('es-ES')}`} highlight={highlighted.has('page_views_7d')} />
          <StatCard label="Únicas" value={t.uniques_7d} sub="visitantes" highlight={highlighted.has('uniques_7d')} />
          <StatCard label="/restaurantes" value={t.restaurantes_views_7d} sub="visitas B2B" highlight={highlighted.has('restaurantes_views_7d')} />
          <StatCard label="Activos" value={t.restaurants_active} sub="reales" highlight={highlighted.has('restaurants_active')} />
        </motion.div>
      </Section>

      <Section title="Embudo">
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Flow starts" value={t.flow_starts_7d} sub={`30d · ${t.flow_starts_30d.toLocaleString('es-ES')}`} highlight={highlighted.has('flow_starts_7d')} />
          <StatCard label="Q categorías" value={t.q_categories_7d} sub="paso 1" highlight={highlighted.has('q_categories_7d')} />
          <StatCard label="Q precio" value={t.q_price_7d} sub="paso 2" highlight={highlighted.has('q_price_7d')} />
          <StatCard label="Q zona" value={t.q_location_7d} sub="paso 3" highlight={highlighted.has('q_location_7d')} />
        </motion.div>
      </Section>

      <Section title="Distribución">
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Top5 impres." value={t.impressions_7d} sub={`30d · ${t.impressions_30d.toLocaleString('es-ES')}`} highlight={highlighted.has('impressions_7d')} />
          <StatCard label="Selecciones" value={t.selections_7d} sub={`30d · ${t.selections_30d.toLocaleString('es-ES')}`} highlight={highlighted.has('selections_7d')} />
          <StatCard label="Winners" value={t.cta_winner_7d} sub="ganador final" highlight={highlighted.has('cta_winner_7d')} />
        </motion.div>
      </Section>

      <Section title="Conversión por sitio">
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Calls" value={t.cta_call_7d} sub={`30d · ${t.cta_call_30d.toLocaleString('es-ES')}`} highlight={highlighted.has('cta_call_7d')} />
          <StatCard label="Maps" value={t.cta_maps_7d} highlight={highlighted.has('cta_maps_7d')} />
          <StatCard label="Menú" value={t.cta_menu_7d} highlight={highlighted.has('cta_menu_7d')} />
          <StatCard label="Reservas" value={t.cta_reservations_7d} highlight={highlighted.has('cta_reservations_7d')} />
          <StatCard label="Instagram" value={t.cta_instagram_7d} highlight={highlighted.has('cta_instagram_7d')} />
        </motion.div>
      </Section>

      <motion.div variants={item} className="rounded-[22px] border border-stone-200 bg-white p-6 shadow-[0_1px_12px_rgba(0,0,0,0.04)] sm:p-7">
        <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Evolución diaria · 30d</h3>
        {data!.daily.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-stone-400">Sin datos aún — completa un flujo para ver el gráfico</div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data!.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4' }} />
                <Bar dataKey="page_views" fill="#1c1917" name="Visitas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="flow_starts" fill="#57534e" name="Flow" radius={[4, 4, 0, 0]} />
                <Bar dataKey="impressions" fill="#78716c" name="Top5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cta" fill="#a8a29e" name="CTA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      <motion.div variants={item} className="rounded-[22px] border border-stone-200 bg-white p-6 shadow-[0_1px_12px_rgba(0,0,0,0.04)] sm:p-7">
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Restaurantes destacados · 30d</h3>
        {data!.topRestaurants.length === 0 ? (
          <div className="py-6 text-center text-sm text-stone-400">Sin rankings aún — aparecerán tras las primeras impresiones</div>
        ) : (
          <div className="divide-y divide-stone-100">
            {data!.topRestaurants.map((r) => (
              <Link key={`${r.type}-${r.restaurant_id}`} href={`/sitio/${r.restaurant_id}`} className="flex items-center justify-between rounded-2xl px-2 py-2.5 hover:bg-stone-50">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">{r.type === 'impressions' ? 'Top5' : r.type === 'winner' ? 'Winner' : 'Call'}</span>
                  <span className="text-sm font-medium text-stone-800">{r.name}</span>
                </div>
                <span className="text-sm font-bold text-stone-900">{r.count}</span>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
