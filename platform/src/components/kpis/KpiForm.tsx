'use client'

import { useState, useEffect } from 'react'
import { KpiSnapshot, KpiLineChart, KpiBarChart, formatCurrency } from './KpiChart'

interface KpiFormProps {
  clientId: string
  clientSlug: string
  initialSnapshots: KpiSnapshot[]
}

const METRICS = [
  { key: 'ad_spend', label: 'Ad Spend ($)', placeholder: '5000', prefix: '$' },
  { key: 'leads', label: 'Leads', placeholder: '42' },
  { key: 'cpl', label: 'Cost Per Lead ($)', placeholder: 'auto-calculated', prefix: '$', computed: true },
  { key: 'appointments', label: 'Appointments', placeholder: '18' },
  { key: 'show_rate', label: 'Show Rate (%)', placeholder: '75', suffix: '%' },
  { key: 'revenue_generated', label: 'Revenue Generated ($)', placeholder: '25000', prefix: '$' },
]

function firstOfMonth(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}

function monthLabel(period: string) {
  return new Date(period).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function KpiForm({ clientId, initialSnapshots }: KpiFormProps) {
  const [snapshots, setSnapshots] = useState<KpiSnapshot[]>(initialSnapshots)
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Set initial period on client only to avoid SSR/hydration mismatch
  useEffect(() => {
    setSelectedPeriod(firstOfMonth(new Date()))
  }, [])

  // Load existing values for the selected month
  useEffect(() => {
    if (!selectedPeriod) return
    const existing = snapshots.filter((s) => s.period === selectedPeriod)
    const loaded: Record<string, string> = {}
    for (const s of existing) loaded[s.metric_name] = String(s.value)
    setValues(loaded)
  }, [selectedPeriod, snapshots])

  // Auto-calculate CPL
  const adSpend = parseFloat(values.ad_spend ?? '')
  const leads = parseFloat(values.leads ?? '')
  const autoCpl = !isNaN(adSpend) && !isNaN(leads) && leads > 0
    ? (adSpend / leads).toFixed(2)
    : ''

  async function handleSave() {
    setSaving(true)
    try {
      const metrics: Record<string, string | number> = { ...values }
      if (autoCpl) metrics.cpl = autoCpl
      delete metrics.cpl // remove manual CPL field, use computed

      const res = await fetch('/api/kpis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, period: selectedPeriod, metrics }),
      })
      if (res.ok) {
        const saved = await res.json()
        // Merge into snapshots
        setSnapshots((prev) => {
          const filtered = prev.filter((s) => !(s.period === selectedPeriod && saved.some((n: KpiSnapshot) => n.metric_name === s.metric_name)))
          return [...filtered, ...saved].sort((a, b) => a.period.localeCompare(b.period))
        })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  // Generate last 12 month options (empty until client mounts to avoid hydration mismatch)
  const [monthOptions, setMonthOptions] = useState<string[]>([])
  useEffect(() => {
    setMonthOptions(Array.from({ length: 12 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      return firstOfMonth(d)
    }))
  }, [])

  return (
    <div>
      {/* Month selector */}
      <div className="flex items-center gap-3 mb-6">
        <label className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>Month</label>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="rounded-lg px-3 py-1.5 text-sm outline-none"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
        >
          {monthOptions.map((m) => (
            <option key={m} value={m}>{monthLabel(m)}</option>
          ))}
        </select>
      </div>

      {/* Metric inputs */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {METRICS.map((metric) => {
          const isComputed = metric.key === 'cpl'
          const displayValue = isComputed ? autoCpl : (values[metric.key] ?? '')

          return (
            <div key={metric.key}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                {metric.label}
              </label>
              <div className="relative">
                {metric.prefix && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-3)' }}>
                    {metric.prefix}
                  </span>
                )}
                <input
                  type={isComputed ? 'text' : 'number'}
                  value={displayValue}
                  onChange={isComputed ? undefined : (e) => setValues((v) => ({ ...v, [metric.key]: e.target.value }))}
                  readOnly={isComputed}
                  placeholder={isComputed && autoCpl ? autoCpl : metric.placeholder}
                  className="w-full rounded-lg py-2 text-sm outline-none"
                  style={{
                    background: isComputed ? 'var(--bg-subtle)' : 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: isComputed ? 'var(--text-3)' : 'var(--text-1)',
                    paddingLeft: metric.prefix ? '1.75rem' : '0.75rem',
                    paddingRight: metric.suffix ? '1.75rem' : '0.75rem',
                  }}
                />
                {metric.suffix && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-3)' }}>
                    {metric.suffix}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3 mb-10">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 transition-all"
          style={{ background: 'var(--text-1)', color: 'var(--bg)' }}
        >
          {saving ? 'Saving…' : `Save ${monthLabel(selectedPeriod)}`}
        </button>
        {saved && <span className="text-xs" style={{ color: '#22c55e' }}>Saved!</span>}
      </div>

      {/* Charts */}
      {snapshots.length > 0 && (
        <div className="space-y-8">
          <div className="rounded-lg p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <KpiLineChart
              snapshots={snapshots.filter((s) => s.metric_name === 'cpl')}
              metrics={['cpl']}
              colors={['#ef4444']}
              formatValue={(v) => `$${v.toFixed(0)}`}
              title="Cost Per Lead — Last 6 Months"
            />
          </div>

          <div className="rounded-lg p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <KpiBarChart
              snapshots={snapshots.filter((s) => ['leads', 'appointments'].includes(s.metric_name))}
              metrics={['leads', 'appointments']}
              colors={['#58a6ff', '#3fb950']}
              title="Leads vs Appointments"
            />
          </div>

          <div className="rounded-lg p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <KpiLineChart
              snapshots={snapshots.filter((s) => ['ad_spend', 'revenue_generated'].includes(s.metric_name))}
              metrics={['ad_spend', 'revenue_generated']}
              colors={['#f59e0b', '#3fb950']}
              formatValue={formatCurrency}
              title="Ad Spend vs Revenue Generated"
            />
          </div>
        </div>
      )}
    </div>
  )
}
