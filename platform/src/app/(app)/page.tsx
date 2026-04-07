import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { detectAndSyncAlerts } from '@/lib/alerts'
import { AlertFeed } from '@/components/dashboard/AlertFeed'
import { ClientHealthGrid } from '@/components/dashboard/ClientHealthGrid'
import { AlertRecord } from '@/components/alerts/AlertModal'

async function getDashboardData() {
  try {
    const supabase = createServerClient()

    // Auto-detect and sync system alerts
    await detectAndSyncAlerts(supabase)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [clientsRes, tasksRes, alertsRes, runsRes, kpisRes, usersRes] = await Promise.all([
      supabase.from('clients').select('id, slug, company_name, logo_url').eq('status', 'active').order('company_name'),
      supabase.from('tasks').select('id, status, priority, due_date, client_id, assigned_to, title').neq('status', 'done'),
      supabase.from('alerts').select(`*, clients(id, slug, company_name), assignee:assigned_to(id, raw_user_meta_data)`).neq('status', 'resolved').order('created_at', { ascending: false }),
      supabase.from('workflow_runs').select('id, tool_id, status, started_at, client_id, clients!inner(company_name, logo_url)').order('started_at', { ascending: false }).limit(10),
      supabase.from('kpi_snapshots').select('client_id, period').gte('period', thirtyDaysAgo.toISOString().split('T')[0]),
      supabase.from('user_profiles').select('id, full_name, email'),
    ])

    const clients = clientsRes.data ?? []
    const tasks = tasksRes.data ?? []
    const alerts = (alertsRes.data ?? []) as AlertRecord[]
    const recentRuns = runsRes.data ?? []
    const recentKpis = kpisRes.data ?? []
    const teamMembers = (usersRes.data ?? []).map((u) => ({ id: u.id, full_name: u.full_name ?? '', email: u.email ?? '' }))

    const today = new Date().toISOString().split('T')[0]
    const overdueTasks = tasks.filter((t) => t.due_date && t.due_date < today)
    const clientsWithKpis = new Set(recentKpis.map((k) => k.client_id))
    const clientsWithRuns = new Set(recentRuns.map((r) => r.client_id))

    const clientHealth = clients.map((c) => {
      const clientTasks = tasks.filter((t) => t.client_id === c.id)
      const clientOverdue = overdueTasks.filter((t) => t.client_id === c.id)
      const clientAlerts = alerts.filter((a) => a.client_id === c.id)
      const clientCritical = clientAlerts.filter((a) => a.severity === 'critical')
      const lastKpi = recentKpis.filter((k) => k.client_id === c.id).sort((a, b) => b.period.localeCompare(a.period))[0]
      const lastRun = recentRuns.filter((r) => r.client_id === c.id)[0]
      return {
        id: c.id, slug: c.slug, company_name: c.company_name, logo_url: c.logo_url ?? null,
        openTasks: clientTasks.length, overdueTasks: clientOverdue.length,
        openAlerts: clientAlerts.length, criticalAlerts: clientCritical.length,
        lastKpiDate: lastKpi?.period ?? null, lastRunDate: lastRun?.started_at ?? null,
      }
    })

    const unassigned = tasks.filter((t) => !t.assigned_to)
    const activity = recentRuns.slice(0, 6).map((r) => {
      const client = r.clients as unknown as { company_name: string }
      return { id: r.id, label: r.tool_id.replace(/_/g, ' '), sub: client?.company_name ?? '', status: r.status, date: r.started_at }
    })

    return {
      tasks, alerts, teamMembers, clientHealth, unassigned, activity,
      stats: {
        activeClients: clients.length,
        openTasks: tasks.length,
        overdueTasks: overdueTasks.length,
        openAlerts: alerts.length,
        criticalAlerts: alerts.filter((a) => a.severity === 'critical').length,
        outputsThisMonth: recentRuns.filter((r) => {
          const d = new Date(r.started_at); const now = new Date()
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && r.status === 'completed'
        }).length,
        unassignedTasks: unassigned.length,
        staleClients: clients.filter((c) => !clientsWithRuns.has(c.id)).length,
        missingKpiClients: clients.filter((c) => !clientsWithKpis.has(c.id)).length,
      },
    }
  } catch (e) {
    console.error('[dashboard]', e)
    return {
      tasks: [], alerts: [], teamMembers: [], clientHealth: [], unassigned: [], activity: [],
      stats: { activeClients: 0, openTasks: 0, overdueTasks: 0, openAlerts: 0, criticalAlerts: 0, outputsThisMonth: 0, unassignedTasks: 0, staleClients: 0, missingKpiClients: 0 },
    }
  }
}

