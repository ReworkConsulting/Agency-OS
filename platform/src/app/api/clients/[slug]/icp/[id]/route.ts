import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import fs from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

const REPO_ROOT = path.resolve(process.cwd(), '..')

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params

  const supabase = createServerClient()

  // Resolve client
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!client) {
    return Response.json({ error: 'Client not found' }, { status: 404 })
  }

  // Fetch the document being deleted so we know if it was current
  const { data: doc } = await supabase
    .from('icp_documents')
    .select('id, version, is_current')
    .eq('id', id)
    .eq('client_id', client.id)
    .single()

  if (!doc) {
    return Response.json({ error: 'ICP version not found' }, { status: 404 })
  }

  // Delete it
  const { error: deleteError } = await supabase
    .from('icp_documents')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 })
  }

  // If we just deleted the current version, promote the next most recent
  let newCurrent: { id: string; icp_content: string; version: number } | null = null

  if (doc.is_current) {
    const { data: next } = await supabase
      .from('icp_documents')
      .select('id, icp_content, version')
      .eq('client_id', client.id)
      .order('version', { ascending: false })
      .limit(1)
      .single()

    if (next) {
      await supabase
        .from('icp_documents')
        .update({ is_current: true })
        .eq('id', next.id)
      newCurrent = next
    }
  }

  // Update the markdown file on disk
  const icpFilePath = path.join(REPO_ROOT, 'clients', slug, 'icp.md')
  try {
    if (newCurrent) {
      // Write the new current version's content to the file
      await fs.writeFile(icpFilePath, newCurrent.icp_content, 'utf-8')
    } else if (doc.is_current) {
      // No versions left — clear the file
      await fs.writeFile(icpFilePath, '', 'utf-8')
    }
    // If we deleted a non-current version, the file stays as-is
  } catch {
    // Non-fatal — DB is the source of truth for the platform
  }

  return Response.json({
    deleted_id: id,
    new_current_id: newCurrent?.id ?? null,
  })
}
