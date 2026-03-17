import Link from 'next/link'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import { formatDateShort } from '@/lib/format-date'

async function getDashboardData() {
  try {
    const supabase = createServerClient()
    const [clientsRes, runsRes, outputsRes] = await Promise.all([
      supabase.from('clients').select('id, slug, company_name, logo_url, primary_service, service_area, industry').eq('status', 'active').order('company_name'),
      supabase.from('workflow_runs').select('id, tool_id, status, started_at, client_id, clients!inner(company_name, logo_url)').order('started_at', { ascending: false }).limit(8),
      supabase.from('workflow_outputs').select('id', { count: 'exact', head: true }),
    ])
    return {
      clients: clientsRes.data ?? [],
      recentRuns: runsRes.data ?? [],
      outputCount: outputsRes.count ?? 0,
    }
  } catch {
    return { clients: [], recentRuns: [], outputCount: 0 }
  }
}

const QUICK_ACTIONS = [
  { label: 'Add Client', description: 'Onboard a new client workspace', href: '/clients/new', icon: '＋' },
  { label: 'View All Clients', description: 'See your active client roster', href: '/clients', icon: '◈' },
]

export default async function DashboardPage() {
  const { clients, recentRuns, outputCount } = await getDashboardData()

  const completedRuns = recentRuns.filter(r => r.status === 'completed').length
  const failedRuns = recentRuns.filter(r => r.status === 'failed').length

  return (
    <div className="p-8 max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Dashboard</h1>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>Welcome back to Agency OS.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <StatCard label="Active Clients" value={String(clients.length)} sub="on retainer" />
        <StatCard label="Outputs Generated" value={String(outputCount)} sub="all time" />
        <StatCard label="Recent Runs" value={String(recentRuns.length)} sub="last 8" />
        <StatCard
          label="Success Rate"
          value={recentRuns.length ? `${Math.round((completedRuns / recentRuns.length) * 100)}%` : '—'}
          sub={failedRuns > 0 ? `${failedRuns} failed` : 'clean'}
          accent={failedRuns > 0 ? 'yellow' : 'green'}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Active clients */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Active Clients</h2>
            <Link href="/clients" className="text-xs transition-colors" style={{ color: 'var(--text-3)' }}>
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {clients.length === 0 ? (
              <div className="rounded-lg p-8 text-center" style={{ border: '1px solid var(--border)' }}>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>No clients yet.</p>
                <Link href="/clients/new" className="mt-2 inline-block text-xs underline" style={{ color: 'var(--text-1)' }}>
                  Add first client
                </Link>
              </div>
            ) : clients.map(client => (
              <Link key={client.slug} href={`/clients/${client.slug}`}
                className="flex items-center gap-4 p-4 rounded-lg transition-all group"
                style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden shrink-0"
                  style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
                >
                  {client.logo_url
                    ? <Image src={client.logo_url} alt="" width={32} height={32} className="object-contain p-1" unoptimized />
                    : <span className="text-sm font-bold" style={{ color: 'var(--text-3)' }}>{client.company_name.charAt(0)}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>{client.company_name}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-3)' }}>{client.primary_service ?? client.industry ?? ''}</p>
                </div>
                <div className="text-right shrink-0">
                  {client.service_area && <p className="text-xs truncate max-w-[120px]" style={{ color: 'var(--text-3)' }}>{client.service_area.split('(')[0].trim()}</p>}
                  <span className="text-xs" style={{ color: 'var(--text-4)' }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div>
            <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--text-1)' }}>Quick Actions</h2>
            <div className="space-y-2">
              {QUICK_ACTIONS.map(action => (
                <Link key={action.href} href={action.href}
                  className="flex items-start gap-3 p-3 rounded-lg transition-all group"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
                >
                  <span className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>{action.icon}</span>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-1)' }}>{action.label}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--text-1)' }}>Recent Activity</h2>
            {recentRuns.length === 0 ? (
              <p className="text-xs px-1" style={{ color: 'var(--text-3)' }}>No workflow runs yet.</p>
            ) : (
              <div className="space-y-2">
                {recentRuns.slice(0, 5).map(run => {
                  const client = run.clients as unknown as { company_name: string; logo_url: string | null }
                  return (
                    <div key={run.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-dim)' }}>
                      <RunDot status={run.status} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate" style={{ color: 'var(--text-1)' }}>{run.tool_id.replace(/_/g, ' ')}</p>
                        <p className="text-[11px] truncate" style={{ color: 'var(--text-3)' }}>{client?.company_name}</p>
                      </div>
                      <span className="text-[10px] shrink-0" style={{ color: 'var(--text-4)' }}>
                        {formatDateShort(run.started_at)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, accent = 'neutral' }: {
  label: string; value: string; sub: string; accent?: 'green' | 'yellow' | 'neutral'
}) {
  const subColor = accent === 'green' ? '#16a34a' : accent === 'yellow' ? '#ca8a04' : 'var(--text-3)'
  return (
    <div className="rounded-lg p-4" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
      <p className="text-xs mb-2" style={{ color: 'var(--text-3)' }}>{label}</p>
      <p className="text-2xl font-semibold" style={{ color: 'var(--text-1)' }}>{value}</p>
      <p className="text-[11px] mt-1" style={{ color: subColor }}>{sub}</p>
    </div>
  )
}

function RunDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: 'bg-green-500',
    running: 'bg-blue-400 animate-pulse',
    failed: 'bg-red-500',
    cancelled: 'bg-zinc-400',
  }
  return <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors[status] ?? 'bg-zinc-400'}`} />
}
