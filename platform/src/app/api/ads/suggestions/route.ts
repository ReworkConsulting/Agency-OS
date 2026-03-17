import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 30

interface AngleSuggestion {
  label: string
  description: string
  angle_type: string
  target_profile: string
}

const MODEL = 'claude-haiku-4-5-20251001'

export async function POST(request: NextRequest) {
  let body: { client_slug: string }

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.client_slug) {
    return Response.json({ error: 'client_slug required' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Load client + ICP
  const { data: client } = await supabase
    .from('clients')
    .select('id, company_name, primary_service, services_list, service_area, ideal_client_description')
    .eq('slug', body.client_slug)
    .single()

  if (!client) {
    return Response.json({ error: 'Client not found' }, { status: 404 })
  }

  const { data: icp } = await supabase
    .from('icp_documents')
    .select('icp_content, confidence_level')
    .eq('client_id', client.id)
    .eq('is_current', true)
    .maybeSingle()

  const contextBlock = buildContext(client, icp?.icp_content ?? null)

  const prompt = `You are a Facebook ad creative strategist. Read the client context below and return 6-8 creative angle suggestions for Facebook ads.

Each suggestion should be a distinct strategic angle — targeting a different persona, pain point, offer type, or emotional trigger. Aim for variety: mix pain-point angles, aspiration angles, offer-led angles, and social proof angles.

${contextBlock}

Return ONLY a valid JSON array. No markdown, no explanation. Format:
[
  {
    "label": "Short angle name (4-8 words)",
    "description": "One sentence on why this angle works for this client",
    "angle_type": "Pain Point | Aspiration | Offer | Social Proof | Urgency | Education",
    "target_profile": "Which ICP profile or customer type this targets"
  }
]`

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''

    // Strip any markdown code fences if present
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const suggestions: AngleSuggestion[] = JSON.parse(cleaned)

    return Response.json({ suggestions })
  } catch (err) {
    console.error('Suggestions error:', err)
    // Return graceful fallback so the UI doesn't break
    return Response.json({
      suggestions: getFallbackSuggestions(client.primary_service),
    })
  }
}

function buildContext(
  client: {
    company_name: string
    primary_service: string | null
    services_list: string[] | null
    service_area: string | null
    ideal_client_description: string | null
  },
  icpContent: string | null
): string {
  const lines: string[] = [
    `Company: ${client.company_name}`,
    `Primary Service: ${client.primary_service ?? 'Not specified'}`,
    `Service Area: ${client.service_area ?? 'Not specified'}`,
  ]

  if (client.services_list?.length) {
    lines.push(`Services: ${client.services_list.join(', ')}`)
  }

  if (client.ideal_client_description) {
    lines.push(`Ideal Client: ${client.ideal_client_description}`)
  }

  if (icpContent) {
    // Trim to avoid hitting token limits — first 3000 chars is enough for angle generation
    const excerpt = icpContent.slice(0, 3000)
    lines.push(`\nICP Summary:\n${excerpt}`)
  }

  return lines.join('\n')
}

function getFallbackSuggestions(service: string | null): AngleSuggestion[] {
  const s = service ?? 'home service'
  return [
    { label: 'Budget-Conscious Homeowner', description: `Lead with savings and ROI for ${s}`, angle_type: 'Offer', target_profile: 'Value-driven homeowners' },
    { label: 'Emergency & Urgency', description: 'Fast response, same-day service, problem solved today', angle_type: 'Urgency', target_profile: 'Homeowners with immediate need' },
    { label: 'Premium Quality', description: 'Position as the best choice, not the cheapest', angle_type: 'Aspiration', target_profile: 'Quality-first buyers' },
    { label: 'Safety & Peace of Mind', description: 'Protect your home and family', angle_type: 'Pain Point', target_profile: 'Safety-conscious homeowners' },
    { label: 'Proven Local Results', description: 'Social proof from neighbors and local reviews', angle_type: 'Social Proof', target_profile: 'Research-driven buyers' },
    { label: 'Education & Awareness', description: 'Teach them about the problem before selling the solution', angle_type: 'Education', target_profile: 'Uninformed homeowners' },
  ]
}
