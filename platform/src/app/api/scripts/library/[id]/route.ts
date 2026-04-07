import { NextRequest } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

export const runtime = 'nodejs'

type Audience = 'B2C' | 'B2B'

function getMdPath(audience: Audience): string {
  const repoRoot = path.resolve(process.cwd(), '..')
  const filename = audience === 'B2C' ? 'winning_scripts_b2c.md' : 'winning_scripts_b2b.md'
  return path.join(repoRoot, 'examples', 'scripts', filename)
}

// DELETE /api/scripts/library/[id]?audience=B2C
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const audience = (request.nextUrl.searchParams.get('audience') ?? 'B2C') as Audience

  if (!id) {
    return Response.json({ error: 'Missing id' }, { status: 400 })
  }

  try {
    const filePath = getMdPath(audience)
    const content = await fs.readFile(filePath, 'utf-8')

    // Split on ## headings and remove the matching section
    const sections = content.split(/\n(?=## [^\n]+)/)

    const filtered = sections.filter((section) => {
      const trimmed = section.trim()
      if (!trimmed.startsWith('## ')) return true // keep header/intro
      const titleLine = trimmed.split('\n')[0].replace(/^##\s+/, '').trim()
      const sectionId = `${audience}-${titleLine}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      return sectionId !== id
    })

    if (filtered.length === sections.length) {
      return Response.json({ error: 'Script not found' }, { status: 404 })
    }

    await fs.writeFile(filePath, filtered.join('\n'), 'utf-8')
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Delete failed' }, { status: 500 })
  }
}
