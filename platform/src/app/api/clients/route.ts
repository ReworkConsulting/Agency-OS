import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { ClientInsert } from '@/types/client'

// GET /api/clients — list all active clients
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'active'

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('clients')
    .select(`
      id, slug, status, created_at, updated_at,
      company_name, owner_name, email, phone,
      website_url, gbp_url, primary_service, service_area,
      industry, logo_url, average_job_value,
      interview_transcript_available
    `)
    .eq('status', status)
    .order('company_name')

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ clients: data ?? [] })
}

// POST /api/clients — create a new client
export async function POST(request: NextRequest) {
  let body: Partial<ClientInsert>

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.company_name) {
    return Response.json({ error: 'company_name is required' }, { status: 400 })
  }

  if (!body.slug) {
    // Auto-generate slug from company name
    body.slug = body.company_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('clients')
    .insert(body)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return Response.json(
        { error: `A client with slug "${body.slug}" already exists.` },
        { status: 409 }
      )
    }
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ client: data }, { status: 201 })
}
