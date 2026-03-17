import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { requireAdmin } from '@/lib/supabase/admin-guard'

const PREVIEW_COOKIE = 'agency_os_preview_user'

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const { user_id } = await request.json()
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    cookieStore.set(PREVIEW_COOKIE, user_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    if (e instanceof Response) return e
    return NextResponse.json({ error: 'Failed to set preview' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await requireAdmin()
    const cookieStore = await cookies()
    cookieStore.delete(PREVIEW_COOKIE)
    return NextResponse.json({ success: true })
  } catch (e) {
    if (e instanceof Response) return e
    return NextResponse.json({ error: 'Failed to clear preview' }, { status: 500 })
  }
}
