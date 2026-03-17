import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const { allowed_tools, client_access, allowed_clients, allowed_menus } = body

    const db = createServerClient()
    const { data, error } = await db
      .from('user_profiles')
      .update({
        allowed_tools: allowed_tools ?? [],
        client_access: client_access ?? 'all',
        allowed_clients: allowed_clients ?? [],
        allowed_menus: allowed_menus ?? [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ user: data })
  } catch (e) {
    if (e instanceof Response) return e
    return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 })
  }
}
