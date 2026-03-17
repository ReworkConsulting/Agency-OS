import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params
  const { searchParams } = new URL(request.url)
  const clientSlug = searchParams.get('client_slug')

  const supabase = createServerClient()

  let query = supabase
    .from('workflow_outputs')
    .select(`
      id,
      run_id,
      client_id,
      workflow_id,
      created_at,
      output_type,
      saved_to,
      metadata,
      workflow_runs!inner(status, started_at, completed_at, inputs)
    `)
    .eq('workflow_id', workflowId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (clientSlug) {
    // Join through clients table to filter by slug
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('slug', clientSlug)
      .single()

    if (client) {
      query = query.eq('client_id', client.id)
    }
  }

  const { data, error } = await query

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ outputs: data ?? [] })
}
