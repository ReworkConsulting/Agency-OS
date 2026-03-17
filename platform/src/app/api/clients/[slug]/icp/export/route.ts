/**
 * POST /api/clients/[slug]/icp/export
 *
 * Generates a branded PDF of the client's current ICP document, uploads it
 * to Supabase Storage, saves a record in icp_exports, and returns the public URL.
 *
 * Body: { icp_document_id?: string }  — omit to use the current ICP
 */
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import React, { type JSXElementConstructor, type ReactElement } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { IcpPDF } from '@/lib/pdf/icp-pdf'

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

  // ── 2. Resolve the ICP document ───────────────────────────────────────────
  let body: { icp_document_id?: string } = {}
  try {
    body = await request.json()
  } catch {
    // no body is fine — we'll use the current ICP
  }

  let icpQuery = supabase
    .from('icp_documents')
    .select('id, version, created_at, confidence_level, icp_content, has_transcript')
    .eq('client_id', client.id)

  if (body.icp_document_id) {
    icpQuery = icpQuery.eq('id', body.icp_document_id)
  } else {
    icpQuery = icpQuery.eq('is_current', true)
  }

  const { data: icp, error: icpError } = await icpQuery.single()

  if (icpError || !icp) {
    return NextResponse.json(
      { error: 'No ICP document found. Build the ICP first.' },
      { status: 404 }
    )
  }

  // ── 3. Generate PDF buffer ────────────────────────────────────────────────
  let pdfBuffer: Buffer
  try {
    const pdfElement = React.createElement(IcpPDF, {
      clientName: client.company_name,
      logoUrl: client.logo_url,
      brandPrimaryColor: client.brand_primary_color,
      brandSecondaryColor: client.brand_secondary_color,
      icpContent: icp.icp_content,
      version: icp.version,
      confidenceLevel: icp.confidence_level,
      createdAt: icp.created_at,
    }) as ReactElement<DocumentProps, string | JSXElementConstructor<unknown>>

    pdfBuffer = await renderToBuffer(pdfElement)
  } catch (err) {
    console.error('[icp/export] PDF render error:', err)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }

  // ── 4. Upload to Supabase Storage ─────────────────────────────────────────
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const storagePath = `icp-exports/${slug}/icp-v${icp.version}-${timestamp}.pdf`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadError) {
    console.error('[icp/export] Storage upload error:', uploadError)
    return NextResponse.json({ error: 'Failed to upload PDF to storage' }, { status: 500 })
  }

  // ── 5. Get public URL ─────────────────────────────────────────────────────
  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(storagePath)

  const fileUrl = urlData.publicUrl

  // ── 6. Save export record ─────────────────────────────────────────────────
  const { data: exportRecord, error: exportError } = await supabase
    .from('icp_exports')
    .insert({
      client_id: client.id,
      icp_document_id: icp.id,
      format: 'pdf',
      file_url: fileUrl,
      storage_path: storagePath,
    })
    .select()
    .single()

  if (exportError) {
    console.error('[icp/export] Failed to save export record:', exportError)
    // Non-fatal — the file is uploaded, return the URL anyway
  }

  return NextResponse.json({
    url: fileUrl,
    id: exportRecord?.id ?? null,
    format: 'pdf',
    version: icp.version,
    client_name: client.company_name,
  })
}
