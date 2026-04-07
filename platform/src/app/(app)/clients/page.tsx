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
        {clients.length === 0 ? (
          <div className="rounded-md p-16 text-center" style={{ border: '1px solid var(--border)' }}>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-2)' }}>No clients yet</p>
            <p className="text-xs mb-5" style={{ color: 'var(--text-3)' }}>Add your first client to get started.</p>
            <Link
              href="/clients/new"
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              Add first client
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.slug}`}
                className="flex flex-col rounded-md overflow-hidden transition-colors duration-150"
                style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--text-4)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                {/* Logo banner */}
                <div
                  className="h-16 flex items-center justify-center px-6"
                  style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}
                >
                  {client.logo_url ? (
                    <Image
                      src={client.logo_url}
                      alt={`${client.company_name} logo`}
                      width={140}
                      height={48}
                      className="object-contain max-h-10 w-auto"
                      unoptimized
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-md flex items-center justify-center"
                      style={{ background: 'var(--bg-hover)' }}
                    >
                      <span className="text-base font-semibold" style={{ color: 'var(--text-3)' }}>
                        {client.company_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex-1 min-w-0 mb-3">
                    <h2 className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>
                      {client.company_name}
                    </h2>
                    {client.owner_name && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>{client.owner_name}</p>
                    )}
                    {client.primary_service && (
                      <p className="text-xs mt-1.5 truncate" style={{ color: 'var(--text-2)' }}>{client.primary_service}</p>
                    )}
                    {client.service_area && (
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-3)' }}>
                        {client.service_area.split('(')[0].trim()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1.5 flex-wrap pt-3" style={{ borderTop: '1px solid var(--border-dim)' }}>
                    {client.industry && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
                      >
                        {client.industry}
                      </span>
                    )}
                    {client.interview_transcript_available && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: '#16a34a' }}
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
    </div>
  )
}
