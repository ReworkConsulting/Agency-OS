import { NextRequest } from 'next/server'
import { loadClientContextByToolId } from '@/lib/context-loader'
import { getTool } from '@/lib/tool-registry'

// GET /api/clients/[slug]/context?tool_id=build_icp
// Returns the pre-assembled context payload. Useful for debugging and preflight checks.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { searchParams } = new URL(request.url)
  const toolId = searchParams.get('tool_id') ?? 'build_icp'

  const tool = getTool(toolId)
  if (!tool) {
    return Response.json({ error: `Unknown tool: ${toolId}` }, { status: 400 })
  }

  try {
    const context = await loadClientContextByToolId(slug, toolId)

    // Don't send the full interview transcript in this debug endpoint
    return Response.json({
      client_name: context.client.company_name,
      client_slug: context.client.slug,
      tool_id: toolId,
      context_needs: tool.context_needs,
      competitors_count: context.competitors.length,
      reviews_summary: context.reviews_summary,
      has_icp: context.icp_document !== null,
      has_transcript: context.client.interview_transcript_available,
      context_markdown_length: context.context_markdown.length,
      context_markdown_preview: context.context_markdown.slice(0, 500) + '...',
    })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 404 }
    )
  }
}
