import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ClientNav } from '@/components/layout/ClientNav'
import { ToolComingSoon } from '@/components/workflow/ToolComingSoon'

export default async function SeoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createServerClient()
  const { data: client } = await supabase
    .from('clients')
    .select('id, company_name')
    .eq('slug', slug)
    .single()

  if (!client) notFound()

  return (
    <div className="">
      <div className="px-8 pt-8 pb-0">
        <div className="mb-5">
          <p className="text-xs text-zinc-600 mb-1">SEO</p>
          <h1 className="text-xl font-semibold text-white">{client.company_name}</h1>
        </div>
        <ClientNav slug={slug} />
      </div>
      <ToolComingSoon
        title="SEO Audit"
        description="Crawl the client's website, benchmark against local competitors, and produce an actionable keyword and content strategy based on service area and ICP data."
        icon={<TrendingIcon />}
        features={[
          'Crawl website and identify on-page SEO gaps',
          'Keyword research targeting service area + primary service',
          'Competitor keyword gap analysis',
          'GBP optimization checklist',
          'Priority page and content recommendations',
          'Export as formatted audit report',
        ]}
        prerequisites={[
          'Website URL in client profile',
          'GBP URL in client profile',
          'Competitor list populated (run Research first)',
        ]}
      />
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
