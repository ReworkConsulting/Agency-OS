import { createServerClient } from '@/lib/supabase/server'
import { getTool } from '@/lib/tool-registry'
import type {
  Client,
  Competitor,
  ICPDocument,
  ClientContext,
  ReviewsSummary,
  CuratedReview,
} from '@/types/client'
import type { ToolDefinition } from '@/types/tool'

/**
 * Loads and assembles all client context needed by a given tool.
 * Only queries what the tool's context_needs declares.
 */
export async function loadClientContext(
  clientSlug: string,
  tool: ToolDefinition
): Promise<ClientContext> {
  const supabase = createServerClient()

  // 1. Fetch the base client record
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('slug', clientSlug)
    .single()

  if (error || !client) {
    throw new Error(`Client not found: ${clientSlug}`)
  }

  const needs = tool.context_needs

  // 2. Fetch conditionally based on what this tool actually needs
  const [competitors, reviews_summary, icp_document] = await Promise.all([
    needs.includes('competitors')
      ? fetchCompetitors(supabase, client.id)
      : Promise.resolve([]),

    needs.includes('reviews')
      ? fetchReviewsSummary(supabase, client.id)
      : Promise.resolve<ReviewsSummary>({
          total_client_reviews: 0,
          average_client_rating: null,
          total_competitor_reviews: 0,
          curated_quotes: [],
        }),

    needs.includes('icp')
      ? fetchCurrentICP(supabase, client.id)
      : Promise.resolve(null),
  ])

  // 3. Render the full context as a structured markdown block
  const context_markdown = renderContextMarkdown({
    client,
    competitors,
    reviews_summary,
    icp_document,
    tool,
  })

  return {
    client,
    competitors,
    reviews_summary,
    icp_document,
    context_markdown,
  }
}

// ---------------------------------------------------------------------------
// Private fetch helpers
// ---------------------------------------------------------------------------

async function fetchCompetitors(
  supabase: ReturnType<typeof createServerClient>,
  clientId: string
): Promise<Competitor[]> {
  const { data } = await supabase
    .from('competitors')
    .select('*')
    .eq('client_id', clientId)
    .order('name')

  return data ?? []
}

async function fetchReviewsSummary(
  supabase: ReturnType<typeof createServerClient>,
  clientId: string
): Promise<ReviewsSummary> {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('client_id', clientId)

  if (!reviews || reviews.length === 0) {
    return {
      total_client_reviews: 0,
      average_client_rating: null,
      total_competitor_reviews: 0,
      curated_quotes: [],
    }
  }

  const client_reviews = reviews.filter((r) => r.source === 'client')
  const competitor_reviews = reviews.filter((r) => r.source === 'competitor')

  const ratings = client_reviews
    .map((r) => r.star_rating)
    .filter((r): r is number => r !== null)

  const average_client_rating =
    ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null

  const curated_quotes: CuratedReview[] = reviews
    .filter((r) => r.is_curated)
    .map((r) => ({
      id: r.id,
      reviewer_name: r.reviewer_name,
      star_rating: r.star_rating,
      review_text: r.review_text,
      platform: r.platform,
      source: r.source as 'client' | 'competitor',
    }))

  return {
    total_client_reviews: client_reviews.length,
    average_client_rating,
    total_competitor_reviews: competitor_reviews.length,
    curated_quotes,
  }
}

async function fetchCurrentICP(
  supabase: ReturnType<typeof createServerClient>,
  clientId: string
): Promise<ICPDocument | null> {
  const { data } = await supabase
    .from('icp_documents')
    .select('*')
    .eq('client_id', clientId)
    .eq('is_current', true)
    .single()

  return data ?? null
}

// ---------------------------------------------------------------------------
// Context markdown renderer
// Produces a structured markdown block injected before the workflow prompt.
// ---------------------------------------------------------------------------

