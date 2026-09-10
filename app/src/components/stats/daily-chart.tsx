'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export function DailyChart({ data, label, isFetching }: { data: { date: string; page_views?: number; flow_starts?: number; impressions: number; selections?: number; calls?: number; cta: number; winner?: number }[]; label: string; isFetching?: boolean }) {
  return (
    <div className={`rounded-[22px] border border-stone-200 bg-white p-6 shadow-[0_1px_12px_rgba(0,0,0,0.04)] sm:p-7 ${isFetching ? 'opacity-60' : ''}`}>
      <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Evolución diaria · {label}</h3>
      {data.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-stone-400">Sin datos aún — completa un flujo para ver el gráfico</div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4' }} />
              {data[0] && 'page_views' in data[0] && <Bar dataKey="page_views" fill="#1c1917" name="Visitas" radius={[4, 4, 0, 0]} />}
              {data[0] && 'flow_starts' in data[0] && <Bar dataKey="flow_starts" fill="#57534e" name="Flow" radius={[4, 4, 0, 0]} />}
              <Bar dataKey="impressions" fill="#78716c" name="Top5" radius={[4, 4, 0, 0]} />
              {data[0] && 'selections' in data[0] && <Bar dataKey="selections" fill="#f97316" name="Selecciones" radius={[4, 4, 0, 0]} />}
              {data[0] && 'calls' in data[0] && <Bar dataKey="calls" fill="#22c55e" name="Calls" radius={[4, 4, 0, 0]} />}
              <Bar dataKey="cta" fill="#a8a29e" name="CTA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
