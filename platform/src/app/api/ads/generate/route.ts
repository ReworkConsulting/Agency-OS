import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { streamClaudeResponse } from '@/lib/claude/client'
import { loadClientContext } from '@/lib/context-loader'
import { generateAdsTool } from '@/lib/tool-registry/tools/generate-ads'
import { getTool } from '@/lib/tool-registry'
import { generateAdImagesBatch, type AdSize } from '@/lib/image-generator'
import { loadWorkflowMarkdown } from '@/lib/workflow-runner/loader'

export const runtime = 'nodejs'
export const maxDuration = 300

interface AdGenerateRequest {
  client_slug: string
  target_service: string
  campaign_objective: string
  angle: string
  visual_style: string
  ad_size: AdSize
  ad_count: string
  messaging_focus?: string
  reference_image_url?: string
}

interface ParsedAd {
  hook: string
  primary_text: string
  headline: string
  cta: string
  image_prompt: string
}

function parseAdsFromOutput(output: string): ParsedAd[] {
  const ads: ParsedAd[] = []
  const adBlocks = output.split('---AD_START---').slice(1)

  for (const block of adBlocks) {
    const content = block.split('---AD_END---')[0] ?? ''

    const extract = (field: string): string => {
      const match = content.match(new RegExp(`${field}:\\s*(.+?)(?=\\n[A-Z_]+:|$)`, 's'))
      return match?.[1]?.trim() ?? ''
    }

    const hook = extract('HOOK')
    const primary_text = extract('PRIMARY_TEXT')
    const headline = extract('HEADLINE')
    const cta = extract('CTA')
    const image_prompt = extract('IMAGE_PROMPT')

    if (hook && primary_text) {
      ads.push({ hook, primary_text, headline, cta, image_prompt })
    }
  }

  return ads
}

/**
 * Build the ad-specific system prompt.
 * Identical structure to the generic workflow runner prompt so the workflow
 * markdown file drives the output format — the route never hardcodes it.
 */
function buildSystemPrompt(
  workflowMarkdown: string,
  clientContextMarkdown: string,
  inputs: Record<string, string>
): string {
  const inputLines = Object.entries(inputs)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n')

  return `You are the Agency OS AI — an expert Facebook ad creative strategist for Rework Consulting, a performance marketing agency specializing in local home service businesses (HVAC, roofing, solar, siding, pest control, etc.).

Your role is to execute the workflow instructions below precisely. Use the client context as your knowledge base. Do not ask for information already present in the context.

---

## WORKFLOW INSTRUCTIONS
${workflowMarkdown}

---

## CLIENT CONTEXT (loaded from database)
${clientContextMarkdown}

---

## CAMPAIGN INPUTS FOR THIS RUN
${inputLines}

---

Follow the workflow instructions exactly. Produce the structured output with all ${inputs.ad_count} ad variations. Do not truncate.`
}

function encodeEvent(event: Record<string, unknown>): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

