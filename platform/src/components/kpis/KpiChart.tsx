'use client'

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

export interface KpiSnapshot {
  id: string
  client_id: string
  period: string
  metric_name: string
  value: number
}

// Convert flat snapshots → [{period, metric1, metric2, ...}]
function pivotSnapshots(snapshots: KpiSnapshot[]) {
  const map: Record<string, Record<string, number>> = {}
  for (const s of snapshots) {
    if (!map[s.period]) map[s.period] = { period: s.period as unknown as number }
    map[s.period][s.metric_name] = s.value
  }
  return Object.values(map).sort((a, b) => String(a.period).localeCompare(String(b.period)))
}

function formatPeriod(period: string) {
  return new Date(period).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function formatCurrency(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`
  return `$${v}`
}

interface KpiLineChartProps {
  snapshots: KpiSnapshot[]
  metrics: string[]
  colors?: string[]
  formatValue?: (v: number) => string
  title?: string
}

const DEFAULT_COLORS = ['#58a6ff', '#3fb950', '#f59e0b', '#a371f7', '#db61a2', '#39d353']

export function KpiLineChart({ snapshots, metrics, colors = DEFAULT_COLORS, formatValue, title }: KpiLineChartProps) {
  const data = pivotSnapshots(snapshots)
  if (data.length === 0) return <EmptyChart title={title} />

  return (
    <div>
      {title && <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-2)' }}>{title}</p>}
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis dataKey="period" tickFormatter={formatPeriod} tick={{ fontSize: 10, fill: 'var(--text-3)' as string }} />
          <YAxis tickFormatter={formatValue} tick={{ fontSize: 10, fill: 'var(--text-3)' as string }} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
            labelFormatter={(label) => formatPeriod(String(label))}
            formatter={(value) => [formatValue ? formatValue(Number(value)) : value, '']}
          />
          {metrics.map((m, i) => (
            <Line
              key={m}
              type="monotone"
              dataKey={m}
              stroke={colors[i] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface KpiBarChartProps {
  snapshots: KpiSnapshot[]
  metrics: string[]
  colors?: string[]
  formatValue?: (v: number) => string
  title?: string
}

export function KpiBarChart({ snapshots, metrics, colors = DEFAULT_COLORS, formatValue, title }: KpiBarChartProps) {
  const data = pivotSnapshots(snapshots)
  if (data.length === 0) return <EmptyChart title={title} />

  return (
    <div>
      {title && <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-2)' }}>{title}</p>}
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis dataKey="period" tickFormatter={formatPeriod} tick={{ fontSize: 10, fill: 'var(--text-3)' as string }} />
          <YAxis tickFormatter={formatValue} tick={{ fontSize: 10, fill: 'var(--text-3)' as string }} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
            labelFormatter={(label) => formatPeriod(String(label))}
            formatter={(value) => [formatValue ? formatValue(Number(value)) : value, '']}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {metrics.map((m, i) => (
            <Bar key={m} dataKey={m} fill={colors[i] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]} radius={[3, 3, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function EmptyChart({ title }: { title?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[180px]" style={{ border: '1px dashed var(--border)', borderRadius: 8 }}>
      {title && <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-2)' }}>{title}</p>}
      <p className="text-xs" style={{ color: 'var(--text-4)' }}>No data yet</p>
    </div>
  )
}

// Utility to format CPL / currency
export { formatCurrency }
