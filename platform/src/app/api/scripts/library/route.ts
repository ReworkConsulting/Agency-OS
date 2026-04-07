import { NextRequest } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

export const runtime = 'nodejs'

type Audience = 'B2C' | 'B2B'

interface LibraryScript {
  id: string
  title: string
  style: string
  format: string
  length: string
  industry: string
  performance: string
  added: string
  hook: string
  body: string
  cta: string
  audience: Audience
  raw: string
}

function getMdPath(audience: Audience): string {
  const repoRoot = path.resolve(process.cwd(), '..')
  const filename = audience === 'B2C' ? 'winning_scripts_b2c.md' : 'winning_scripts_b2b.md'
  return path.join(repoRoot, 'examples', 'scripts', filename)
}

/**
 * Parse the winning scripts MD file into individual script entries.
 * Each entry starts with "## [Title]" and ends before the next "## " or EOF.
 */
function parseLibraryScripts(content: string, audience: Audience): LibraryScript[] {
  const scripts: LibraryScript[] = []

  // Split on ## headings — each script starts with "## Title"
  const sections = content.split(/\n(?=## [^\n]+)/)

  for (const section of sections) {
    const trimmed = section.trim()
    if (!trimmed.startsWith('## ')) continue

    const lines = trimmed.split('\n')
    const title = lines[0].replace(/^##\s+/, '').trim()

    // Skip the file header section
    if (title.startsWith('Winning Scripts') || title.startsWith('#')) continue

    const getMeta = (key: string): string => {
      const line = lines.find(l => l.toLowerCase().startsWith(`**${key.toLowerCase()}:**`))
      return line ? line.replace(new RegExp(`^\\*\\*${key}:\\*\\*\\s*`, 'i'), '').trim() : ''
    }

    const extractSection = (tag: string): string => {
      const startIdx = lines.findIndex(l => l.trim() === `[${tag}]`)
      if (startIdx === -1) return ''
      const end = lines.findIndex((l, i) => i > startIdx && l.trim().startsWith('[') && l.trim().endsWith(']'))
      const slice = end === -1 ? lines.slice(startIdx + 1) : lines.slice(startIdx + 1, end)
      return slice.join('\n').trim()
    }

    const hook = extractSection('HOOK')
    const body = extractSection('BODY')
    const cta = extractSection('CTA')

    // Generate a stable ID from title + audience
    const id = `${audience}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    scripts.push({
      id,
      title,
      style: getMeta('Style'),
      format: getMeta('Format'),
      length: getMeta('Length'),
      industry: getMeta('Industry'),
      performance: getMeta('Performance'),
      added: getMeta('Added'),
      hook,
      body,
      cta,
      audience,
      raw: trimmed,
    })
  }

  return scripts
}

// GET /api/scripts/library?audience=B2C
export async function GET(request: NextRequest) {
  const audience = (request.nextUrl.searchParams.get('audience') ?? 'B2C') as Audience

  try {
    const filePath = getMdPath(audience)
    const content = await fs.readFile(filePath, 'utf-8')
    const scripts = parseLibraryScripts(content, audience)
    return Response.json({ scripts })
  } catch {
    return Response.json({ scripts: [] })
  }
}

// POST /api/scripts/library — append a new script entry
export async function POST(request: NextRequest) {
  let body: {
    audience: Audience
    title: string
    style: string
    format: string
    length: string
    industry: string
    hook: string
    body: string
    cta: string
    performance?: string
  }

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { audience, title, style, format, length, industry, hook, body: bodyText, cta, performance } = body

  if (!audience || !title || !style || !format || !hook) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const today = new Date().toISOString().split('T')[0]
  const entry = [
    `## ${title}`,
    `**Style:** ${style}`,
    `**Format:** ${format}`,
    `**Length:** ${length || 'N/A'}`,
    `**Industry:** ${industry || 'General'}`,
    `**Performance:** ${performance || 'Not yet measured'}`,
    `**Added:** ${today}`,
    '',
    '[HOOK]',
    hook.trim(),
    '',
    '[BODY]',
    bodyText?.trim() || 'N/A',
    '',
    '[CTA]',
    cta?.trim() || 'N/A',
    '',
    '---',
    '',
  ].join('\n')

  try {
    const filePath = getMdPath(audience)
    const existing = await fs.readFile(filePath, 'utf-8')
    await fs.writeFile(filePath, existing.trimEnd() + '\n\n' + entry, 'utf-8')

    // Return the new script object
    const id = `${audience}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return Response.json({
      script: { id, title, style, format, length, industry, performance: performance ?? '', added: today, hook, body: bodyText ?? '', cta: cta ?? '', audience },
    })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Write failed' }, { status: 500 })
  }
}
