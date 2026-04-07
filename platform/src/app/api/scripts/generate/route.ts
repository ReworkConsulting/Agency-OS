import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { streamClaudeResponse } from '@/lib/claude/client'
import { loadClientContext } from '@/lib/context-loader'
import { generateVideoScriptsTool } from '@/lib/tool-registry/tools/generate-video-scripts'
import { getTool } from '@/lib/tool-registry'
import { loadWorkflowMarkdown } from '@/lib/workflow-runner/loader'
import {
  loadReferenceScripts,
  formatReferencesForPrompt,
  formatRejectionContext,
  loadWinningScripts,
  formatWinningScriptsForPrompt,
} from '@/lib/reference-loader'

export const runtime = 'nodejs'
export const maxDuration = 300

type OutputType = 'videos' | 'ad_copy' | 'headlines'

interface ScriptGenerateRequest {
  client_slug: string
  target_service: string
  audience_type: 'B2C' | 'B2B'
  script_goal: string
  script_length: string
  script_style: string
  output_type?: OutputType
  script_count?: string
  specific_offer?: string
  hook_angle?: string
  notes?: string
  include_broll_notes?: boolean
}

interface ParsedScript {
  hook_text: string
  body_text: string
  cta_text: string
  broll_notes: string | null
  director_note: string | null
  full_script_text: string
  word_count: number
  length: string
  style: string
  audience: string
  output_type: OutputType
}

// ── Parser: Videos (---SCRIPT_START--- / ---SCRIPT_END---) ────────────
function parseVideoScripts(output: string): ParsedScript[] {
  const scripts: ParsedScript[] = []
  const blocks = output.split('---SCRIPT_START---').slice(1)

  for (const block of blocks) {
    const content = block.split('---SCRIPT_END---')[0] ?? ''

    const extract = (field: string): string => {
      const match = content.match(new RegExp(`${field}:\\s*(.+?)(?=\\n[A-Z_]+:|---SCRIPT_END|$)`, 's'))
      return match?.[1]?.trim() ?? ''
    }

    const extractMeta = (field: string): string => {
      const match = content.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'))
      return match?.[1]?.trim() ?? ''
    }

    const hook_text = extract('HOOK')
    const body_text = extract('BODY')
    const cta_text = extract('CTA')
    const broll_raw = extract('BROLL_NOTES')
    const director_raw = extract('DIRECTOR_NOTE')
    const length = extractMeta('LENGTH')
    const style = extractMeta('STYLE')
    const audience = extractMeta('AUDIENCE')
    const word_count_raw = extractMeta('WORD_COUNT')

    if (hook_text && body_text) {
      scripts.push({
        hook_text,
        body_text,
        cta_text,
        broll_notes: broll_raw || null,
        director_note: director_raw || null,
        full_script_text: content.trim(),
        word_count: parseInt(word_count_raw, 10) || 0,
        length,
        style,
        audience,
        output_type: 'videos',
      })
    }
  }

  return scripts
}

// ── Parser: Ad Copy (---COPY_START--- / ---COPY_END---) ───────────────
function parseAdCopy(output: string): ParsedScript[] {
  const scripts: ParsedScript[] = []
  const blocks = output.split('---COPY_START---').slice(1)

  for (const block of blocks) {
    const content = block.split('---COPY_END---')[0] ?? ''

    const extract = (field: string): string => {
      const match = content.match(new RegExp(`${field}:\\s*(.+?)(?=\\n[A-Z_]+:|---COPY_END|$)`, 's'))
      return match?.[1]?.trim() ?? ''
    }

    const extractMeta = (field: string): string => {
      const match = content.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'))
      return match?.[1]?.trim() ?? ''
    }

    const primary_text = extract('PRIMARY_TEXT')
    const headline = extract('HEADLINE')
    const cta = extract('CTA')
    const style = extractMeta('STYLE')
    const audience = extractMeta('AUDIENCE')

    // Split primary_text: first paragraph → hook_text, rest → body_text
    const paragraphs = primary_text.split(/\n\n+/)
    const hook_text = paragraphs[0] ?? primary_text
    const body_text = paragraphs.slice(1).join('\n\n')

    if (primary_text) {
      scripts.push({
        hook_text,
        body_text,
        cta_text: headline || cta, // use headline as the "CTA" field for display
        broll_notes: null,
        director_note: null,
        full_script_text: content.trim(),
        word_count: primary_text.split(/\s+/).length,
        length: '',
        style,
        audience,
        output_type: 'ad_copy',
      })
    }
  }

  return scripts
}

