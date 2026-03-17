import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ClientNav } from '@/components/layout/ClientNav'
import { AdsPageClient } from './AdsPageClient'

export default async function AdsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createServerClient()

  const { data: client } = await supabase
    .from('clients')
    .select('id, company_name, primary_service')
    .eq('slug', slug)
    .single()

  if (!client) notFound()

  const [icpResult, creativesResult] = await Promise.all([
    supabase
      .from('icp_documents')
      .select('id')
      .eq('client_id', client.id)
      .eq('is_current', true)
      .maybeSingle(),

    supabase
      .from('ad_creatives')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  return (
    <div className="animate-fade-in">
      <div className="px-8 pt-8 pb-0">
        <div className="mb-5">
          <p className="text-xs text-zinc-600 mb-1">Ads</p>
          <h1 className="text-xl font-semibold text-white">{client.company_name}</h1>
        </div>
        <ClientNav slug={slug} />
      </div>
      <AdsPageClient
        slug={slug}
        primaryService={client.primary_service}
        hasIcp={!!icpResult.data}
        initialCreatives={creativesResult.data ?? []}
      />
    </div>
  )
}
