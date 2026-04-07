import { createServerClient } from '@/lib/supabase/server'
import { KpiForm } from '@/components/kpis/KpiForm'
import { KpiSnapshot } from '@/components/kpis/KpiChart'
import { notFound } from 'next/navigation'

async function getKpiData(slug: string) {
  try {
    const supabase = createServerClient()

    const { data: client } = await supabase
      .from('clients')
      .select('id, slug, company_name')
      .eq('slug', slug)
      .single()

    if (!client) return null

    // Last 6 months of KPI data
    const since = new Date()
    since.setMonth(since.getMonth() - 6)
    const sinceStr = `${since.getFullYear()}-${String(since.getMonth() + 1).padStart(2, '0')}-01`

    const { data: snapshots } = await supabase
      .from('kpi_snapshots')
      .select('*')
      .eq('client_id', client.id)
      .gte('period', sinceStr)
      .order('period', { ascending: true })

    return { client, snapshots: (snapshots ?? []) as KpiSnapshot[] }
  } catch {
    return null
  }
}

export default async function ClientKpisPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getKpiData(slug)
  if (!data) notFound()

  const { client, snapshots } = data

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-1)' }}>KPI Tracking</h1>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>{client.company_name} · Monthly performance</p>
      </div>

      <KpiForm
        clientId={client.id}
        clientSlug={client.slug}
        initialSnapshots={snapshots}
      />
    </div>
  )
}
