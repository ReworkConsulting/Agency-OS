import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ClientNav } from '@/components/layout/ClientNav'
import { ToolComingSoon } from '@/components/workflow/ToolComingSoon'

export default async function BrandPage({
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
          <p className="text-xs text-zinc-600 mb-1">Brand</p>
          <h1 className="text-xl font-semibold text-white">{client.company_name}</h1>
        </div>
        <ClientNav slug={slug} />
      </div>
      <ToolComingSoon
        title="Brand Asset Manager"
        description="Store and manage brand assets — logos, color palettes, fonts — and generate branded creative briefs for campaigns, all in one place."
        icon={<SwatchIcon />}
        features={[
          'Upload and version client logos (PNG, SVG)',
          'Define primary and secondary color palettes with hex codes',
          'Store brand voice and tone guidelines',
          'Generate creative briefs for ad campaigns',
          'Export brand pack as a single reference document',
        ]}
        prerequisites={[
          'Logo file accessible (URL or upload)',
          'Brand color codes from client',
        ]}
      />
    </div>
  )
}

function SwatchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="5" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
