import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatDateShort } from '@/lib/format-date'
import { createServerClient } from '@/lib/supabase/server'
import { ClientNav } from '@/components/layout/ClientNav'

async function getClientDashboard(slug: string) {
  const supabase = createServerClient()
  const { data: client, error } = await supabase.from('clients').select('*').eq('slug', slug).single()
  if (error || !client) return null

  const [competitors, icp, reviewCount, recentRuns] = await Promise.all([
    supabase.from('competitors').select('*').eq('client_id', client.id),
    supabase.from('icp_documents').select('id, version, created_at, confidence_level, is_current').eq('client_id', client.id).eq('is_current', true).maybeSingle(),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('client_id', client.id),
    supabase.from('workflow_runs').select('id, tool_id, status, started_at, completed_at').eq('client_id', client.id).order('started_at', { ascending: false }).limit(6),
  ])

  return {
    client,
    competitors: competitors.data ?? [],
    icp: icp.data,
    review_count: reviewCount.count ?? 0,
    recent_runs: recentRuns.data ?? [],
  }
}

export default async function ClientDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getClientDashboard(slug)
  if (!data) notFound()
  const { client, competitors, icp, review_count, recent_runs } = data

  return (
    <div className="">
      {/* Header */}
      <div className="px-8 pt-8 pb-0">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {client.logo_url && (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center p-1.5 shrink-0"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
              >
                <Image src={client.logo_url} alt={client.company_name} width={44} height={44} className="object-contain w-full h-full" unoptimized />
              </div>
            )}
            <div>
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-3)' }}>
                <Link href="/clients" className="transition-colors hover:opacity-70">Clients</Link>
                {' / '}{client.company_name}
              </p>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>{client.company_name}</h1>
              {client.owner_name && <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{client.owner_name}</p>}
            </div>
          </div>
          <Link
            href={`/clients/${slug}/research`}
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            Run Research
          </Link>
        </div>
        <ClientNav slug={slug} />
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Status cards */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <StatusCard label="ICP Document" value={icp ? `v${icp.version}` : 'Not built'} sub={icp ? `${icp.confidence_level ?? 'Unknown'} confidence` : 'Run research to generate'} accent={icp ? 'green' : 'gray'} />
          <StatusCard label="Reviews" value={String(review_count)} sub="scraped reviews" accent={review_count > 0 ? 'green' : 'gray'} />
          <StatusCard label="Competitors" value={String(competitors.length)} sub="tracked" accent={competitors.length > 0 ? 'green' : 'gray'} />
          <StatusCard label="Interview" value={client.interview_transcript_available ? 'Available' : 'Missing'} sub={client.interview_transcript_available ? 'Transcript loaded' : 'Not uploaded'} accent={client.interview_transcript_available ? 'green' : 'yellow'} />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Client Details */}
          <div className="col-span-2 rounded-xl p-6" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            <h2 className="text-[10px] font-bold tracking-widest uppercase mb-5" style={{ color: 'var(--text-3)' }}>Client Details</h2>
            <div className="grid grid-cols-2 gap-x-8">
              <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
                <Detail label="Website" value={client.website_url} link />
                <Detail label="GBP" value={client.gbp_url} link />
                <Detail label="Industry" value={client.industry} />
                <Detail label="Primary Service" value={client.primary_service} />
                <Detail label="Service Area" value={client.service_area} />
              </div>
              <div>
                <Detail label="Avg Job Value" value={client.average_job_value ? `$${Number(client.average_job_value).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : null} />
                <Detail label="Email" value={client.email} />
                <Detail label="Phone" value={client.phone} />
                <Detail label="FB Ad Account" value={client.facebook_ad_account_id} />
                <Detail label="GHL Account" value={client.ghl_sub_account} />
              </div>
            </div>

            {competitors.length > 0 && (
              <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--text-3)' }}>
                  Competitors ({competitors.length})
                </p>
                <div className="space-y-2">
                  {competitors.map((comp) => (
                    <div key={comp.id} className="flex items-center gap-3">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-1)' }}>{comp.name}</span>
                      {comp.website_url && (
                        <a href={comp.website_url} target="_blank" rel="noopener noreferrer" className="text-[10px] transition-opacity hover:opacity-70" style={{ color: 'var(--text-3)' }}>↗ website</a>
                      )}
                      {comp.notes && <span className="text-[10px] truncate max-w-[200px]" style={{ color: 'var(--text-3)' }}>{comp.notes}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--text-3)' }}>Quick Links</p>
              <div className="space-y-1">
                {[
                  { label: 'Run Research', href: `/clients/${slug}/research` },
                  { label: 'Ad Generator', href: `/clients/${slug}/ads` },
                  { label: 'SEO Audit', href: `/clients/${slug}/seo` },
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all"
                    style={{ color: 'var(--text-2)' }}
                  >
                    {item.label}
                    <span style={{ color: 'var(--text-4)' }}>→</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--text-3)' }}>Recent Runs</p>
              {recent_runs.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--text-4)' }}>No workflow runs yet.</p>
              ) : (
                <ul className="space-y-2.5">
                  {recent_runs.map(run => (
                    <li key={run.id} className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <RunDot status={run.status} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: 'var(--text-1)' }}>{run.tool_id.replace(/_/g, ' ')}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                            {formatDateShort(run.started_at)}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] shrink-0 ${
                        run.status === 'completed' ? 'text-green-600' :
                        run.status === 'running' ? 'text-blue-400' :
                        run.status === 'failed' ? 'text-red-400' : ''
                      }`} style={!['completed','running','failed'].includes(run.status) ? { color: 'var(--text-3)' } : undefined}>
                        {run.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: 'green' | 'yellow' | 'gray' }) {
  const dotColor = accent === 'green' ? '#22c55e' : accent === 'yellow' ? '#eab308' : 'var(--text-4)'
  const subColor = accent === 'green' ? '#16a34a' : accent === 'yellow' ? '#ca8a04' : 'var(--text-3)'
  return (
    <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotColor }} />
        <span className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</span>
      </div>
      <p className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>{value}</p>
      <p className="text-[10px] mt-1" style={{ color: subColor }}>{sub}</p>
    </div>
  )
}

function Detail({ label, value, link = false }: { label: string; value: string | null | undefined; link?: boolean }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: '1px solid var(--border-dim)' }}>
      <dt className="text-[10px] font-semibold uppercase tracking-wider w-24 shrink-0 pt-px" style={{ color: 'var(--text-3)' }}>{label}</dt>
      <dd className="text-xs break-all" style={{ color: 'var(--text-1)' }}>
        {link ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity underline decoration-1 underline-offset-2" style={{ color: 'var(--text-2)' }}>
            {value.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </a>
        ) : value}
      </dd>
    </div>
  )
}

function RunDot({ status }: { status: string }) {
  const colors: Record<string, string> = { completed: 'bg-green-500', running: 'bg-blue-400 animate-pulse', failed: 'bg-red-500' }
  return <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1 ${colors[status] ?? ''}`} style={!colors[status] ? { background: 'var(--text-4)' } : undefined} />
}
