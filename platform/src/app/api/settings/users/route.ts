import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'

export async function GET() {
  try {
    await requireAdmin()
    const db = createServerClient()

    // Get all user profiles
    const { data: profiles, error: profileErr } = await db
      .from('user_profiles')
      .select('*')
      .order('created_at')

    if (profileErr) throw profileErr

    // Get auth users for emails via admin API
    const { data: authData, error: authErr } = await db.auth.admin.listUsers()
    if (authErr) throw authErr

    const authMap = new Map(authData.users.map(u => [u.id, u]))

    const users = (profiles ?? []).map(profile => ({
      ...profile,
      email: authMap.get(profile.id)?.email ?? '',
    }))

    return NextResponse.json({ users })
  } catch (e) {
    if (e instanceof Response) return e
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
  }
}
