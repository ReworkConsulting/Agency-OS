import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ClientNav } from '@/components/layout/ClientNav'
import { VideosPageClient } from './VideosPageClient'

export default async function VideosPage({
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

  const [icpResult, scriptsResult] = await Promise.all([
    supabase
      .from('icp_documents')
      .select('id')
      .eq('client_id', client.id)
      .eq('is_current', true)
      .maybeSingle(),

    supabase
      .from('video_scripts')
      .select('id, hook_text, body_text, cta_text, broll_notes, director_note, word_count, script_length, script_style, audience_type, output_type, status, is_winner, created_at')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  return (
    <div className="animate-fade-in">
      <div className="px-8 pt-8 pb-0">
        <div className="mb-5">
          <p className="text-xs text-zinc-600 mb-1">Videos</p>
          <h1 className="text-xl font-semibold text-white">{client.company_name}</h1>
        </div>
        <ClientNav slug={slug} />
      </div>
      <VideosPageClient
        slug={slug}
        primaryService={client.primary_service}
        hasIcp={!!icpResult.data}
        initialScripts={scriptsResult.data ?? []}
      />
    </div>
  )
}