export default async function DashboardPage() {
  const { alerts, teamMembers, clientHealth, activity, stats, tasks } = await getDashboardData()

  const today = new Date().toISOString().split('T')[0]
  const topTasks = [...tasks]
    .sort((a, b) => {
      const p: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 }
      return (p[a.priority] ?? 2) - (p[b.priority] ?? 2)
    })
    .slice(0, 5)

  const clientsForFeed = clientHealth.map((c) => ({ id: c.id, company_name: c.company_name }))

  return (
    <div className="p-8 max-w-[1200px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Mission Control</h1>
        <p className="text-sm" style={{ color: 'var(--text-3)' }} suppressHydrationWarning>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* ── Row 1: Status cards ── */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <StatCard label="Active Clients" value={String(stats.activeClients)} sub="on retainer" href="/clients" />
        <StatCard label="Open Tasks" value={String(stats.openTasks)} sub={stats.overdueTasks > 0 ? `${stats.overdueTasks} overdue` : 'on track'} accent={stats.overdueTasks > 0 ? 'red' : 'neutral'} href="/tasks" />
        <StatCard label="Open Alerts" value={String(stats.openAlerts)} sub={stats.criticalAlerts > 0 ? `${stats.criticalAlerts} critical` : stats.openAlerts > 0 ? 'needs review' : 'all clear'} accent={stats.criticalAlerts > 0 ? 'red' : stats.openAlerts > 0 ? 'yellow' : 'green'} href="/alerts" />
        <StatCard label="Outputs This Month" value={String(stats.outputsThisMonth)} sub="completed" accent="neutral" />
        <StatCard label="Unassigned Tasks" value={String(stats.unassignedTasks)} sub={stats.unassignedTasks > 0 ? 'need assignment' : 'all assigned'} accent={stats.unassignedTasks > 0 ? 'yellow' : 'green'} href="/tasks" />
      </div>

      {/* ── Row 2: Client health + Alerts ── */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Client Health</h2>
            <Link href="/clients" className="text-xs" style={{ color: 'var(--text-3)' }}>View all →</Link>
          </div>
          <ClientHealthGrid clients={clientHealth} />
        </div>
        <div>
          <div className="mb-3">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Active Alerts</h2>
          </div>
          <AlertFeed initialAlerts={alerts} clients={clientsForFeed} teamMembers={teamMembers} />
        </div>
      </div>

      {/* ── Row 3: Open tasks + Recent activity ── */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Open Tasks</h2>
            <Link href="/tasks" className="text-xs" style={{ color: 'var(--text-3)' }}>View board →</Link>
          </div>
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {topTasks.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>No open tasks.</p>
                <Link href="/tasks" className="mt-1 inline-block text-xs underline" style={{ color: 'var(--text-1)' }}>Go to board</Link>
              </div>
            ) : (
              <>
                {topTasks.map((task, i) => {
                  const overdue = task.due_date && task.due_date < today
                  const pc: Record<string, string> = { low: '#6b7280', normal: '#3b82f6', high: '#f59e0b', urgent: '#ef4444' }
                  return (
                    <div key={task.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < topTasks.length - 1 ? '1px solid var(--border)' : undefined, background: 'var(--bg-card)' }}>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: pc[task.priority] ?? '#3b82f6' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ color: 'var(--text-1)' }}>{task.title}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                          {task.status.replace('_', ' ')}
                          {task.due_date && <span style={{ color: overdue ? '#ef4444' : 'var(--text-3)', marginLeft: 6 }}>{overdue ? '⚠ ' : ''}Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div className="px-4 py-2" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                  <Link href="/tasks" className="text-xs" style={{ color: 'var(--text-3)' }}>View all {stats.openTasks} tasks →</Link>
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          <div className="mb-3">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Recent Activity</h2>
          </div>
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {activity.length === 0 ? (
              <div className="p-8 text-center"><p className="text-xs" style={{ color: 'var(--text-3)' }}>No recent activity.</p></div>
            ) : activity.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < activity.length - 1 ? '1px solid var(--border)' : undefined, background: 'var(--bg-card)' }}>
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
    </div>
  )
}

function StatCard({ label, value, sub, accent = 'neutral', href }: {
  label: string; value: string; sub: string; accent?: 'green' | 'yellow' | 'red' | 'neutral'; href?: string
}) {
  const subColor = accent === 'green' ? '#16a34a' : accent === 'yellow' ? '#ca8a04' : accent === 'red' ? '#ef4444' : 'var(--text-3)'
  const card = (
    <div className="rounded-lg p-4 transition-all" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
      <p className="text-xs mb-2" style={{ color: 'var(--text-3)' }}>{label}</p>
      <p className="text-2xl font-semibold" style={{ color: 'var(--text-1)' }}>{value}</p>
      <p className="text-[11px] mt-1" style={{ color: subColor }}>{sub}</p>
    </div>
  )
  return href ? <Link href={href} className="block hover:opacity-80 transition-opacity">{card}</Link> : card
}

function RunDot({ status }: { status: string }) {
  const colors: Record<string, string> = { completed: 'bg-green-500', running: 'bg-blue-400 animate-pulse', failed: 'bg-red-500', cancelled: 'bg-zinc-400' }
  return <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors[status] ?? 'bg-zinc-400'}`} />
}
