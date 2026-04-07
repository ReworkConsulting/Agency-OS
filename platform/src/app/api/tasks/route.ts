import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('client_id')
    const assignedTo = searchParams.get('assigned_to')

    let query = supabase
      .from('tasks')
      .select(`
        *,
        clients(id, slug, company_name, logo_url),
        assignee:assigned_to(id, raw_user_meta_data)
      `)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (clientId) query = query.eq('client_id', clientId)
    if (assignedTo) query = query.eq('assigned_to', assignedTo)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('[GET /api/tasks]', err)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await req.json()
    const { title, description, status, priority, assigned_to, client_id, due_date, tags } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Get current user from header (injected by middleware)
    const createdBy = req.headers.get('x-user-id') ?? undefined

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: title.trim(),
        description: description ?? null,
        status: status ?? 'inbox',
        priority: priority ?? 'normal',
        assigned_to: assigned_to ?? null,
        client_id: client_id ?? null,
        due_date: due_date ?? null,
        tags: tags ?? [],
        created_by: createdBy ?? null,
      })
      .select(`
        *,
        clients(id, slug, company_name, logo_url),
        assignee:assigned_to(id, raw_user_meta_data)
      `)
      .single()

    if (error) throw error

    // Log activity
    if (data) {
      await supabase.from('task_activities').insert({
        task_id: data.id,
        actor_id: createdBy ?? null,
        activity_type: 'created',
        message: `Task created`,
      })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('[POST /api/tasks]', err)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
