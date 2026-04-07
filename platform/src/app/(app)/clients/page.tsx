import Link from 'next/link'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'

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
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-1)' }}>Clients</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
            {clients.length} active {clients.length === 1 ? 'client' : 'clients'} on retainer
          </p>
        </div>
        <Link
          href="/clients/new"
          className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
          style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
        >
          + New Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-lg p-16 text-center" style={{ border: '1px solid var(--border)' }}>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-4"
            style={{ border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}
          >
            <span style={{ color: 'var(--text-3)', fontSize: 18 }}>◈</span>
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-2)' }}>No clients yet</p>
          <p className="text-xs mb-5" style={{ color: 'var(--text-3)' }}>Add your first client to get started.</p>
          <Link
            href="/clients/new"
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            Add first client
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.slug}`}
              className="flex flex-col rounded-xl overflow-hidden transition-all group"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
            >
              {/* Logo banner */}
              <div
                className="h-24 flex items-center justify-center px-8"
                style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}
              >
                {client.logo_url ? (
                  <Image
                    src={client.logo_url}
                    alt={`${client.company_name} logo`}
                    width={180}
                    height={72}
                    className="object-contain max-h-14 w-auto"
                    unoptimized
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--bg-hover)' }}
                  >
                    <span className="text-xl font-bold" style={{ color: 'var(--text-3)' }}>
                      {client.company_name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)' }}>
                      {client.company_name}
                    </h2>
                    {client.owner_name && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{client.owner_name}</p>
                    )}
                  </div>
                  <span className="text-xs ml-2" style={{ color: 'var(--text-4)' }}>→</span>
                </div>

                <div className="flex-1">
                  {client.primary_service && (
                    <p className="text-xs truncate" style={{ color: 'var(--text-2)' }}>{client.primary_service}</p>
                  )}
                  {client.service_area && (
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-3)' }}>
                      {client.service_area.split('(')[0].trim()}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-3 flex gap-1.5 flex-wrap" style={{ borderTop: '1px solid var(--border)' }}>
                  {client.industry && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded"
                      style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                    >
                      {client.industry}
                    </span>
                  )}
                  {client.interview_transcript_available && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded"
                      style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', color: '#16a34a' }}
                    >
                      interview ✓
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
