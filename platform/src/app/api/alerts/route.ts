import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // 'open' | 'acknowledged' | 'resolved' | null (all)
    const clientId = searchParams.get('client_id')
    const includeResolved = searchParams.get('include_resolved') === 'true'

    let query = supabase
      .from('alerts')
      .select(`
        *,
        clients(id, slug, company_name, logo_url),
        assignee:assigned_to(id, raw_user_meta_data),
        creator:created_by(id, raw_user_meta_data)
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    } else if (!includeResolved) {
      query = query.neq('status', 'resolved')
    }

    if (clientId) query = query.eq('client_id', clientId)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('[GET /api/alerts]', err)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await req.json()
    const { title, description, severity, client_id, assigned_to, source_type, source_id } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const createdBy = req.headers.get('x-user-id') ?? undefined

    const { data, error } = await supabase
      .from('alerts')
      .insert({
        title: title.trim(),
        description: description ?? null,
        severity: severity ?? 'warning',
        status: 'open',
        client_id: client_id ?? null,
        assigned_to: assigned_to ?? null,
        source_type: source_type ?? 'manual',
        source_id: source_id ?? null,
        created_by: createdBy ?? null,
      })
      .select(`
        *,
        clients(id, slug, company_name, logo_url),
        assignee:assigned_to(id, raw_user_meta_data)
      `)
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('[POST /api/alerts]', err)
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}
