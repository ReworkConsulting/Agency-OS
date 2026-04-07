import path from 'path'
import fs from 'fs/promises'

export interface ReferenceScript {
  filename: string
  length: string
  style: string
  audience: string
  industry: string
  goal: string
  word_count: number
  notes: string
  content: string
  styleNotes: string
}

interface LoadParams {
  audience_type: 'B2C' | 'B2B'
  script_style: string
  script_length: string
  industry?: string
  client_slug: string
  max_examples?: number
}

/**
 * Parse the YAML-style frontmatter from a markdown file.
 * No external dependencies — splits on --- delimiters.
 */
function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const parts = raw.split(/^---\s*$/m)
  if (parts.length < 3) return { meta: {}, body: raw }

  const meta: Record<string, string> = {}
  const fmLines = parts[1].trim().split('\n')
  for (const line of fmLines) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim()
    const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '')
    meta[key] = val
  }

  // Body is everything after the second ---
  const body = parts.slice(2).join('---').trim()
  return { meta, body }
}

/**
 * Extract the STYLE NOTES section from the script body (after the last --- separator).
 */
function extractStyleNotes(body: string): { scriptContent: string; styleNotes: string } {
  const separatorIdx = body.lastIndexOf('\n---\n')
  if (separatorIdx === -1) return { scriptContent: body, styleNotes: '' }
  return {
    scriptContent: body.slice(0, separatorIdx).trim(),
    styleNotes: body.slice(separatorIdx + 5).replace(/^STYLE NOTES:\s*/i, '').trim(),
  }
}

/**
 * Normalize a style string for loose matching
 * e.g. "Pain Hook" matches "pain-hook", "painhook"
 */
function normalizeStyle(s: string): string {
  return s.toLowerCase().replace(/[\s-]/g, '')
}

/**
 * Load reference scripts from the examples/scripts/ directory.
 * Returns up to max_examples scripts, prioritizing:
 *   1. Global examples matching audience + industry + style + length
 *   2. Fall back to general-home-services if no industry match
 *   3. Up to 1 client-specific approved script
 */
export async function loadReferenceScripts(params: LoadParams): Promise<ReferenceScript[]> {
  const { audience_type, script_style, script_length, industry, client_slug, max_examples = 3 } = params

  const repoRoot = path.resolve(process.cwd(), '..')
  const globalBase = path.join(repoRoot, 'examples', 'scripts', audience_type === 'B2C' ? 'b2c' : 'b2b')
  const clientApprovedDir = path.join(repoRoot, 'clients', client_slug, 'scripts', 'approved')

  const results: ReferenceScript[] = []

  // ── 1. Try industry-specific directory ──────────────────────────────
  if (industry) {
    const industryDir = path.join(globalBase, industry.toLowerCase().replace(/\s+/g, '-'))
    const industryScripts = await readScriptsFromDir(industryDir, script_style, script_length)
    results.push(...industryScripts.slice(0, 2))
  }

  // ── 2. Fall back to general-home-services if needed ─────────────────
  if (results.length < 2 && audience_type === 'B2C') {
    const generalDir = path.join(globalBase, 'general-home-services')
    const generalScripts = await readScriptsFromDir(generalDir, script_style, script_length)
    const needed = 2 - results.length
    results.push(...generalScripts.slice(0, needed))
  }

  // ── 3. Load up to 1 client-specific approved script ─────────────────
  if (results.length < max_examples) {
    const clientScripts = await readScriptsFromDir(clientApprovedDir, script_style, script_length)
    if (clientScripts.length > 0) {
      results.push(clientScripts[0])
    }
  }

  return results.slice(0, max_examples)
}

/**
 * Read all .md files in a directory, parse frontmatter,
 * and return those matching the style and length filters.
 * Returns empty array if the directory does not exist.
 */
