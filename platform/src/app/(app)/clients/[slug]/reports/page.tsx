import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ClientNav } from '@/components/layout/ClientNav'
import { ToolComingSoon } from '@/components/workflow/ToolComingSoon'

export default async function ReportsPage({
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
    <div className="animate-fade-in">
      <div className="px-8 pt-8 pb-0">
        <div className="mb-5">
          <p className="text-xs text-zinc-600 mb-1">Reports</p>
          <h1 className="text-xl font-semibold text-white">{client.company_name}</h1>
        </div>
        <ClientNav slug={slug} />
      </div>
      <ToolComingSoon
        title="Monthly Performance Reports"
        description="Auto-generate client-ready monthly reports from campaign data — formatted with wins, metrics, observations, and next-month strategy recommendations."
        icon={<ChartIcon />}
        features={[
          'Pull ad performance metrics from Facebook Ads Manager',
          'Summarize wins, CPL, ROAS, and spend',
          'Write narrative analysis in plain English',
          'Include next-month priorities and budget recommendations',
          'Branded output ready to send directly to the client',
        ]}
        prerequisites={[
          'Facebook Ad Account ID in client profile',
          'At least one month of active campaign data',
          'ICP document built (for strategy context)',
        ]}
      />
    </div>
  )
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="9" width="3" height="6" rx="1" fill="currentColor" />
      <rect x="6" y="6" width="3" height="9" rx="1" fill="currentColor" />
      <rect x="11" y="3" width="3" height="12" rx="1" fill="currentColor" />
    </svg>
  )
}
