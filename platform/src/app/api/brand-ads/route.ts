import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const brand_name = searchParams.get('brand_name')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)

  const supabase = createServerClient()

  let query = supabase
    .from('brand_ads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (brand_name) {
    query = query.ilike('brand_name', `%${brand_name}%`)
  }

  const { data, error } = await query

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ads: data ?? [] })
}
