import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const db = createServerClient()
    const { data, error } = await db.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/auth/callback`,
    })

    if (error) throw error

    // Create user_profiles row (role: member by default)
    if (data.user) {
      await db.from('user_profiles').upsert({
        id: data.user.id,
        role: 'member',
      })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    if (e instanceof Response) return e
    const msg = e instanceof Error ? e.message : 'Failed to send invite'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
