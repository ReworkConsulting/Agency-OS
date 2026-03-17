import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { ClientUpdate } from '@/types/client'

// GET /api/clients/[slug] — fetch full client record with competitors and current ICP status
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = createServerClient()

  const [clientResult, competitorsResult, icpResult, reviewCountResult] =
    await Promise.all([
      supabase.from('clients').select('*').eq('slug', slug).single(),

      supabase
        .from('competitors')
        .select('*')
        .eq(
          'client_id',
          supabase
            .from('clients')
            .select('id')
            .eq('slug', slug)
            .single() as unknown as string
        ),

      supabase
        .from('icp_documents')
        .select('id, version, is_current, created_at, confidence_level')
        .eq('is_current', true),

      supabase.from('reviews').select('id', { count: 'exact', head: true }),
    ])

  if (clientResult.error || !clientResult.data) {
    return Response.json({ error: 'Client not found' }, { status: 404 })
  }

  const client = clientResult.data

  // Re-fetch competitors and ICP using the resolved client id
  const [competitors, icp, reviewCount] = await Promise.all([
    supabase
      .from('competitors')
      .select('*')
      .eq('client_id', client.id)
      .order('name'),

    supabase
      .from('icp_documents')
      .select('id, version, is_current, created_at, confidence_level, has_transcript')
      .eq('client_id', client.id)
      .eq('is_current', true)
      .maybeSingle(),

    supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', client.id),
  ])

  return Response.json({
    client,
    competitors: competitors.data ?? [],
    icp_document: icp.data ?? null,
    review_count: reviewCount.count ?? 0,
  })
}

// PUT /api/clients/[slug] — update client fields
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  let body: ClientUpdate

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Prevent updating slug or id
  delete (body as Record<string, unknown>).id
  delete (body as Record<string, unknown>).slug
  delete (body as Record<string, unknown>).created_at

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('clients')
    .update(body)
    .eq('slug', slug)
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return Response.json({ error: 'Client not found' }, { status: 404 })
  }

  return Response.json({ client: data })
}