// ── Parser: Headlines (---HEADLINES_START--- / ---HEADLINES_END---) ───
function parseHeadlines(output: string): ParsedScript[] {
  const scripts: ParsedScript[] = []
  const blocks = output.split('---HEADLINES_START---').slice(1)

  for (const block of blocks) {
    const content = block.split('---HEADLINES_END---')[0] ?? ''

    const extractMeta = (field: string): string => {
      const match = content.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'))
      return match?.[1]?.trim() ?? ''
    }

    // Extract the HEADLINES section
    const headlinesMatch = content.match(/HEADLINES:\s*([\s\S]+?)(?=---|$)/i)
    const headlinesRaw = headlinesMatch?.[1]?.trim() ?? ''

    const style = extractMeta('STYLE')
    const audience = extractMeta('AUDIENCE')

    if (headlinesRaw) {
      const lines = headlinesRaw.split('\n').filter(l => l.trim())
      scripts.push({
        hook_text: lines[0] ?? '',  // first headline as hook for display
        body_text: lines.join('\n'), // all headlines in body for full copy
        cta_text: '',
        broll_notes: null,
        director_note: null,
        full_script_text: content.trim(),
        word_count: lines.length,
        length: '',
        style,
        audience,
        output_type: 'headlines',
      })
    }
  }

  return scripts
}

function parseOutput(output: string, output_type: OutputType): ParsedScript[] {
  if (output_type === 'ad_copy') return parseAdCopy(output)
  if (output_type === 'headlines') return parseHeadlines(output)
  return parseVideoScripts(output)
}

function buildSystemPrompt(
  workflowMarkdown: string,
  clientContextMarkdown: string,
  winningScriptsMarkdown: string,
  referencesMarkdown: string,
  rejectionContext: string,
  inputs: Record<string, string>
): string {
  const inputLines = Object.entries(inputs)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n')

  const sections = [
    `You are the Agency OS AI — an expert video script writer and direct-response copywriter for Rework Consulting, a performance marketing agency specializing in local home service businesses (HVAC, roofing, solar, pest control, etc.) and B2B agency pitches.

Your role is to execute the workflow instructions below precisely. Use the client context as your knowledge base. Do not ask for information already present in the context.

---

## WORKFLOW INSTRUCTIONS
${workflowMarkdown}

---

## CLIENT CONTEXT (loaded from database)
${clientContextMarkdown}

---`,
    winningScriptsMarkdown ? `${winningScriptsMarkdown}\n---` : '',
    referencesMarkdown ? `${referencesMarkdown}\n---` : '',
    rejectionContext ? `${rejectionContext}\n---` : '',
    `## INPUTS FOR THIS RUN
${inputLines}

---

Follow the workflow instructions exactly. Produce ${inputs.script_count ?? '3'} complete variation(s) using the output_type format specified. Do not truncate. Do not explain your process — output the blocks and strategy note only.`,
  ]

  return sections.filter(Boolean).join('\n\n')
}

function encodeEvent(event: Record<string, unknown>): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

