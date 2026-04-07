import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createServerClient()
    const body = await req.json()

    // If resolving, stamp the time
    const updates: Record<string, unknown> = { ...body }
    if (body.status === 'resolved' && !body.resolved_at) {
      updates.resolved_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('alerts')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        clients(id, slug, company_name, logo_url),
        assignee:assigned_to(id, raw_user_meta_data)
      `)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error('[PATCH /api/alerts/[id]]', err)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createServerClient()
    const { error } = await supabase.from('alerts').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/alerts/[id]]', err)
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 })
  }
}
