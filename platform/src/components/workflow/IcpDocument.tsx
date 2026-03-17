'use client'

import { useState } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { formatDate, formatDateShort } from '@/lib/format-date'

interface IcpVersion {
  id: string
  version: number
  created_at: string
  confidence_level: string | null
  icp_content: string
  source_materials?: string | null
  has_transcript?: boolean | null
}

interface IcpDocumentProps {
  icp: IcpVersion
  allVersions?: IcpVersion[]
  clientName: string
  logoUrl?: string | null
  brandPrimaryColor?: string | null
  brandSecondaryColor?: string | null
  clientSlug: string
}

export function IcpDocument({
  icp,
  allVersions = [],
  clientName,
  logoUrl,
  brandPrimaryColor,
  brandSecondaryColor,
  clientSlug,
}: IcpDocumentProps) {
  const [activeId, setActiveId] = useState(icp.id)
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportUrl, setExportUrl] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [versionList, setVersionList] = useState(allVersions.length > 0 ? allVersions : [icp])
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const active = versionList.find(v => v.id === activeId) ?? versionList[0] ?? icp

  const primary = brandPrimaryColor ?? null
  const secondary = brandSecondaryColor ?? null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(active.icp_content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportPDF = async () => {
    setExporting(true)
    setExportUrl(null)
    setExportError(null)

    try {
      const res = await fetch(`/api/clients/${clientSlug}/icp/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icp_document_id: active.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        setExportError(data.error ?? 'Export failed')
        return
      }

      setExportUrl(data.url)
      // Auto-open the PDF in a new tab
      window.open(data.url, '_blank')
    } catch {
      setExportError('Network error — please try again')
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async (versionId: string) => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/clients/${clientSlug}/icp/${versionId}`, { method: 'DELETE' })
      if (!res.ok) return
      const data = await res.json()
      const remaining = versionList.filter(v => v.id !== versionId)
      setVersionList(remaining)
      // Switch to the new current, or the first remaining
      const nextActive = data.new_current_id ?? remaining[0]?.id ?? null
      if (nextActive) setActiveId(nextActive)
    } finally {
      setDeleting(false)
      setConfirmDeleteId(null)
    }
  }

  const wordCount = active.icp_content.split(/\s+/).filter(Boolean).length
  const createdDate = formatDate(active.created_at)

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
    >
      {/* ── Brand accent bar (if brand color is set) ── */}
      {primary && (
        <div
          style={{
            height: 3,
            background: secondary
              ? `linear-gradient(90deg, ${primary}, ${secondary})`
              : primary,
          }}
        />
      )}

      {/* ── Document header ── */}
      <div
        className="px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}
      >
        {/* Client identity row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <div
                className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
                style={{
                  background: secondary ?? 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <Image src={logoUrl} alt={clientName} width={28} height={28} className="object-contain p-0.5" unoptimized />
              </div>
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: secondary ?? 'var(--bg-hover)',
                  border: '1px solid var(--border)',
                }}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: primary ?? 'var(--text-3)' }}
                >
                  {clientName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-1)' }}>{clientName}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>ICP Research Document</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-[11px] px-2.5 py-1 rounded-md transition-all"
              style={{
                background: 'var(--bg-hover)',
                color: copied ? '#22c55e' : 'var(--text-2)',
                border: '1px solid var(--border)',
              }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>

            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="text-[11px] px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5"
              style={{
                background: exporting ? 'var(--bg-hover)' : (primary ? primary : 'var(--bg-hover)'),
                color: exporting
                  ? 'var(--text-3)'
                  : primary
                    ? '#ffffff'
                    : 'var(--text-2)',
                border: primary ? 'none' : '1px solid var(--border)',
                opacity: exporting ? 0.7 : 1,
                cursor: exporting ? 'wait' : 'pointer',
              }}
            >
              {exporting ? (
                <>
                  <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap">
          <ConfidenceBadge level={active.confidence_level} />
          <MetaTag label="Created" value={createdDate} />
          <MetaTag label="Words" value={String(wordCount)} />
          {active.has_transcript && (
            <MetaTag label="Sources" value="interview +" />
          )}
          {primary && (
            <span
              className="inline-flex items-center gap-1.5 text-[11px]"
              style={{ color: 'var(--text-3)' }}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ background: primary, border: '1px solid rgba(0,0,0,0.1)' }}
              />
              {secondary && (
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full -ml-0.5"
                  style={{ background: secondary, border: '1px solid rgba(0,0,0,0.1)' }}
                />
              )}
              <span>Brand colors applied</span>
            </span>
          )}
        </div>

        {/* Export feedback */}
        {exportError && (
          <p className="text-[11px] mt-2" style={{ color: '#dc2626' }}>
            ⚠ {exportError}
          </p>
        )}
        {exportUrl && !exportError && (
          <a
            href={exportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] mt-2 underline"
            style={{ color: primary ?? 'var(--text-2)' }}
          >
            ↗ PDF ready — click to open
          </a>
        )}
      </div>

      {/* ── Version selector ── */}
      {versionList.length > 0 && (
        <div
          className="px-5 py-2.5 flex items-center gap-2 overflow-x-auto"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider shrink-0" style={{ color: 'var(--text-3)' }}>
            Version
          </span>
          {versionList
            .slice()
            .sort((a, b) => b.version - a.version)
            .map(v => (
              <div key={v.id} className="group flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setActiveId(v.id)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all"
                  style={{
                    background: v.id === activeId ? (primary ?? 'var(--text-1)') : 'var(--bg-hover)',
                    color: v.id === activeId ? (primary ? '#ffffff' : 'var(--bg)') : 'var(--text-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  v{v.version}
                  <span className="ml-1 opacity-60">{formatDateShort(v.created_at)}</span>
                </button>

                {/* Delete — confirm inline */}
                {confirmDeleteId === v.id ? (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>Delete?</span>
                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={deleting}
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      {deleting ? '…' : 'Yes'}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--bg-hover)', color: 'var(--text-3)', border: '1px solid var(--border)' }}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(v.id)}
                    title={`Delete v${v.version}`}
                    className="w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--text-4)', background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>
            ))}
        </div>
      )}

      {/* ── Source tags ── */}
      {active.source_materials && (
        <div
          className="px-5 py-2 flex items-center gap-2 flex-wrap"
          style={{ borderBottom: '1px solid var(--border-dim)', background: 'var(--bg-subtle)' }}
        >
          <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Sources:</span>
          {active.has_transcript && (
            <SourceTag label="interview transcript" accentColor={primary} />
          )}
          {active.source_materials.split(',').map(s => (
            <SourceTag key={s.trim()} label={s.trim()} />
          ))}
        </div>
      )}

      {/* ── Document content ── */}
      <div
        className="flex-1 overflow-auto"
        style={{ maxHeight: '680px' }}
      >
        <div className="p-6 prose prose-sm max-w-none dark:prose-invert
          [&_h1]:text-base [&_h1]:font-semibold [&_h1]:mb-3 [&_h1]:mt-6
          [&_h2]:text-[13px] [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-5
          [&_h3]:text-[12px] [&_h3]:font-semibold [&_h3]:mb-1.5 [&_h3]:mt-4
          [&_p]:text-[13px] [&_p]:leading-relaxed
          [&_li]:text-[13px] [&_li]:leading-relaxed
          [&_strong]:font-semibold
          [&_hr]:my-5
        "
          style={primary ? {
            '--tw-prose-headings': primary,
          } as React.CSSProperties : undefined}
        >
          <ReactMarkdown>{active.icp_content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────────────── */

function ConfidenceBadge({ level }: { level: string | null }) {
  if (!level) return null
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    HIGH:   { bg: 'rgba(34,197,94,0.08)',  color: '#16a34a', border: 'rgba(34,197,94,0.2)' },
    MEDIUM: { bg: 'rgba(234,179,8,0.08)',  color: '#ca8a04', border: 'rgba(234,179,8,0.2)' },
    LOW:    { bg: 'rgba(239,68,68,0.08)',  color: '#dc2626', border: 'rgba(239,68,68,0.2)' },
  }
  const s = styles[level] ?? { bg: 'var(--bg-hover)', color: 'var(--text-2)', border: 'var(--border)' }
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {level.toLowerCase()} confidence
    </span>
  )
}

function MetaTag({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
      <span className="font-medium" style={{ color: 'var(--text-2)' }}>{label}:</span>{' '}
      {value}
    </span>
  )
}

function TrashIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SourceTag({ label, accentColor }: { label: string; accentColor?: string | null }) {
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded"
      style={{
        background: accentColor ? `${accentColor}14` : 'var(--bg-hover)',
        color: accentColor ?? 'var(--text-2)',
        border: `1px solid ${accentColor ? `${accentColor}30` : 'var(--border)'}`,
      }}
    >
      {label}
    </span>
  )
}