function renderContextMarkdown({
  client,
  competitors,
  reviews_summary,
  icp_document,
  tool,
}: {
  client: Client
  competitors: Competitor[]
  reviews_summary: ReviewsSummary
  icp_document: ICPDocument | null
  tool: ToolDefinition
}): string {
  const lines: string[] = []

  lines.push(`# Client Context: ${client.company_name}`)
  lines.push(``)
  lines.push(`**Slug:** ${client.slug}`)
  lines.push(`**Status:** ${client.status}`)
  lines.push(`**Industry:** ${client.industry ?? 'Not set'}`)
  lines.push(`**Website:** ${client.website_url ?? 'Not set'}`)
  lines.push(`**Google Business Profile:** ${client.gbp_url ?? 'Not set'}`)
  lines.push(`**Owner:** ${client.owner_name ?? 'Not set'}`)
  lines.push(`**Phone:** ${client.phone ?? 'Not set'}`)
  lines.push(`**Email:** ${client.email ?? 'Not set'}`)
  lines.push(`**Address:** ${client.address ?? 'Not set'}`)
  lines.push(`**Time Zone:** ${client.time_zone ?? 'Not set'}`)
  lines.push(``)

  // Service Details
  if (tool.context_needs.includes('services') || tool.context_needs.includes('overview')) {
    lines.push(`## Service Details`)
    lines.push(`**Primary Service:** ${client.primary_service ?? 'Not set'}`)
    lines.push(`**Service Area:** ${client.service_area ?? 'Not set'}`)
    lines.push(`**Average Job Value:** ${client.average_job_value ? `$${client.average_job_value.toLocaleString()}` : 'Not set'}`)
    lines.push(`**Financing:** ${client.financing_available ? `Yes${client.financing_details ? ` — ${client.financing_details}` : ''}` : 'No'}`)
    if (client.services_list && client.services_list.length > 0) {
      lines.push(`**Services Offered:**`)
      client.services_list.forEach((s) => lines.push(`- ${s}`))
    }
    lines.push(``)
  }

  // Marketing Context
  if (tool.context_needs.includes('overview')) {
    lines.push(`## Marketing Context`)
    lines.push(`**Starting Ad Spend:** ${client.starting_ad_spend ? `$${client.starting_ad_spend.toLocaleString()}/mo` : 'Not set'}`)
    lines.push(`**Biggest Challenge:** ${client.biggest_marketing_challenge ?? 'Not set'}`)
    lines.push(`**Ideal Client:** ${client.ideal_client_description ?? 'Not set'}`)
    lines.push(`**6–12 Month Goal:** ${client.main_goal ?? 'Not set'}`)
    lines.push(``)
  }

  // Social Media
  const socials = [
    client.facebook_url && `Facebook: ${client.facebook_url}`,
    client.instagram_url && `Instagram: ${client.instagram_url}`,
    client.youtube_url && `YouTube: ${client.youtube_url}`,
    client.tiktok_url && `TikTok: ${client.tiktok_url}`,
    client.linkedin_url && `LinkedIn: ${client.linkedin_url}`,
  ].filter(Boolean)

  if (socials.length > 0) {
    lines.push(`## Social Media`)
    socials.forEach((s) => lines.push(`- ${s}`))
    lines.push(``)
  }

  // Competitors
  if (tool.context_needs.includes('competitors') && competitors.length > 0) {
    lines.push(`## Known Competitors`)
    competitors.forEach((c) => {
      const parts = [c.name]
      if (c.gbp_url) parts.push(`GBP: ${c.gbp_url}`)
      if (c.website_url) parts.push(`Website: ${c.website_url}`)
      lines.push(`- ${parts.join(' | ')}`)
    })
    lines.push(``)
  }

  // Reviews Summary
  if (tool.context_needs.includes('reviews')) {
    lines.push(`## Review Data`)
    lines.push(`- Client reviews collected: ${reviews_summary.total_client_reviews}`)
    if (reviews_summary.average_client_rating !== null) {
      lines.push(`- Average client rating: ${reviews_summary.average_client_rating} / 5`)
    }
    lines.push(`- Competitor reviews collected: ${reviews_summary.total_competitor_reviews}`)
    if (reviews_summary.curated_quotes.length > 0) {
      lines.push(``)
      lines.push(`### Curated Review Quotes`)
      reviews_summary.curated_quotes.slice(0, 10).forEach((q) => {
        lines.push(`> "${q.review_text}"`)
        const meta = [
          q.reviewer_name,
          q.star_rating ? `${q.star_rating}★` : null,
          q.platform,
          q.source === 'competitor' ? `(competitor)` : null,
        ].filter(Boolean).join(' · ')
        if (meta) lines.push(`— ${meta}`)
        lines.push(``)
      })
    }
    lines.push(``)
  }

  // ICP Document (full text, for tools that need it)
  if (tool.context_needs.includes('icp') && icp_document) {
    lines.push(`## ICP Document (Current — v${icp_document.version})`)
    lines.push(`*Confidence: ${icp_document.confidence_level ?? 'Unknown'} | Created: ${new Date(icp_document.created_at).toLocaleDateString()}*`)
    lines.push(``)
    lines.push(icp_document.icp_content)
    lines.push(``)
  } else if (tool.context_needs.includes('icp') && !icp_document) {
    lines.push(`## ICP Document`)
    lines.push(`*No ICP document exists yet for this client.*`)
    lines.push(``)
  }

  // Interview Transcript
  if (tool.context_needs.includes('transcript') && client.interview_transcript) {
    lines.push(`## Interview Transcript (Owner — Grill Them)`)
    lines.push(client.interview_transcript)
    lines.push(``)
  } else if (tool.context_needs.includes('transcript') && !client.interview_transcript) {
    lines.push(`## Interview Transcript`)
    lines.push(`*No interview transcript available for this client.*`)
    lines.push(``)
  }

  return lines.join('\n')
}

/**
 * Convenience: load context using just a tool ID string.
 */
export async function loadClientContextByToolId(
  clientSlug: string,
  toolId: string
): Promise<ClientContext> {
  const tool = getTool(toolId)
  if (!tool) throw new Error(`Unknown tool: ${toolId}`)
  return loadClientContext(clientSlug, tool)
}
