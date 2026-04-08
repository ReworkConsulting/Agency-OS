import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { ClientGrid } from '@/components/clients/ClientGrid'

async function getClients() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('clients')
      .select('id, slug, company_name, owner_name, primary_service, service_area, status, website_url, logo_url, interview_transcript_available, industry')
      .eq('status', 'active')
      .order('company_name')
    if (error) throw error
    return data ?? []
  } catch {
    return []
  }
}

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div>
      {/* Header */}
      <div className="px-8 pt-10 pb-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>Clients</h1>
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>
            {clients.length} active
          </span>
        </div>
        <Link
          href="/clients/new"
          className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
          style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
        >
          + New Client
        </Link>
      </div>

      <div className="p-8">
        <ClientGrid clients={clients} />
      </div>
    </div>
  )
}