export async function POST(request: NextRequest) {
  let body: AdGenerateRequest

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const {
    client_slug,
    target_service,
    campaign_objective,
    angle,
    visual_style,
    ad_size,
    ad_count,
    messaging_focus,
    reference_image_url,
  } = body

  if (!client_slug || !target_service || !campaign_objective || !angle || !visual_style || !ad_size) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(encodeEvent(event)))
      }

      const supabase = createServerClient()

      try {
        // 1. Enforce prerequisites via the tool registry
        //    generate_ads requires build_icp to have run first.
        const tool = getTool('generate_ads')!

        const { data: clientRecord } = await supabase
          .from('clients')
          .select('id, company_name')
          .eq('slug', client_slug)
          .single()

        if (!clientRecord) {
          throw new Error(`Client not found: ${client_slug}`)
        }

        if (tool.prerequisites && tool.prerequisites.length > 0) {
          const unmet: string[] = []
          for (const prereqId of tool.prerequisites) {
            if (prereqId === 'build_icp') {
              const { data: icp } = await supabase
                .from('icp_documents')
                .select('id')
                .eq('client_id', clientRecord.id)
                .eq('is_current', true)
                .limit(1)
                .single()

              if (!icp) {
                unmet.push(getTool(prereqId)?.label ?? prereqId)
              }
            }
          }

          if (unmet.length > 0) {
            throw new Error(
              `Cannot generate ads — the following must be completed first for ${clientRecord.company_name}: ${unmet.join(', ')}.`
            )
          }
        }

        // 2. Load client context via shared context loader
        enqueue({ type: 'status', stage: 'context', message: 'Loading client context...' })
        const clientContext = await loadClientContext(client_slug, generateAdsTool)

        // 3. Load workflow markdown + hash via shared loader
        const { content: workflowMarkdown, hash: workflowFileHash } =
          await loadWorkflowMarkdown(generateAdsTool.workflow_file)

        // 4. Create workflow run record
        const model = generateAdsTool.model ?? 'claude-sonnet-4-6'
        const max_tokens = generateAdsTool.max_tokens ?? 16000

        const { data: run } = await supabase
          .from('workflow_runs')
          .insert({
            client_id: clientContext.client.id,
            workflow_id: 'generate_ads',
            tool_id: 'generate_ads',
            status: 'running',
            inputs: { target_service, campaign_objective, angle, visual_style, ad_size, ad_count, messaging_focus },
            model,
            workflow_file: generateAdsTool.workflow_file,
            workflow_file_hash: workflowFileHash,
          })
          .select()
          .single()

        const runId = run?.id

        // 5. Build system prompt using shared helper structure
        const inputs: Record<string, string> = {
          target_service,
          campaign_objective,
          angle,
          visual_style,
          ad_size,
          ad_count: ad_count ?? '5',
          ...(messaging_focus ? { messaging_focus } : {}),
          ...(reference_image_url ? { reference_image_url } : {}),
        }

        const systemPrompt = buildSystemPrompt(
          workflowMarkdown,
          clientContext.context_markdown,
          inputs
        )

        // 6. Stream Claude response via shared client
        enqueue({ type: 'status', stage: 'copy', message: 'Generating ad copy and image prompts...' })

        let fullOutput = ''
        let tokensUsed = 0

        const { total_tokens } = await streamClaudeResponse(
          systemPrompt,
          'Generate the Facebook ad variations now following the workflow instructions exactly.',
          (chunk) => {
            fullOutput += chunk
            enqueue({ type: 'chunk', text: chunk })
          },
          { model, maxTokens: max_tokens }
        )
        tokensUsed = total_tokens

        // 7. Parse structured output
        const parsedAds = parseAdsFromOutput(fullOutput)

        if (parsedAds.length === 0) {
          throw new Error('Claude did not produce parseable ad output. Check the workflow format.')
        }

        enqueue({
          type: 'status',
          stage: 'images',
          message: `Generating ${parsedAds.length} ad image${parsedAds.length !== 1 ? 's' : ''}...`,
          total: parsedAds.length,
        })

        // 8. Generate images in parallel via FAL AI
        const imagePrompts = parsedAds.map((ad) => ad.image_prompt)
        const imageResults = await generateAdImagesBatch(imagePrompts, ad_size as AdSize)

        // 9. Persist ad_creatives rows
        const insertRows = parsedAds.map((ad, i) => ({
          client_id: clientContext.client.id,
          workflow_run_id: runId ?? null,
          target_service,
          campaign_objective,
          angle,
          visual_style,
          ad_size,
          hook: ad.hook,
          primary_text: ad.primary_text,
          headline: ad.headline,
          cta: ad.cta,
          image_prompt: ad.image_prompt,
          image_url: imageResults[i]?.url ?? null,
          image_status: imageResults[i]?.url ? 'complete' : 'failed',
          reference_image_url: reference_image_url ?? null,
        }))

        const { data: creatives } = await supabase
          .from('ad_creatives')
          .insert(insertRows)
          .select('id, hook, primary_text, headline, cta, image_url, image_status, angle, visual_style, ad_size')

        // 10. Save full Claude output to workflow_outputs
        await supabase.from('workflow_outputs').insert({
          run_id: runId ?? null,
          client_id: clientContext.client.id,
          workflow_id: 'generate_ads',
          output_markdown: fullOutput,
          output_type: 'ads',
          saved_to: 'ad_creatives',
          metadata: { tokens_used: tokensUsed, ad_count: parsedAds.length },
        })

        // 11. Mark run complete
        if (runId) {
          await supabase
            .from('workflow_runs')
            .update({ status: 'completed', completed_at: new Date().toISOString(), tokens_used: tokensUsed })
            .eq('id', runId)
        }

        enqueue({
          type: 'complete',
          creatives: creatives ?? [],
          ad_count: parsedAds.length,
        })
      } catch (err) {
        enqueue({
          type: 'error',
          message: err instanceof Error ? err.message : String(err),
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
