import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const supabase = createServerClient()

  // Fetch the script to get client_id
  const { data: script } = await supabase
    .from('video_scripts')
    .select('client_id')
    .eq('id', id)
    .single()

  if (!script) {
    return Response.json({ error: 'Script not found' }, { status: 404 })
  }

  const { error } = await supabase.from('script_feedback').insert({
    script_id: id,
    client_id: script.client_id,
    score_hook: body.score_hook ?? null,
    score_body: body.score_body ?? null,
    score_cta: body.score_cta ?? null,
    score_voice: body.score_voice ?? null,
    score_overall: body.score_overall ?? null,
    what_worked: body.what_worked ?? null,
    what_failed: body.what_failed ?? null,
    suggested_edits: body.suggested_edits ?? null,
    action_taken: body.action_taken ?? null,
  })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
