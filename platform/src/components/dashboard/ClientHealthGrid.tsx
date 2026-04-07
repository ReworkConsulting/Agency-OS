import Link from 'next/link'
import Image from 'next/image'

interface ClientHealth {
  id: string
  slug: string
  company_name: string
  logo_url: string | null
  lastKpiDate: string | null
  lastRunDate: string | null
}

function HealthDot({ client }: { client: ClientHealth }) {
  if (!client.lastRunDate) {
    return <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#ef4444' }} title="No activity" />
  }
  if (!client.lastKpiDate) {
    return <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#f59e0b' }} title="Missing KPI" />
  }
  return <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#22c55e' }} title="Active" />
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ClientHealthGrid({ clients }: { clients: ClientHealth[] }) {
  if (clients.length === 0) {
    return (
      <div className="rounded-lg p-8 text-center" style={{ border: '1px solid var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>No active clients.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      {/* Header row */}
      <div
        className="grid items-center px-4 py-2 text-[10px] font-bold uppercase tracking-wider"
        style={{
          gridTemplateColumns: '1fr 120px 120px',
          background: 'var(--bg-subtle)',
          color: 'var(--text-3)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span>Client</span>
        <span className="text-center">Last KPI</span>
        <span className="text-center">Last Work</span>
      </div>

      {/* Client rows */}
      <div>
        {clients.map((client, i) => (
          <Link
            key={client.id}
            href={`/clients/${client.slug}`}
            className="grid items-center px-4 py-3 transition-all group"
            style={{
              gridTemplateColumns: '1fr 120px 120px',
              background: 'var(--bg-card)',
              borderBottom: i < clients.length - 1 ? '1px solid var(--border)' : undefined,
            }}
          >
            {/* Name + health */}
            <div className="flex items-center gap-2.5 min-w-0">
              <HealthDot client={client} />
              <div
                className="w-6 h-6 rounded flex items-center justify-center overflow-hidden shrink-0"
                style={{ background: 'var(--bg-subtle)' }}
              >
                {client.logo_url
                  ? <Image src={client.logo_url} alt="" width={20} height={20} className="object-contain" unoptimized />
                  : <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)' }}>{client.company_name.charAt(0)}</span>
                }
              </div>
              <span className="text-sm font-medium truncate group-hover:underline" style={{ color: 'var(--text-1)' }}>
                {client.company_name}
              </span>
            </div>

            {/* Last KPI */}
            <div className="text-center">
              <span className="text-xs" style={{ color: client.lastKpiDate ? 'var(--text-2)' : '#f59e0b' }}>
                {formatDate(client.lastKpiDate)}
              </span>
            </div>

            {/* Last Work */}
            <div className="text-center">
              <span className="text-xs" style={{ color: client.lastRunDate ? 'var(--text-2)' : 'var(--text-4)' }}>
                {formatDate(client.lastRunDate)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
