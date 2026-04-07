import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        clients(id, slug, company_name, logo_url),
        assignee:assigned_to(id, raw_user_meta_data),
        task_activities(*, actor:actor_id(id, raw_user_meta_data))
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(data)
  } catch (err) {
    console.error('[GET /api/tasks/[id]]', err)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createServerClient()
    const body = await req.json()
    const actorId = req.headers.get('x-user-id') ?? undefined

    // Fetch current task to detect status change
    const { data: current } = await supabase
      .from('tasks')
      .select('status, assigned_to')
      .eq('id', id)
      .single()

    const { data, error } = await supabase
      .from('tasks')
      .update(body)
      .eq('id', id)
      .select(`
        *,
        clients(id, slug, company_name, logo_url),
        assignee:assigned_to(id, raw_user_meta_data)
      `)
      .single()

    if (error) throw error

    // Log notable changes as activities
    const activities = []
    if (body.status && body.status !== current?.status) {
      activities.push({
        task_id: id,
        actor_id: actorId ?? null,
        activity_type: 'status_changed',
        message: `Status changed from ${current?.status} to ${body.status}`,
      })
    }
    if (body.assigned_to && body.assigned_to !== current?.assigned_to) {
      activities.push({
        task_id: id,
        actor_id: actorId ?? null,
        activity_type: 'assigned',
        message: `Task reassigned`,
      })
    }
    if (activities.length > 0) {
      await supabase.from('task_activities').insert(activities)
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[PATCH /api/tasks/[id]]', err)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/tasks/[id]]', err)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
