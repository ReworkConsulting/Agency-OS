import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const service = searchParams.get('service')
  const style = searchParams.get('style')
  const objective = searchParams.get('objective')
  const clientSlug = searchParams.get('client_slug')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)

  const supabase = createServerClient()

  let query = supabase
    .from('ad_creatives')
    .select('*, clients!inner(company_name, slug, primary_service)')
    .eq('saved_to_library', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (service) query = query.ilike('target_service', `%${service}%`)
  if (style) query = query.eq('visual_style', style)
  if (objective) query = query.eq('campaign_objective', objective)
  if (clientSlug) {
    // Filter by client slug via join
    query = query.eq('clients.slug', clientSlug)
  }

  const { data, error } = await query

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ads: data ?? [] })
}
