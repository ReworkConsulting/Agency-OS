import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { rejection_reason } = await request.json()

  const supabase = createServerClient()

  const { error } = await supabase
    .from('video_scripts')
    .update({ status: 'rejected', rejection_reason: rejection_reason ?? null })
    .eq('id', id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
