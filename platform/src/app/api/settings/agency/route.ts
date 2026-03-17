import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'

export async function GET() {
  try {
    await requireAdmin()
    const db = createServerClient()
    const { data, error } = await db.from('agency_settings').select('*').single()
    if (error) throw error
    return NextResponse.json({ settings: data })
  } catch (e) {
    if (e instanceof Response) return e
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { agency_name, logo_url, favicon_url, default_theme } = body

    const db = createServerClient()
    const { data, error } = await db
      .from('agency_settings')
      .update({ agency_name, logo_url, favicon_url, default_theme, updated_at: new Date().toISOString() })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ settings: data })
  } catch (e) {
    if (e instanceof Response) return e
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