export async function POST(request: NextRequest) {
  let body: ScriptGenerateRequest

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const {
    client_slug,
    target_service,
    audience_type,
    script_goal,
    script_length,
    script_style,
    output_type = 'videos',
    script_count,
    specific_offer,
    hook_angle,
    notes,
    include_broll_notes,
  } = body

  if (!client_slug || !target_service || !audience_type || !script_goal || !script_length || !script_style) {
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
        // 1. Enforce prerequisites
        const tool = getTool('generate_video_scripts')!

        const { data: clientRecord } = await supabase
          .from('clients')
          .select('id, company_name, industry')
          .eq('slug', client_slug)
          .single()

        if (!clientRecord) throw new Error(`Client not found: ${client_slug}`)

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

              if (!icp) unmet.push(getTool(prereqId)?.label ?? prereqId)
            }
          }

          if (unmet.length > 0) {
            throw new Error(
              `Cannot generate — the following must be completed first for ${clientRecord.company_name}: ${unmet.join(', ')}.`
            )
          }
        }

        // 2. Load client context
        enqueue({ type: 'status', stage: 'context', message: 'Loading client context...' })
        const clientContext = await loadClientContext(client_slug, generateVideoScriptsTool)

        // 3. Load workflow markdown
        const { content: workflowMarkdown, hash: workflowFileHash } =
          await loadWorkflowMarkdown(generateVideoScriptsTool.workflow_file)

        // 4. Load winning scripts MD file (B2C or B2B)
        enqueue({ type: 'status', stage: 'references', message: 'Loading winning scripts...' })
        const winningScriptsContent = await loadWinningScripts(audience_type)
        const winningScriptsMarkdown = formatWinningScriptsForPrompt(winningScriptsContent)

        // 5. Load reference examples from disk
        const referenceScripts = await loadReferenceScripts({
          audience_type,
          script_style,
          script_length,
          industry: clientRecord.industry ?? undefined,
          client_slug,
        })
        const referencesMarkdown = formatReferencesForPrompt(referenceScripts)

        // 6. Load rejection context
        const { data: rejectedScripts } = await supabase
          .from('video_scripts')
          .select('script_length, script_style, created_at, rejection_reason')
          .eq('client_id', clientRecord.id)
          .eq('status', 'rejected')
          .not('rejection_reason', 'is', null)
          .order('created_at', { ascending: false })
          .limit(5)

        const rejectionContext = formatRejectionContext(rejectedScripts ?? [])

        // 7. Create workflow run record
        const model = generateVideoScriptsTool.model ?? 'claude-sonnet-4-6'
        const max_tokens = generateVideoScriptsTool.max_tokens ?? 16000

        const { data: run } = await supabase
          .from('workflow_runs')
          .insert({
            client_id: clientContext.client.id,
            workflow_id: 'generate_video_scripts',
            tool_id: 'generate_video_scripts',
            status: 'running',
            inputs: { target_service, audience_type, script_goal, script_length, script_style, output_type, script_count, specific_offer, hook_angle, notes, include_broll_notes },
            model,
            workflow_file: generateVideoScriptsTool.workflow_file,
            workflow_file_hash: workflowFileHash,
          })
          .select()
          .single()

        const runId = run?.id

        // 8. Build system prompt
        const inputs: Record<string, string> = {
          target_service,
          audience_type,
          script_goal,
          script_length,
          script_style,
          output_type,
          script_count: script_count ?? '3',
          include_broll_notes: include_broll_notes ? 'Yes' : 'No',
          ...(specific_offer ? { specific_offer } : {}),
          ...(hook_angle ? { hook_angle } : {}),
          ...(notes ? { notes } : {}),
        }

        const systemPrompt = buildSystemPrompt(
          workflowMarkdown,
          clientContext.context_markdown,
          winningScriptsMarkdown,
          referencesMarkdown,
          rejectionContext,
          inputs
        )

        // 9. Stream Claude response
        enqueue({ type: 'status', stage: 'writing', message: 'Writing...' })

        let fullOutput = ''
        let tokensUsed = 0

        const { total_tokens } = await streamClaudeResponse(
          systemPrompt,
          `Generate ${inputs.script_count} ${output_type} variation(s) now, following the workflow instructions exactly.`,
          (chunk) => {
            fullOutput += chunk
            enqueue({ type: 'chunk', text: chunk })
          },
          { model, maxTokens: max_tokens }
        )
        tokensUsed = total_tokens

        // 10. Parse structured output
        const parsedScripts = parseOutput(fullOutput, output_type)

        if (parsedScripts.length === 0) {
          throw new Error('Claude did not produce parseable output. Check the workflow format.')
        }

        // 11. Persist rows
        const referenceFilenames = referenceScripts.map((r) => r.filename)

        const insertRows = parsedScripts.map((script) => ({
          client_id: clientContext.client.id,
          workflow_run_id: runId ?? null,
          target_service,
          audience_type,
          script_goal,
          script_length,
          script_style,
          output_type,
          specific_offer: specific_offer ?? null,
          hook_angle: hook_angle ?? null,
          include_broll_notes: include_broll_notes ?? false,
          hook_text: script.hook_text,
          body_text: script.body_text,
          cta_text: script.cta_text,
          broll_notes: script.broll_notes,
          director_note: script.director_note,
          full_script_text: script.full_script_text,
          word_count: script.word_count,
          status: 'draft',
          references_used: referenceFilenames.length > 0 ? referenceFilenames : null,
          workflow_file_hash: workflowFileHash,
        }))

        const { data: scripts } = await supabase
          .from('video_scripts')
          .insert(insertRows)
          .select('id, hook_text, body_text, cta_text, broll_notes, director_note, word_count, script_length, script_style, audience_type, output_type, status, is_winner')

        // 12. Save full output to workflow_outputs
        await supabase.from('workflow_outputs').insert({
          run_id: runId ?? null,
          client_id: clientContext.client.id,
          workflow_id: 'generate_video_scripts',
          output_markdown: fullOutput,
          output_type,
          saved_to: 'video_scripts',
          metadata: { tokens_used: tokensUsed, script_count: parsedScripts.length, references_used: referenceFilenames },
        })

        // 13. Mark run complete
        if (runId) {
          await supabase
            .from('workflow_runs')
            .update({ status: 'completed', completed_at: new Date().toISOString(), tokens_used: tokensUsed })
            .eq('id', runId)
        }

        enqueue({
          type: 'complete',
          scripts: scripts ?? [],
          script_count: parsedScripts.length,
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
