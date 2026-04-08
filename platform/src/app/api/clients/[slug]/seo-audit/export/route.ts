/**
 * POST /api/clients/[slug]/seo-audit/export
 *
 * Generates a branded PDF of a specific SEO audit workflow output, uploads it
 * to Supabase Storage, saves a record in seo_audit_exports, and returns the public URL.
 *
 * Body: { output_id: string }  — the workflow_outputs row ID to export
 */
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import React, { type JSXElementConstructor, type ReactElement } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { SeoAuditPDF } from '@/lib/pdf/seo-audit-pdf'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = createServerClient()

  // ── 1. Fetch client ───────────────────────────────────────────────────────
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, company_name, logo_url, brand_primary_color, brand_secondary_color')
    .eq('slug', slug)
    .single()

  if (clientError || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // ── 2. Resolve the output_id from request body ────────────────────────────
  let body: { output_id?: string } = {}
  try {
    body = await request.json()
  } catch {
    // no body
  }

  if (!body.output_id) {
    return NextResponse.json({ error: 'output_id is required' }, { status: 400 })
  }

  // ── 3. Fetch the workflow output ──────────────────────────────────────────
  const { data: output, error: outputError } = await supabase
    .from('workflow_outputs')
    .select('id, created_at, output_markdown, workflow_id')
    .eq('id', body.output_id)
    .eq('client_id', client.id)
    .single()

  if (outputError || !output) {
    return NextResponse.json({ error: 'SEO audit output not found' }, { status: 404 })
  }

  // ── 4. Calculate version number ───────────────────────────────────────────
  // Fetch all seo_audit outputs for this client ordered by created_at ASC.
  // The position of output_id in that list = version number (1-indexed).
  const { data: allOutputs } = await supabase
    .from('workflow_outputs')
    .select('id, created_at')
    .eq('client_id', client.id)
    .eq('workflow_id', 'seo_audit')
    .order('created_at', { ascending: true })

  const versionIndex = (allOutputs ?? []).findIndex(o => o.id === output.id)
  const version = versionIndex >= 0 ? versionIndex + 1 : 1

  // ── 5. Extract service and location from markdown frontmatter ─────────────
  // Convention: first two non-empty lines of the audit output contain:
  // "Target Service: <value>" and "Target Location: <value>"
  const serviceMatch = output.output_markdown?.match(/Target Service:\s*(.+)/i)
  const locationMatch = output.output_markdown?.match(/Target Location:\s*(.+)/i)
  const service = serviceMatch?.[1]?.trim() ?? 'SEO Audit'
  const location = locationMatch?.[1]?.trim() ?? ''

  // ── 6. Generate PDF buffer ────────────────────────────────────────────────
  let pdfBuffer: Buffer
  try {
    const pdfElement = React.createElement(SeoAuditPDF, {
      clientName: client.company_name,
      logoUrl: client.logo_url,
      brandPrimaryColor: client.brand_primary_color,
      brandSecondaryColor: client.brand_secondary_color,
      content: output.output_markdown ?? '',
      version,
      service,
      location,
      createdAt: output.created_at,
    }) as ReactElement<DocumentProps, string | JSXElementConstructor<unknown>>

    pdfBuffer = await renderToBuffer(pdfElement)
  } catch (err) {
    console.error('[seo-audit/export] PDF render error:', err)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }

  // ── 7. Upload to Supabase Storage ─────────────────────────────────────────
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const storagePath = `seo-audit-exports/${slug}/seo-audit-v${version}-${timestamp}.pdf`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadError) {
    console.error('[seo-audit/export] Storage upload error:', uploadError)
    return NextResponse.json({ error: 'Failed to upload PDF to storage' }, { status: 500 })
  }

  // ── 8. Get public URL ─────────────────────────────────────────────────────
  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(storagePath)

  const fileUrl = urlData.publicUrl

  // ── 9. Save export record ─────────────────────────────────────────────────
  const { data: exportRecord, error: exportSaveError } = await supabase
    .from('seo_audit_exports')
    .insert({
      client_id: client.id,
      output_id: output.id,
      format: 'pdf',
      file_url: fileUrl,
      storage_path: storagePath,
    })
    .select()
    .single()

  if (exportSaveError) {
    console.error('[seo-audit/export] Failed to save export record:', exportSaveError)
    // Non-fatal — file is uploaded, return URL anyway
  }

  return NextResponse.json({
    url: fileUrl,
    id: exportRecord?.id ?? null,
    format: 'pdf',
    version,
    service,
    location,
    client_name: client.company_name,
  })
}
