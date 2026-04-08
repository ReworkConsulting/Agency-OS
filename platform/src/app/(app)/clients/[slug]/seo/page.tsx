import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ClientNav } from '@/components/layout/ClientNav'
import { WorkflowPanel } from '@/components/workflow/WorkflowPanel'
import { ToolComingSoon } from '@/components/workflow/ToolComingSoon'
import { SeoAuditDocument } from '@/components/workflow/SeoAuditDocument'
import { seoAuditTool } from '@/lib/tool-registry/tools/seo-audit'

async function getSeoData(slug: string) {
  const supabase = createServerClient()

  const { data: client } = await supabase
    .from('clients')
    .select('id, company_name, logo_url, brand_primary_color, brand_secondary_color, website_url, gbp_url')
    .eq('slug', slug)
    .single()

  if (!client) return null

  const [outputsResult, exportsResult] = await Promise.all([
    // All SEO audit outputs — ascending so V1 = index 0
    supabase
      .from('workflow_outputs')
      .select('id, created_at, output_markdown, output_type, workflow_runs!inner(status, started_at, completed_at)')
      .eq('client_id', client.id)
      .eq('workflow_id', 'seo_audit')
      .order('created_at', { ascending: true }),

    // SEO audit exports for download history
    supabase
      .from('seo_audit_exports')
      .select('id, format, file_url, created_at, output_id')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return {
    client,
    outputs: outputsResult.data ?? [],
    exports: exportsResult.data ?? [],
  }
}

export default async function SeoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getSeoData(slug)

  if (!data) notFound()

  const { client, outputs, exports: seoExports } = data
  const hasOutputs = outputs.length > 0

  const prefills: Record<string, string> = {}
  if (client.website_url) prefills.website_url = client.website_url
  if (client.gbp_url) prefills.gbp_url = client.gbp_url

  // For WorkflowPanel initial outputs — it expects DESC order
  const outputsDesc = [...outputs].reverse()

  const comingSoonModules = (
    <>
      <div>
        <p className="text-[10px] font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--text-3)' }}>
          2 — Site Structure Generator
        </p>
        <ToolComingSoon
          title="Site Structure Generator"
          description="Generates a full site architecture — URL map, page hierarchy, and internal linking plan — based on keyword clusters from the SEO audit."
          icon={<SitemapIcon />}
          features={[
            'Categorize and audit every existing page',
            'Recommended URL structure with target keywords',
            'Missing pages priority build queue',
            'Internal linking plan (source → destination → anchor text)',
            'Keyword cannibalization check',
          ]}
          prerequisites={['SEO Audit completed']}
        />
      </div>

      <div>
        <p className="text-[10px] font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--text-3)' }}>
          3 — GBP Optimization
        </p>
        <ToolComingSoon
          title="GBP Optimization"
          description="Audits the Google Business Profile against Local Pack competitors and produces ready-to-use optimization copy, post scripts, and review request templates."
          icon={<MapPinIcon />}
          features={[
            'GBP audit score (0-100)',
            'Category recommendations vs. Local Pack leaders',
            'Optimized GBP description (750 chars)',
            '4 weeks of post copy using client voice',
            'Review request SMS, email, and verbal scripts',
            'Q&A seeding with People Also Ask data',
          ]}
          prerequisites={['SEO Audit completed', 'GBP URL in client profile']}
        />
      </div>

      <div>
        <p className="text-[10px] font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--text-3)' }}>
          4 — SEO Content Engine
        </p>
        <ToolComingSoon
          title="SEO Content Engine"
          description="Produces detailed content briefs for service pages, location pages, and blog posts — grounded in competitor data and the client ICP."
          icon={<DocumentIcon />}
          features={[
            'Service page brief (H1, H2s, title, meta, FAQs, schema)',
            'Location page briefs with city-specific signals',
            'Blog content briefs from informational keyword clusters',
            'People Also Ask integration for FAQ sections',
            'E-E-A-T signal checklist per page',
            'Master content calendar table',
          ]}
          prerequisites={['SEO Audit completed', 'ICP complete']}
        />
      </div>

      <div>
        <p className="text-[10px] font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--text-3)' }}>
          5 — SEO Game Plan
        </p>
        <ToolComingSoon
          title="SEO Game Plan"
          description="Synthesizes all SEO module outputs into one unified execution document: 80/20 priority fixes, 60-day schedule, and VA-ready task breakdown."
          icon={<TrendingIcon />}
          features={[
            'SEO health dashboard (7 categories, traffic-light status)',
            'Top 10 priority fixes ordered by impact-to-effort ratio',
            '60-day week-by-week execution schedule',
            '30-day content calendar',
            'VA-ready task cards (steps, owner, time, done-when)',
          ]}
          prerequisites={['SEO Audit completed', 'At least one other SEO module completed']}
        />
      </div>
    </>
  )

  return (
    <div className="">
      <div className="px-8 pt-10 pb-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-3)' }}>SEO</p>
            <h1 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>{client.company_name}</h1>
          </div>
          {hasOutputs && (
            <div
              className="flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                color: '#16a34a',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              SEO Audit V{outputs.length}
              {outputs.length > 1 && (
                <span className="ml-1 opacity-70">· {outputs.length} versions</span>
              )}
            </div>
          )}
        </div>
        <ClientNav slug={slug} />
      </div>

      <div className="p-8">
        {/* Run order hint */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-md text-[11px] mb-8"
          style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
        >
          <span className="font-semibold uppercase tracking-widest">Run in order:</span>
          <span>SEO Audit → Site Structure → Content Engine + GBP → Game Plan</span>
        </div>

        {hasOutputs ? (
          /* ── State A: Audit exists — two-column layout ── */
          <div className="grid grid-cols-5 gap-6">
            {/* SEO Audit Document (left 60%) */}
            <div className="col-span-3">
              <div className="mb-4">
                <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>
                  1 — SEO Audit
                </p>
              </div>
              <SeoAuditDocument
                outputs={outputs as Parameters<typeof SeoAuditDocument>[0]['outputs']}
                clientName={client.company_name}
                logoUrl={client.logo_url}
                brandPrimaryColor={client.brand_primary_color}
                brandSecondaryColor={client.brand_secondary_color}
                clientSlug={slug}
                exports={seoExports as Parameters<typeof SeoAuditDocument>[0]['exports']}
              />
            </div>

            {/* Right column: re-run panel + coming soon modules */}
            <div className="col-span-2 space-y-8">
              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--text-3)' }}>
                  Re-run SEO Audit
                </p>
                <WorkflowPanel
                  tool={seoAuditTool}
                  clientSlug={slug}
                  prefills={prefills}
                  initialOutputs={outputsDesc as unknown as Parameters<typeof WorkflowPanel>[0]['initialOutputs']}
                  compact
                />
              </div>

              {comingSoonModules}
            </div>
          </div>
        ) : (
          /* ── State B: No audit yet — single column ── */
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--text-3)' }}>
                1 — SEO Audit
              </p>
              <WorkflowPanel
                tool={seoAuditTool}
                clientSlug={slug}
                prefills={prefills}
                initialOutputs={outputsDesc as unknown as Parameters<typeof WorkflowPanel>[0]['initialOutputs']}
              />
            </div>

            {comingSoonModules}
          </div>
        )}
      </div>
    </div>
  )
}

function TrendingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 11l4-4 3 3 4-4 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SitemapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="4" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="6" width="4" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="12" width="4" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="12" width="4" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 4v2.5M8 9v1.5M3 11.5v-3.5M13 11.5v-3.5M8 9H3M8 9h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5C5.51 1.5 3.5 3.51 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.49-2.01-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M9.5 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V5.5L9.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 1.5v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9h5M5.5 11.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
