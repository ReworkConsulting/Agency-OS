import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  let body: { icp_content: string; confidence_level?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.icp_content?.trim()) {
    return Response.json({ error: 'icp_content is required' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!client) {
    return Response.json({ error: 'Client not found' }, { status: 404 })
  }

  // Get current max version
  const { data: versions } = await supabase
    .from('icp_documents')
    .select('version')
    .eq('client_id', client.id)
    .order('version', { ascending: false })
    .limit(1)

  const nextVersion = (versions?.[0]?.version ?? 0) + 1

  // Mark existing as not current
  await supabase
    .from('icp_documents')
    .update({ is_current: false })
    .eq('client_id', client.id)
    .eq('is_current', true)

  // Insert new ICP
  const { data: newIcp, error } = await supabase
    .from('icp_documents')
    .insert({
      client_id: client.id,
      version: nextVersion,
      icp_content: body.icp_content.trim(),
      confidence_level: body.confidence_level ?? 'High',
      is_current: true,
      source_materials: ['manual_import'],
      has_transcript: false,
    })
    .select('id, version, confidence_level, created_at')
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(newIcp)
}
