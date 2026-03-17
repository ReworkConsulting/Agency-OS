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
}

export function IcpDocument({ icp, allVersions = [], clientName, logoUrl }: IcpDocumentProps) {
  const [activeId, setActiveId] = useState(icp.id)
  const [copied, setCopied] = useState(false)

  const versions = allVersions.length > 0 ? allVersions : [icp]
  const active = versions.find(v => v.id === activeId) ?? icp

  const handleCopy = async () => {
    await navigator.clipboard.writeText(active.icp_content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = active.icp_content.split(/\s+/).filter(Boolean).length
  const createdDate = formatDate(active.created_at)

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
    >
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
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <Image src={logoUrl} alt={clientName} width={28} height={28} className="object-contain p-0.5" unoptimized />
              </div>
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
              >
                <span className="text-xs font-bold" style={{ color: 'var(--text-3)' }}>{clientName.charAt(0)}</span>
              </div>
            )}
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-1)' }}>{clientName}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>ICP Research Document</p>
            </div>
          </div>
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
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap">
          <ConfidenceBadge level={active.confidence_level} />
          <MetaTag label="Created" value={createdDate} />
          <MetaTag label="Words" value={String(wordCount)} />
          {active.has_transcript && (
            <MetaTag label="Sources" value="interview +" />
          )}
        </div>
      </div>

      {/* ── Version selector (if multiple) ── */}
      {versions.length > 1 && (
        <div
          className="px-5 py-2.5 flex items-center gap-2 overflow-x-auto"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider shrink-0" style={{ color: 'var(--text-3)' }}>
            Version
          </span>
          {versions
            .slice()
            .sort((a, b) => b.version - a.version)
            .map(v => (
              <button
                key={v.id}
                onClick={() => setActiveId(v.id)}
                className="shrink-0 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all"
                style={{
                  background: v.id === activeId ? 'var(--text-1)' : 'var(--bg-hover)',
                  color: v.id === activeId ? 'var(--bg)' : 'var(--text-2)',
                  border: '1px solid var(--border)',
                }}
              >
                v{v.version}
                <span className="ml-1 opacity-60">
                  {formatDateShort(v.created_at)}
                </span>
              </button>
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
            <SourceTag label="interview transcript" />
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
        ">
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

function SourceTag({ label }: { label: string }) {
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded"
      style={{ background: 'var(--bg-hover)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
    >
      {label}
    </span>
  )
}
