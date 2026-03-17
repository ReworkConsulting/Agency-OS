import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()

    const db = createServerClient()
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.role !== undefined) updateData.role = body.role
    if (body.full_name !== undefined) updateData.full_name = body.full_name

    const { data, error } = await db
      .from('user_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ user: data })
  } catch (e) {
    if (e instanceof Response) return e
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const db = createServerClient()

    // Delete from auth (cascades to user_profiles via FK)
    const { error } = await db.auth.admin.deleteUser(id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e) {
    if (e instanceof Response) return e
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
