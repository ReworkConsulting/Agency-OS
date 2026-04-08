'use client'

import { useState } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { formatDate, formatDateShort } from '@/lib/format-date'

interface SeoAuditOutput {
  id: string
  created_at: string
  output_markdown: string | null
  output_type: string | null
}

interface SeoAuditExport {
  id: string
  format: string
  file_url: string
  created_at: string
  output_id: string
}

interface SeoAuditDocumentProps {
  outputs: SeoAuditOutput[]
  clientName: string
  logoUrl?: string | null
  brandPrimaryColor?: string | null
  brandSecondaryColor?: string | null
  clientSlug: string
  exports?: SeoAuditExport[]
}

export function SeoAuditDocument({
  outputs,
  clientName,
  logoUrl,
  brandPrimaryColor,
  brandSecondaryColor,
  clientSlug,
  exports: initialExports = [],
}: SeoAuditDocumentProps) {
  // outputs arrive sorted ASC (oldest = V1). Reverse for display (newest first).
  const versioned = outputs.map((o, i) => ({ ...o, version: i + 1 }))
  const displayList = [...versioned].reverse()

  const [activeId, setActiveId] = useState(displayList[0]?.id ?? '')
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportUrl, setExportUrl] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const active = versioned.find(v => v.id === activeId) ?? versioned[versioned.length - 1]

  const primary = brandPrimaryColor ?? null
  const secondary = brandSecondaryColor ?? null

  // Extract service/location from markdown for display
  const serviceMatch = active?.output_markdown?.match(/Target Service:\s*(.+)/i)
  const locationMatch = active?.output_markdown?.match(/Target Location:\s*(.+)/i)
  const service = serviceMatch?.[1]?.trim() ?? null
  const location = locationMatch?.[1]?.trim() ?? null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(active?.output_markdown ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportPDF = async () => {
    setExporting(true)
    setExportUrl(null)
    setExportError(null)

    try {
      const res = await fetch(`/api/clients/${clientSlug}/seo-audit/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ output_id: active?.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        setExportError(data.error ?? 'Export failed')
        return
      }

      setExportUrl(data.url)
      window.open(data.url, '_blank')
    } catch {
      setExportError('Network error — please try again')
    } finally {
      setExporting(false)
    }
  }

  const wordCount = (active?.output_markdown ?? '').split(/\s+/).filter(Boolean).length
  const createdDate = active ? formatDate(active.created_at) : ''

  if (!active) return null

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
    >
      {/* ── Brand accent bar ── */}
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
              <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                SEO Audit Report
                {service && location ? ` — ${service} · ${location}` : ''}
              </p>
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
          <VersionBadge version={active.version} primary={primary} />
          <MetaTag label="Created" value={createdDate} />
          <MetaTag label="Words" value={String(wordCount)} />
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
      {displayList.length > 1 && (
        <div
          className="px-5 py-2.5 flex items-center gap-2 overflow-x-auto"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider shrink-0" style={{ color: 'var(--text-3)' }}>
            Version
          </span>
          {displayList.map(v => (
            <button
              key={v.id}
              onClick={() => setActiveId(v.id)}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0"
              style={{
                background: v.id === activeId ? (primary ?? 'var(--text-1)') : 'var(--bg-hover)',
                color: v.id === activeId ? (primary ? '#ffffff' : 'var(--bg)') : 'var(--text-2)',
                border: '1px solid var(--border)',
              }}
            >
              V{v.version}
              <span className="ml-1 opacity-60">{formatDateShort(v.created_at)}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Export history ── */}
      {initialExports.length > 0 && (
        <div
          className="px-5 py-2 flex items-center gap-2 flex-wrap"
          style={{ borderBottom: '1px solid var(--border-dim)', background: 'var(--bg-subtle)' }}
        >
          <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Exports:</span>
          {initialExports.slice(0, 5).map(exp => (
            <a
              key={exp.id}
              href={exp.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] px-2 py-0.5 rounded underline"
              style={{
                background: primary ? `${primary}14` : 'var(--bg-hover)',
                color: primary ?? 'var(--text-2)',
                border: `1px solid ${primary ? `${primary}30` : 'var(--border)'}`,
              }}
            >
              PDF {formatDateShort(exp.created_at)} ↗
            </a>
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
          [&_table]:text-[11px] [&_table]:w-full [&_table]:border-collapse
          [&_th]:text-left [&_th]:py-1.5 [&_th]:px-2 [&_th]:border-b [&_th]:font-semibold
          [&_td]:py-1 [&_td]:px-2 [&_td]:border-b
        "
          style={primary ? {
            '--tw-prose-headings': primary,
          } as React.CSSProperties : undefined}
        >
          <ReactMarkdown>{active?.output_markdown ?? ''}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────────────── */

function VersionBadge({ version, primary }: { version: number; primary: string | null }) {
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
      style={{
        background: primary ? `${primary}14` : 'var(--bg-hover)',
        color: primary ?? 'var(--text-2)',
        border: `1px solid ${primary ? `${primary}30` : 'var(--border)'}`,
      }}
    >
      V{version}
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