async function readScriptsFromDir(
  dir: string,
  style: string,
  length: string
): Promise<ReferenceScript[]> {
  let files: string[]
  try {
    files = await fs.readdir(dir)
  } catch {
    return []
  }

  const mdFiles = files.filter((f) => f.endsWith('.md') && f !== 'README.md')
  const scripts: ReferenceScript[] = []

  for (const file of mdFiles) {
    try {
      const raw = await fs.readFile(path.join(dir, file), 'utf-8')
      const { meta, body } = parseFrontmatter(raw)
      const { scriptContent, styleNotes } = extractStyleNotes(body)

      // UGC and Voice Over are delivery dimensions, not hook-structure tags.
      // Existing reference files use hook-structure tags (Pain Hook, Results First, etc.)
      // so we bypass style filtering entirely when the incoming style is a delivery type.
      const isDeliveryStyle = style === 'UGC' || style === 'Voice Over'
      const styleMatch =
        isDeliveryStyle || !meta.style || normalizeStyle(meta.style) === normalizeStyle(style)

      // Exact match on length, or no filter if meta.length is missing
      const lengthMatch = !meta.length || meta.length === length

      if (styleMatch && lengthMatch) {
        scripts.push({
          filename: file,
          length: meta.length ?? length,
          style: meta.style ?? style,
          audience: meta.audience ?? '',
          industry: meta.industry ?? '',
          goal: meta.goal ?? '',
          word_count: parseInt(meta.word_count ?? '0', 10),
          notes: meta.notes ?? '',
          content: scriptContent,
          styleNotes,
        })
      }
    } catch {
      // Skip unreadable files silently
    }
  }

  return scripts
}

/**
 * Load the winning scripts MD file for the given audience type.
 * Returns the raw markdown content, or empty string if the file doesn't exist.
 */
export async function loadWinningScripts(audience_type: 'B2C' | 'B2B'): Promise<string> {
  const repoRoot = path.resolve(process.cwd(), '..')
  const filename = audience_type === 'B2C' ? 'winning_scripts_b2c.md' : 'winning_scripts_b2b.md'
  const filePath = path.join(repoRoot, 'examples', 'scripts', filename)
  try {
    return await fs.readFile(filePath, 'utf-8')
  } catch {
    return ''
  }
}

/**
 * Format the winning scripts MD content as a prompt block.
 */
export function formatWinningScriptsForPrompt(content: string): string {
  if (!content.trim()) return ''
  return `## WINNING SCRIPTS LIBRARY (your top-performing references)\nStudy these for structure, voice, and pacing. Mirror what works — never copy the words.\n\n${content}`
}

/**
 * Format reference scripts as a markdown block for injection into the system prompt.
 */
export function formatReferencesForPrompt(scripts: ReferenceScript[]): string {
  if (scripts.length === 0) return ''

  const lines: string[] = [
    '## REFERENCE EXAMPLES',
    'Study their structure, pacing, and voice. Mirror the energy — not the words.',
    'Your client is different. Their specific details must be different.',
    '',
  ]

  scripts.forEach((script, i) => {
    const label = script.notes
      ? `Example ${i + 1} (${script.length}, ${script.style}, ${script.audience} — ${script.notes.slice(0, 60)})`
      : `Example ${i + 1} (${script.length}, ${script.style}, ${script.audience})`

    lines.push(`### ${label}`)
    lines.push('')
    lines.push(script.content)
    if (script.styleNotes) {
      lines.push('')
      lines.push(`**STYLE NOTES:** ${script.styleNotes}`)
    }
    lines.push('')
  })

  return lines.join('\n')
}

/**
 * Load and format rejection context for a client.
 * Queries the last 5 rejected scripts with reasons from Supabase.
 */
export function formatRejectionContext(rejections: Array<{ script_length: string; script_style: string; created_at: string; rejection_reason: string }>): string {
  if (rejections.length === 0) return ''

  const lines: string[] = [
    '## SCRIPTS THAT DID NOT WORK FOR THIS CLIENT',
    'These were generated and rejected. Learn from what failed — do not repeat these patterns.',
    '',
  ]

  for (const r of rejections) {
    const date = r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : 'unknown date'
    lines.push(`**Rejected: ${r.script_length}, ${r.script_style}, ${date}**`)
    lines.push(`Reason: "${r.rejection_reason}"`)
    lines.push('')
  }

  return lines.join('\n')
}
