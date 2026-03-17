'use client'

import { useState } from 'react'

export interface AdCreative {
  id: string
  hook: string
  primary_text: string
  headline: string
  cta: string
  image_url: string | null
  image_status: string
  angle: string
  visual_style?: string
  ad_format?: string
  ad_size: string
  saved_to_library?: boolean
  is_winner?: boolean
  created_at?: string
}

interface AdCardProps {
  ad: AdCreative
  isLoading?: boolean
  onUnsave?: (id: string) => void
  onWinnerToggle?: (id: string, next: boolean) => void
}

export function AdCard({ ad, isLoading, onUnsave, onWinnerToggle }: AdCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [savedToLibrary, setSavedToLibrary] = useState(ad.saved_to_library ?? false)
  const [savingToLibrary, setSavingToLibrary] = useState(false)
  const [isWinner, setIsWinner] = useState(ad.is_winner ?? false)
  const [togglingWinner, setTogglingWinner] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const sizeLabel: Record<string, string> = {
    square: '1:1',
    portrait: '4:5',
    story: '9:16',
  }

  async function toggleLibrary() {
    if (savingToLibrary || !ad.id) return
    setSavingToLibrary(true)
    const next = !savedToLibrary
    try {
      await fetch(`/api/ads/${ad.id}/library`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saved: next }),
      })
      setSavedToLibrary(next)
      if (!next) onUnsave?.(ad.id)
    } catch {
      // silent fail
    } finally {
      setSavingToLibrary(false)
    }
  }

  async function toggleWinner() {
    if (togglingWinner || !ad.id) return
    setTogglingWinner(true)
    const next = !isWinner
    try {
      await fetch(`/api/ads/${ad.id}/winner`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner: next }),
      })
      setIsWinner(next)
      onWinnerToggle?.(ad.id, next)
    } catch {
      // silent fail
    } finally {
      setTogglingWinner(false)
    }
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

  if (isLoading) {
    return (
      <div
        className="rounded-xl overflow-hidden animate-pulse"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
      >
        <div className="aspect-square w-full" style={{ background: 'var(--bg-subtle)' }} />
        <div className="p-4 space-y-2">
          <div className="h-3 rounded w-3/4" style={{ background: 'var(--bg-hover)' }} />
          <div className="h-3 rounded w-full" style={{ background: 'var(--bg-hover)' }} />
          <div className="h-3 rounded w-1/2" style={{ background: 'var(--bg-hover)' }} />
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl overflow-hidden group hover:border-opacity-60 transition-colors"
      style={{
        border: `1px solid ${isWinner ? 'rgb(180 120 30 / 0.5)' : 'var(--border)'}`,
        background: 'var(--bg-card)',
        boxShadow: isWinner ? '0 0 0 1px rgb(180 120 30 / 0.15)' : undefined,
      }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
        {ad.image_url && !imgError ? (
          <img
            src={ad.image_url}
            alt={ad.headline}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs" style={{ color: 'var(--text-4)' }}>
              {ad.image_status === 'failed' ? 'Image generation failed' : 'No image'}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 bg-black/50">
          {ad.image_url && !imgError && (
            <a
              href={ad.image_url}
              download={`ad-${ad.id}.jpg`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-white text-black text-xs font-medium rounded-lg hover:bg-zinc-100 transition-colors"
            >
              Download
            </a>
          )}
        </div>

        {/* Top badges */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between pointer-events-none group-hover:pointer-events-auto">
          <div className="flex items-center gap-1">
            {savedToLibrary && (
              <span className="text-[9px] bg-amber-950/80 border border-amber-800/60 text-amber-400 px-1.5 py-0.5 rounded">
                In Library
              </span>
            )}
            {isWinner && (
              <span className="text-[9px] bg-yellow-950/80 border border-yellow-700/60 text-yellow-400 px-1.5 py-0.5 rounded">
                ★ Winner
              </span>
            )}
          </div>
          <span className="text-[10px] bg-black/60 text-zinc-400 px-1.5 py-0.5 rounded">
            {sizeLabel[ad.ad_size] ?? ad.ad_size}
          </span>
        </div>

        {/* Action buttons (bottom-right) */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Winner toggle */}
          <button
            onClick={toggleWinner}
            disabled={togglingWinner}
            title={isWinner ? 'Remove winner mark' : 'Mark as winner'}
            className="w-7 h-7 rounded flex items-center justify-center bg-black/70 hover:bg-black/90 disabled:opacity-40 transition-colors"
          >
            <StarIcon filled={isWinner} />
          </button>
          {/* Library toggle */}
          <button
            onClick={toggleLibrary}
            disabled={savingToLibrary}
            title={savedToLibrary ? 'Remove from library' : 'Save to library'}
            className="w-7 h-7 rounded flex items-center justify-center bg-black/70 hover:bg-black/90 disabled:opacity-40 transition-colors"
          >
            <BookmarkIcon filled={savedToLibrary} />
          </button>
        </div>
      </div>

      {/* Copy */}
      <div className="p-4 space-y-3">

        {/* Hook */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>Hook</p>
            <CopyButton text={ad.hook} fieldKey="hook" copiedField={copiedField} onCopy={copyField} />
          </div>
          <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-1)' }}>{ad.hook}</p>
        </div>

        {/* Primary text */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>Primary Text</p>
            <CopyButton text={ad.primary_text} fieldKey="primary" copiedField={copiedField} onCopy={copyField} />
          </div>
          <p
            className="text-xs leading-relaxed"
            style={{ color: 'var(--text-2)', display: expanded ? undefined : '-webkit-box', WebkitLineClamp: expanded ? undefined : 3, WebkitBoxOrient: 'vertical', overflow: expanded ? undefined : 'hidden' } as React.CSSProperties}
          >
            {ad.primary_text}
          </p>
          {ad.primary_text?.length > 150 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[10px] mt-1 transition-colors"
              style={{ color: 'var(--text-4)' }}
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* Headline + CTA */}
        <div
          className="flex items-start justify-between gap-3 pt-2"
          style={{ borderTop: '1px solid var(--border-dim)' }}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>Headline</p>
              <CopyButton text={ad.headline} fieldKey="headline" copiedField={copiedField} onCopy={copyField} />
            </div>
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-1)' }}>{ad.headline}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-bold tracking-widest uppercase mb-0.5" style={{ color: 'var(--text-3)' }}>CTA</p>
            <p className="text-xs font-medium" style={{ color: 'var(--text-1)' }}>{ad.cta}</p>
          </div>
        </div>

        {/* Tags row: angle + format */}
        {(ad.angle || ad.ad_format) && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {ad.angle && (
              <span
                className="inline-block text-[10px] px-2 py-0.5 rounded truncate max-w-[140px]"
                style={{ background: 'var(--bg-subtle)', color: 'var(--text-3)', border: '1px solid var(--border-dim)' }}
              >
                {ad.angle}
              </span>
            )}
            {ad.ad_format && (
              <span
                className="inline-block text-[10px] px-2 py-0.5 rounded truncate max-w-[140px]"
                style={{ background: 'var(--bg-subtle)', color: 'var(--text-3)', border: '1px solid var(--border-dim)' }}
              >
                {ad.ad_format}
              </span>
            )}
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
        stroke={filled ? '#fbbf24' : 'white'}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path
        d="M3 2h8a1 1 0 0 1 1 1v9l-5-2.5L2 12V3a1 1 0 0 1 1-1z"
        stroke={filled ? '#fbbf24' : 'white'}
        strokeWidth="1.2"
        fill={filled ? '#fbbf24' : 'none'}
        strokeLinejoin="round"
      />
    </svg>
  )
}
