import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ClientNav } from '@/components/layout/ClientNav'
import { WorkflowPanel } from '@/components/workflow/WorkflowPanel'
import { IcpDocument } from '@/components/workflow/IcpDocument'
import { IcpImport } from '@/components/workflow/IcpImport'
import { buildIcpTool } from '@/lib/tool-registry/tools/build-icp'

async function getResearchData(slug: string) {
  const supabase = createServerClient()

  const { data: client } = await supabase
    .from('clients')
    .select('id, company_name, logo_url, brand_primary_color, brand_secondary_color, website_url, gbp_url, interview_transcript_available')
    .eq('slug', slug)
    .single()

  if (!client) return null

  const [icpCurrent, icpAll, outputsResult, exportsResult] = await Promise.all([
    // Current ICP
    supabase
      .from('icp_documents')
      .select('id, version, created_at, confidence_level, icp_content, source_materials, has_transcript')
      .eq('client_id', client.id)
      .eq('is_current', true)
      .maybeSingle(),

    // All ICP versions (for history selector)
    supabase
      .from('icp_documents')
      .select('id, version, created_at, confidence_level, icp_content, source_materials, has_transcript')
      .eq('client_id', client.id)
      .order('version', { ascending: false }),

    // Workflow output history
    supabase
      .from('workflow_outputs')
      .select('id, created_at, output_markdown, output_type, workflow_runs!inner(status, started_at, completed_at)')
      .eq('client_id', client.id)
      .eq('workflow_id', 'build_icp')
      .order('created_at', { ascending: false })
      .limit(10),

    // PDF exports
    supabase
      .from('icp_exports')
      .select('id, format, file_url, created_at, icp_document_id')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return {
    client,
    icp: icpCurrent.data,
    allVersions: icpAll.data ?? [],
    outputs: outputsResult.data ?? [],
    exports: exportsResult.data ?? [],
  }
}

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getResearchData(slug)

  if (!data) notFound()

  const { client, icp, allVersions, outputs, exports: icpExports } = data

  const prefills: Record<string, string> = {}
  if (client.website_url) prefills.website_url = client.website_url
  if (client.gbp_url) prefills.gbp_url = client.gbp_url

  return (
    <div className="">
      {/* Header */}
      <div className="px-8 pt-8 pb-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>Research</p>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>{client.company_name}</h1>
          </div>
          {icp && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
              style={{
                background: 'rgba(34,197,94,0.06)',
                border: '1px solid rgba(34,197,94,0.15)',
                color: '#16a34a',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              ICP v{icp.version} — {icp.confidence_level ?? 'Unknown'} confidence
              {allVersions.length > 1 && (
                <span className="ml-1 opacity-70">· {allVersions.length} versions</span>
              )}
            </div>
          )}
        </div>
        <ClientNav slug={slug} />
      </div>

      {/* Content */}
      <div className="p-8">
        {icp ? (
          <div className="grid grid-cols-5 gap-6">
            {/* ICP Document (left 60%) */}
            <div className="col-span-3">
              <IcpDocument
                icp={icp}
                allVersions={allVersions}
                clientName={client.company_name}
                logoUrl={client.logo_url}
                brandPrimaryColor={client.brand_primary_color}
                brandSecondaryColor={client.brand_secondary_color}
                clientSlug={slug}
              />
            </div>

            {/* Run panel + exports (right 40%) */}
            <div className="col-span-2 space-y-6">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--text-3)' }}>
                  Re-run Research
                </p>
                <WorkflowPanel
                  tool={buildIcpTool}
                  clientSlug={slug}
                  prefills={prefills}
                  initialOutputs={outputs as unknown as Parameters<typeof WorkflowPanel>[0]['initialOutputs']}
                  compact
                />
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--text-3)' }}>
                  Import ICP
                </p>
                <IcpImport clientSlug={slug} />
              </div>

              {/* Export history */}
              {icpExports.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--text-3)' }}>
                    Exported PDFs
                  </p>
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
                  >
                    {icpExports.map((exp, i) => (
                      <a
                        key={exp.id}
                        href={exp.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-opacity-50"
                        style={{
                          borderBottom: i < icpExports.length - 1 ? '1px solid var(--border-dim)' : 'none',
                          color: 'var(--text-2)',
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-4)' }}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
                            {exp.format}
                          </span>
                          <span className="text-[11px]">
                            {new Date(exp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-4)' }}>
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* No ICP yet */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-4"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-4)' }} />
                No ICP document yet
              </div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-1)' }}>
                Build the ICP Document
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                Run the ICP Research workflow to scrape reviews, analyze competitors, and generate
                a six-profile ideal customer document for {client.company_name}.
              </p>
            </div>
            <WorkflowPanel
              tool={buildIcpTool}
              clientSlug={slug}
              prefills={prefills}
              initialOutputs={outputs as unknown as Parameters<typeof WorkflowPanel>[0]['initialOutputs']}
            />
            <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-dim)' }}>
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-3)' }}>
                Already have an ICP?
              </p>
              <IcpImport clientSlug={slug} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
