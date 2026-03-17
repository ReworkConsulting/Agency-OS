import { createServerClient } from '@/lib/supabase/server'
import { streamClaudeResponse } from '@/lib/claude/client'
import { loadClientContext } from '@/lib/context-loader'
import { getTool } from '@/lib/tool-registry'
import { loadWorkflowMarkdown } from './loader'
import type { WorkflowRunRequest } from '@/types/workflow'

const DEFAULT_MODEL = 'claude-sonnet-4-6'
const DEFAULT_MAX_TOKENS = 16000

interface RunWorkflowResult {
  run_id: string
  output_id: string
}

/**
 * Core workflow execution function.
 *
 * 1. Validates inputs against the tool definition
 * 2. Enforces prerequisites — blocks if a required prior tool has no completed run
 * 3. Loads client context from Supabase
 * 4. Reads the workflow markdown file (and computes its hash for versioning)
 * 5. Creates a workflow_runs row
 * 6. Streams the Claude response, calling onChunk for each text delta
 * 7. Persists the output to workflow_outputs (and icp_documents if applicable)
 * 8. Marks the run complete
 */
export async function runWorkflow(
  request: WorkflowRunRequest,
  onChunk: (text: string) => void
): Promise<RunWorkflowResult> {
  const supabase = createServerClient()

  // --- 1. Resolve tool ---
  const tool = getTool(request.tool_id)
  if (!tool) {
    throw new Error(`Unknown tool: ${request.tool_id}`)
  }

  // --- 2. Validate required inputs ---
  for (const input of tool.required_inputs) {
    if (
      request.inputs[input.key] === undefined ||
      request.inputs[input.key] === ''
    ) {
      throw new Error(`Missing required input: ${input.label} (${input.key})`)
    }
  }

  // --- 3. Enforce prerequisites ---
  if (tool.prerequisites && tool.prerequisites.length > 0) {
    // Load the client record to get its ID
    const { data: client } = await supabase
      .from('clients')
      .select('id, company_name')
      .eq('slug', request.client_slug)
      .single()

    if (!client) {
      throw new Error(`Client not found: ${request.client_slug}`)
    }

    const unmet: string[] = []

    for (const prereqId of tool.prerequisites) {
      const prereqTool = getTool(prereqId)
      const prereqLabel = prereqTool?.label ?? prereqId

      // For build_icp prerequisite, check icp_documents table directly
      if (prereqId === 'build_icp') {
        const { data: icp } = await supabase
          .from('icp_documents')
          .select('id')
          .eq('client_id', client.id)
          .eq('is_current', true)
          .limit(1)
          .single()

        if (!icp) {
          unmet.push(prereqLabel)
        }
        continue
      }

      // For other prerequisites, check workflow_runs for a completed run
      const { data: completedRun } = await supabase
        .from('workflow_runs')
        .select('id')
        .eq('client_id', client.id)
        .eq('tool_id', prereqId)
        .eq('status', 'completed')
        .limit(1)
        .single()

      if (!completedRun) {
        unmet.push(prereqLabel)
      }
    }

    if (unmet.length > 0) {
      throw new Error(
        `Cannot run "${tool.label}" — the following must be completed first for ${client.company_name}: ${unmet.join(', ')}.`
      )
    }
  }

  // --- 4. Load client context ---
  const clientContext = await loadClientContext(request.client_slug, tool)

  // --- 5. Load workflow markdown + hash ---
  const { content: workflowMarkdown, hash: workflowFileHash } =
    await loadWorkflowMarkdown(tool.workflow_file)

  // --- 6. Create run record ---
  const model = tool.model ?? DEFAULT_MODEL
  const max_tokens = tool.max_tokens ?? DEFAULT_MAX_TOKENS

  const { data: run, error: runError } = await supabase
    .from('workflow_runs')
    .insert({
      client_id: clientContext.client.id,
      workflow_id: tool.id,
      tool_id: tool.id,
      status: 'running',
      inputs: request.inputs,
      model,
      workflow_file: tool.workflow_file,
      workflow_file_hash: workflowFileHash,
    })
    .select()
    .single()

  if (runError || !run) {
    throw new Error(`Failed to create workflow run: ${runError?.message}`)
  }

  const runId = run.id

  // --- 7. Build the system prompt ---
  const systemPrompt = buildSystemPrompt(
    workflowMarkdown,
    clientContext.context_markdown,
    request.inputs
  )

  const userMessage = `Run the "${tool.label}" workflow now. All client context has been loaded above. Begin from Step 1 of the workflow instructions.`

  // --- 8. Stream response from Claude ---
  let fullOutput = ''
  let tokensUsed = 0

  try {
    const { total_tokens } = await streamClaudeResponse(
      systemPrompt,
      userMessage,
      (chunk) => {
        fullOutput += chunk
        onChunk(chunk)
      },
      { model, maxTokens: max_tokens }
    )
    tokensUsed = total_tokens

    // --- 9. Persist output ---
    const { data: output, error: outputError } = await supabase
      .from('workflow_outputs')
      .insert({
        run_id: runId,
        client_id: clientContext.client.id,
        workflow_id: tool.id,
        output_markdown: fullOutput,
        output_type: tool.output_type,
        saved_to: tool.saves_to,
        metadata: { tokens_used: tokensUsed },
      })
      .select()
      .single()

    if (outputError || !output) {
      throw new Error(`Failed to save workflow output: ${outputError?.message}`)
    }

    const outputId = output.id

    // --- 10. Mark run complete ---
    await supabase
      .from('workflow_runs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        output_id: outputId,
        tokens_used: tokensUsed,
      })
      .eq('id', runId)

    // --- 11. If this is an ICP run, persist to icp_documents ---
    if (tool.saves_to === 'icp_documents') {
      await persistICPDocument(
        supabase,
        clientContext.client.id,
        fullOutput,
        !!request.inputs.transcript_url
      )
    }

    return { run_id: runId, output_id: outputId }
  } catch (err) {
    // Mark the run as failed
    await supabase
      .from('workflow_runs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: String(err),
      })
      .eq('id', runId)

    throw err
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildSystemPrompt(
  workflowMarkdown: string,
  clientContextMarkdown: string,
  inputs: Record<string, string | boolean | number>
): string {
  const inputLines = Object.entries(inputs)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n')

  return `You are the Agency OS AI — an expert marketing research and strategy system for Rework Consulting, a performance marketing agency specializing in local home service businesses (HVAC, roofing, solar, siding, pest control, etc.).

Your role is to execute the workflow instructions below precisely. Use the client context as your knowledge base. Do not ask for information already present in the context.

---

## WORKFLOW INSTRUCTIONS
${workflowMarkdown}

---

## CLIENT CONTEXT (loaded from database)
${clientContextMarkdown}

---

## ADDITIONAL INPUTS FOR THIS RUN
${inputLines || 'None provided.'}

---

Follow the workflow step by step. Produce complete, high-quality output. Do not truncate.`
}

function extractIcpContent(fullOutput: string): string {
  const start = fullOutput.indexOf('---ICP_DOCUMENT_START---')
  const end = fullOutput.indexOf('---ICP_DOCUMENT_END---')
  if (start !== -1 && end !== -1 && end > start) {
    return fullOutput.slice(start + '---ICP_DOCUMENT_START---'.length, end).trim()
  }
  // Fallback: return the full output if delimiters are missing
  return fullOutput.trim()
}

async function persistICPDocument(
  supabase: ReturnType<typeof createServerClient>,
  clientId: string,
  fullOutput: string,
  hasTranscript: boolean
): Promise<void> {
  const icpContent = extractIcpContent(fullOutput)

  // Get current version number
  const { data: existing } = await supabase
    .from('icp_documents')
    .select('version')
    .eq('client_id', clientId)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  const newVersion = existing ? existing.version + 1 : 1

  // Mark all previous versions as not current
  await supabase
    .from('icp_documents')
    .update({ is_current: false })
    .eq('client_id', clientId)

  // Insert new version
  await supabase.from('icp_documents').insert({
    client_id: clientId,
    version: newVersion,
    is_current: true,
    icp_content: icpContent,
    has_transcript: hasTranscript,
  })
}
