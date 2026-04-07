import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { ClientHealthGrid } from '@/components/dashboard/ClientHealthGrid'

async function getDashboardData() {
  try {
    const supabase = createServerClient()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [clientsRes, runsRes, kpisRes] = await Promise.all([
      supabase.from('clients').select('id, slug, company_name, logo_url').eq('status', 'active').order('company_name'),
      supabase.from('workflow_runs').select('id, tool_id, status, started_at, client_id, clients!inner(company_name, logo_url)').order('started_at', { ascending: false }).limit(10),
      supabase.from('kpi_snapshots').select('client_id, period').gte('period', thirtyDaysAgo.toISOString().split('T')[0]),
    ])

    const clients = clientsRes.data ?? []
    const recentRuns = runsRes.data ?? []
    const recentKpis = kpisRes.data ?? []

    const clientsWithKpis = new Set(recentKpis.map((k) => k.client_id))
    const clientsWithRuns = new Set(recentRuns.map((r) => r.client_id))

    const clientHealth = clients.map((c) => {
      const lastKpi = recentKpis.filter((k) => k.client_id === c.id).sort((a, b) => b.period.localeCompare(a.period))[0]
      const lastRun = recentRuns.filter((r) => r.client_id === c.id)[0]
      return {
        id: c.id, slug: c.slug, company_name: c.company_name, logo_url: c.logo_url ?? null,
        lastKpiDate: lastKpi?.period ?? null, lastRunDate: lastRun?.started_at ?? null,
      }
    })

    const activity = recentRuns.slice(0, 8).map((r) => {
      const client = r.clients as unknown as { company_name: string }
      return { id: r.id, label: r.tool_id.replace(/_/g, ' '), sub: client?.company_name ?? '', status: r.status, date: r.started_at }
    })

    return {
      clientHealth, activity,
      stats: {
        activeClients: clients.length,
        outputsThisMonth: recentRuns.filter((r) => {
          const d = new Date(r.started_at); const now = new Date()
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && r.status === 'completed'
        }).length,
        staleClients: clients.filter((c) => !clientsWithRuns.has(c.id)).length,
        missingKpiClients: clients.filter((c) => !clientsWithKpis.has(c.id)).length,
      },
    }
  } catch (e) {
    console.error('[dashboard]', e)
    return {
      clientHealth: [], activity: [],
      stats: { activeClients: 0, outputsThisMonth: 0, staleClients: 0, missingKpiClients: 0 },
    }
  }
}

export default async function DashboardPage() {
  const { clientHealth, activity, stats } = await getDashboardData()

  return (
    <div className="px-8 pt-10 pb-8 max-w-[1200px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>Dashboard</h1>
          <p className="text-xs" style={{ color: 'var(--text-3)' }} suppressHydrationWarning>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Row 1: Status cards ── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Active Clients" value={String(stats.activeClients)} sub="on retainer" href="/clients" />
        <StatCard label="Outputs This Month" value={String(stats.outputsThisMonth)} sub="completed" accent="neutral" />
        <StatCard
          label="Stale Clients"
          value={String(stats.staleClients)}
          sub={stats.staleClients > 0 ? 'no recent work' : 'all active'}
          accent={stats.staleClients > 0 ? 'yellow' : 'green'}
          href="/clients"
        />
      </div>

      {/* ── Row 2: Client Health (full width) ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>Client Health</h2>
          <Link href="/clients" className="text-xs transition-opacity hover:opacity-70" style={{ color: 'var(--text-3)' }}>View all →</Link>
        </div>
        <ClientHealthGrid clients={clientHealth} />
      </div>

      {/* ── Row 3: Recent Activity (full width) ── */}
      <div>
        <div className="mb-3">
          <h2 className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>Recent Activity</h2>
        </div>
        <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {activity.length === 0 ? (
            <div className="p-8 text-center"><p className="text-xs" style={{ color: 'var(--text-3)' }}>No recent activity.</p></div>
          ) : activity.map((item, i) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < activity.length - 1 ? '1px solid var(--border-dim)' : undefined, background: 'var(--bg-card)' }}>
              <RunDot status={item.status} />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate capitalize" style={{ color: 'var(--text-1)' }}>{item.label}</p>
                <p className="text-[11px] truncate" style={{ color: 'var(--text-3)' }}>{item.sub}</p>
              </div>
              <span className="text-[10px] shrink-0" style={{ color: 'var(--text-4)' }}>
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, accent = 'neutral', href }: {
  label: string; value: string; sub: string; accent?: 'green' | 'yellow' | 'red' | 'neutral'; href?: string
}) {
  const subColor = accent === 'green' ? '#16a34a' : accent === 'yellow' ? '#ca8a04' : accent === 'red' ? '#ef4444' : 'var(--text-3)'
  const dotColor = accent === 'green' ? '#22c55e' : accent === 'yellow' ? '#f59e0b' : accent === 'red' ? '#ef4444' : null
  const card = (
    <div className="rounded-md p-4" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
      <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>{label}</p>
      <p className="text-2xl font-semibold" style={{ color: 'var(--text-1)' }}>{value}</p>
      <div className="flex items-center gap-1.5 mt-1.5">
        {dotColor && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotColor }} />}
        <p className="text-[11px]" style={{ color: subColor }}>{sub}</p>
      </div>
    </div>
  )
  return href ? <Link href={href} className="block transition-opacity hover:opacity-80">{card}</Link> : card
}

function RunDot({ status }: { status: string }) {
  const map: Record<string, string> = { completed: '#22c55e', running: '#3b82f6', failed: '#ef4444' }
  return (
    <span
      className={`w-1.5 h-1.5 rounded-full shrink-0 ${status === 'running' ? 'animate-pulse' : ''}`}
      style={{ background: map[status] ?? 'var(--text-4)' }}
    />
  )
}
