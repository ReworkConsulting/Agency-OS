'use client'

import { useState } from 'react'

export interface VideoScript {
  id: string
  hook_text: string
  body_text: string
  cta_text: string
  broll_notes: string | null
  director_note: string | null
  word_count: number
  script_length: string
  script_style: string
  audience_type: string
  output_type: string
  status: string
  is_winner: boolean
  created_at?: string
}

interface ScriptCardProps {
  script: VideoScript
  isLoading?: boolean
  onStatusChange?: (id: string, status: string) => void
  onWinnerToggle?: (id: string, next: boolean) => void
}

export function ScriptCard({ script, isLoading, onStatusChange, onWinnerToggle }: ScriptCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showBroll, setShowBroll] = useState(false)
  const [showDirector, setShowDirector] = useState(false)
  const [status, setStatus] = useState(script.status)
  const [isWinner, setIsWinner] = useState(script.is_winner)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [mutating, setMutating] = useState(false)

  const outputType = script.output_type ?? 'videos'

  const statusColor: Record<string, string> = {
    draft: 'var(--text-4)',
    approved: '#22c55e',
    rejected: '#ef4444',
    in_review: '#f59e0b',
    used: '#6366f1',
  }

  async function copyField(text: string, fieldKey: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldKey)
      setTimeout(() => setCopiedField(null), 1800)
    } catch {
      // silent fail
    }
  }

  async function copyFullScript() {
    let full = ''
    if (outputType === 'headlines') {
      full = script.body_text
    } else if (outputType === 'ad_copy') {
      full = [
        script.hook_text ? `[PRIMARY TEXT]\n${script.hook_text}` : '',
        script.body_text ? script.body_text : '',
        script.cta_text ? `\n[HEADLINE]\n${script.cta_text}` : '',
      ].filter(Boolean).join('\n')
    } else {
      full = [
        `[HOOK]\n${script.hook_text}`,
        `\n[BODY]\n${script.body_text}`,
        `\n[CTA]\n${script.cta_text}`,
        script.director_note ? `\n[DIRECTOR NOTE]\n${script.director_note}` : '',
      ].filter(Boolean).join('\n')
    }
    await copyField(full, 'full')
  }

  async function handleApprove() {
    if (mutating) return
    setMutating(true)
    try {
      await fetch(`/api/scripts/${script.id}/approve`, { method: 'PATCH' })
      setStatus('approved')
      onStatusChange?.(script.id, 'approved')
    } catch {
      // silent fail
    } finally {
      setMutating(false)
    }
  }

  async function handleReject() {
    if (mutating || !rejectionReason.trim()) return
    setMutating(true)
    try {
      await fetch(`/api/scripts/${script.id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      })
      setStatus('rejected')
      setShowRejectInput(false)
      onStatusChange?.(script.id, 'rejected')
    } catch {
      // silent fail
    } finally {
      setMutating(false)
    }
  }

  async function toggleWinner() {
    if (mutating) return
    setMutating(true)
    const next = !isWinner
    try {
      await fetch(`/api/scripts/${script.id}/winner`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner: next }),
      })
      setIsWinner(next)
      onWinnerToggle?.(script.id, next)
    } catch {
      // silent fail
    } finally {
      setMutating(false)
    }
  }

  if (isLoading) {
    return (
      <div
        className="rounded-xl overflow-hidden animate-pulse"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
      >
        <div className="p-4 space-y-3">
          <div className="h-3 rounded w-1/3" style={{ background: 'var(--bg-hover)' }} />
          <div className="h-4 rounded w-full" style={{ background: 'var(--bg-hover)' }} />
          <div className="h-4 rounded w-5/6" style={{ background: 'var(--bg-hover)' }} />
          <div className="h-4 rounded w-full" style={{ background: 'var(--bg-hover)' }} />
          <div className="h-4 rounded w-2/3" style={{ background: 'var(--bg-hover)' }} />
          <div className="h-3 rounded w-1/4 mt-4" style={{ background: 'var(--bg-hover)' }} />
        </div>
      </div>
    )
  }

  const outputLabel = outputType === 'ad_copy' ? 'Ad Copy' : outputType === 'headlines' ? 'Headlines' : 'Video'

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: `1px solid ${isWinner ? 'rgb(180 120 30 / 0.5)' : 'var(--border)'}`,
        background: 'var(--bg-card)',
        boxShadow: isWinner ? '0 0 0 1px rgb(180 120 30 / 0.15)' : undefined,
      }}
    >
      {/* Header row */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-dim)', background: 'var(--bg-subtle)' }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-2)', border: '1px solid var(--border-dim)' }}
          >
            {outputLabel}
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-3)', border: '1px solid var(--border-dim)' }}
          >
            {script.script_style}
          </span>
          {outputType === 'videos' && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-3)', border: '1px solid var(--border-dim)' }}
            >
              {script.script_length}
            </span>
          )}
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-3)', border: '1px solid var(--border-dim)' }}
          >
            {script.audience_type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {script.word_count > 0 && outputType === 'videos' && (
            <span className="text-[10px]" style={{ color: 'var(--text-4)' }}>
              {script.word_count}w
            </span>
          )}
          <span className="text-[10px] font-medium" style={{ color: statusColor[status] ?? 'var(--text-4)' }}>
            {status}
          </span>
          {isWinner && (
            <span className="text-[10px] text-yellow-400">★ Winner</span>
          )}
        </div>
      </div>

      {/* Script content */}
      <div className="p-4 space-y-4">

        {/* ── VIDEOS layout: Hook / Body / CTA ── */}
        {outputType === 'videos' && (
          <>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>Hook</p>
                <CopyButton text={script.hook_text} fieldKey="hook" copiedField={copiedField} onCopy={copyField} />
              </div>
              <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-1)' }}>
                {script.hook_text}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>Body</p>
                <CopyButton text={script.body_text} fieldKey="body" copiedField={copiedField} onCopy={copyField} />
              </div>
              <p
                className="text-xs leading-relaxed whitespace-pre-wrap"
                style={{
                  color: 'var(--text-2)',
                  display: expanded ? undefined : '-webkit-box',
                  WebkitLineClamp: expanded ? undefined : 5,
                  WebkitBoxOrient: 'vertical',
                  overflow: expanded ? undefined : 'hidden',
                } as React.CSSProperties}
              >
                {script.body_text}
              </p>
              {script.body_text?.length > 200 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-[10px] mt-1"
                  style={{ color: 'var(--text-4)' }}
                >
                  {expanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>

            <div className="pt-2" style={{ borderTop: '1px solid var(--border-dim)' }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold tracking-widests uppercase" style={{ color: 'var(--text-3)' }}>CTA</p>
                <CopyButton text={script.cta_text} fieldKey="cta" copiedField={copiedField} onCopy={copyField} />
              </div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-1)' }}>{script.cta_text}</p>
            </div>

            {script.director_note && (
              <div className="pt-2" style={{ borderTop: '1px solid var(--border-dim)' }}>
                <button
                  onClick={() => setShowDirector(!showDirector)}
                  className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5"
                  style={{ color: 'var(--text-3)' }}
                >
                  <span>{showDirector ? '▾' : '▸'}</span>
                  Director Note
                </button>
                {showDirector && (
                  <p className="mt-1.5 text-[11px] italic leading-relaxed" style={{ color: 'var(--text-3)' }}>
                    {script.director_note}
                  </p>
                )}
              </div>
            )}

            {script.broll_notes && (
              <div className="pt-2" style={{ borderTop: '1px solid var(--border-dim)' }}>
                <button
                  onClick={() => setShowBroll(!showBroll)}
                  className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5"
                  style={{ color: 'var(--text-3)' }}
                >
                  <span>{showBroll ? '▾' : '▸'}</span>
                  B-Roll Notes
                </button>
                {showBroll && (
                  <p className="mt-1.5 text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-3)' }}>
                    {script.broll_notes}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* ── AD COPY layout: Primary Text / Headline / CTA ── */}
        {outputType === 'ad_copy' && (
          <>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>Primary Text</p>
                <CopyButton text={`${script.hook_text}\n\n${script.body_text}`} fieldKey="primary" copiedField={copiedField} onCopy={copyField} />
              </div>
              <p
                className="text-xs leading-relaxed whitespace-pre-wrap"
                style={{
                  color: 'var(--text-2)',
                  display: expanded ? undefined : '-webkit-box',
                  WebkitLineClamp: expanded ? undefined : 6,
                  WebkitBoxOrient: 'vertical',
                  overflow: expanded ? undefined : 'hidden',
                } as React.CSSProperties}
              >
                {script.hook_text}{script.body_text ? `\n\n${script.body_text}` : ''}
              </p>
              {(script.hook_text + script.body_text).length > 300 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-[10px] mt-1"
                  style={{ color: 'var(--text-4)' }}
                >
                  {expanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>

            {script.cta_text && (
              <div className="pt-2" style={{ borderTop: '1px solid var(--border-dim)' }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>Headline</p>
                  <CopyButton text={script.cta_text} fieldKey="headline" copiedField={copiedField} onCopy={copyField} />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{script.cta_text}</p>
              </div>
            )}
          </>
        )}

        {/* ── HEADLINES layout: list of variations ── */}
        {outputType === 'headlines' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>Headlines</p>
              <CopyButton text={script.body_text} fieldKey="all" copiedField={copiedField} onCopy={copyField} />
            </div>
            <div className="space-y-1.5">
              {script.body_text?.split('\n').filter(l => l.trim()).map((line, i) => {
                const angleMatch = line.match(/^\[([^\]]+)\]/)
                const angle = angleMatch?.[1]
                const text = angle ? line.slice(angleMatch[0].length).trim() : line
                return (
                  <div key={i} className="flex items-start gap-2 group">
                    {angle && (
                      <span
                        className="text-[9px] font-bold shrink-0 mt-0.5 px-1 py-0.5 rounded"
                        style={{ background: 'var(--bg-hover)', color: 'var(--text-4)', border: '1px solid var(--border-dim)' }}
                      >
                        {angle}
                      </span>
                    )}
                    <p className="text-xs flex-1" style={{ color: 'var(--text-1)' }}>{text}</p>
                    <button
                      onClick={() => copyField(text, `h-${i}`)}
                      className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      style={{ color: copiedField === `h-${i}` ? '#22c55e' : 'var(--text-4)' }}
                    >
                      {copiedField === `h-${i}` ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div
        className="px-4 py-3 space-y-2"
        style={{ borderTop: '1px solid var(--border-dim)', background: 'var(--bg-subtle)' }}
      >
        {showRejectInput && (
          <div className="flex gap-2">
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Why is this being rejected?"
              className="flex-1 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
              style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
              onKeyDown={(e) => e.key === 'Enter' && handleReject()}
            />
            <button
              onClick={handleReject}
              disabled={!rejectionReason.trim() || mutating}
              className="px-2 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
              style={{ background: '#ef4444', color: 'white' }}
            >
              Confirm
            </button>
            <button
              onClick={() => setShowRejectInput(false)}
              className="px-2 py-1.5 rounded-lg text-xs"
              style={{ color: 'var(--text-3)', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
          </div>
        )}

        {!showRejectInput && (
          <div className="flex items-center gap-2">
            <button
              onClick={copyFullScript}
              className="flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
            >
              {copiedField === 'full' ? '✓ Copied' : 'Copy All'}
            </button>

            {status !== 'approved' && (
              <button
                onClick={handleApprove}
                disabled={mutating}
                className="flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-40"
                style={{ background: '#16a34a', color: 'white' }}
              >
                Approve
              </button>
            )}

            {status !== 'rejected' && (
              <button
                onClick={() => setShowRejectInput(true)}
                disabled={mutating}
                className="px-3 py-1.5 rounded-lg text-[11px] transition-colors disabled:opacity-40"
                style={{ color: '#ef4444', border: '1px solid rgb(239 68 68 / 0.3)' }}
              >
                Reject
              </button>
            )}

            <button
              onClick={toggleWinner}
              disabled={mutating}
              title={isWinner ? 'Remove winner mark' : 'Mark as winner'}
              className="w-7 h-7 flex items-center justify-center rounded-lg disabled:opacity-40"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-hover)' }}
            >
              <StarIcon filled={isWinner} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function CopyButton({
  text,
  fieldKey,
  copiedField,
  onCopy,
}: {
  text: string
  fieldKey: string
  copiedField: string | null
  onCopy: (text: string, key: string) => void
}) {
  const copied = copiedField === fieldKey
  return (
    <button
      onClick={() => onCopy(text, fieldKey)}
      className="text-[10px] transition-colors shrink-0"
      style={{ color: copied ? '#22c55e' : 'var(--text-4)' }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 5.7l4-.6L8 1.5z"
        fill={filled ? '#fbbf24' : 'none'}
        stroke={filled ? '#fbbf24' : 'currentColor'}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}
