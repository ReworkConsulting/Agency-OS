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
  visual_style: string
  ad_size: string
  saved_to_library?: boolean
  created_at?: string
}

interface AdCardProps {
  ad: AdCreative
  isLoading?: boolean
  onUnsave?: (id: string) => void
}

export function AdCard({ ad, isLoading, onUnsave }: AdCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [savedToLibrary, setSavedToLibrary] = useState(ad.saved_to_library ?? false)
  const [savingToLibrary, setSavingToLibrary] = useState(false)

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

  if (isLoading) {
    return (
      <div className="border border-zinc-800 rounded-lg overflow-hidden animate-pulse">
        <div className="bg-zinc-900 aspect-square w-full" />
        <div className="p-4 space-y-2">
          <div className="h-3 bg-zinc-800 rounded w-3/4" />
          <div className="h-3 bg-zinc-800 rounded w-full" />
          <div className="h-3 bg-zinc-800 rounded w-1/2" />
        </div>
      </div>
    )
  }

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden group hover:border-zinc-700 transition-colors">
      {/* Image area */}
      <div className="relative bg-zinc-900 aspect-square overflow-hidden">
        {ad.image_url && !imgError ? (
          <img
            src={ad.image_url}
            alt={ad.headline}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-zinc-700 text-xs">
              {ad.image_status === 'failed' ? 'Image generation failed' : 'No image'}
            </span>
          </div>
        )}

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          {ad.image_url && !imgError && (
            <a
              href={ad.image_url}
              download={`ad-${ad.id}.jpg`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-white text-black text-xs font-medium rounded hover:bg-zinc-100 transition-colors"
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
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-black/70 text-zinc-400 text-xs px-1.5 py-0.5 rounded">
              {sizeLabel[ad.ad_size] ?? ad.ad_size}
            </span>
          </div>
        </div>

        {/* Save to library button */}
        <button
          onClick={toggleLibrary}
          disabled={savingToLibrary}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded bg-black/70 flex items-center justify-center hover:bg-black/90 disabled:opacity-40"
          title={savedToLibrary ? 'Remove from library' : 'Save to library'}
        >
          <BookmarkIcon filled={savedToLibrary} />
        </button>
      </div>

      {/* Copy */}
      <div className="p-4 space-y-3">
        {/* Hook */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Hook</p>
          <p className="text-sm text-zinc-200 leading-snug font-medium">{ad.hook}</p>
        </div>

        {/* Primary text */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Primary Text</p>
          <p className={`text-xs text-zinc-400 leading-relaxed ${!expanded ? 'line-clamp-3' : ''}`}>
            {ad.primary_text}
          </p>
          {ad.primary_text?.length > 150 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-zinc-600 hover:text-zinc-400 mt-1 transition-colors"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* Headline + CTA */}
        <div className="flex items-start justify-between gap-3 pt-1 border-t border-zinc-800">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Headline</p>
            <p className="text-xs text-zinc-300 font-medium">{ad.headline}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">CTA</p>
            <p className="text-xs text-zinc-300 font-medium">{ad.cta}</p>
          </div>
        </div>

        {/* Angle tag */}
        {ad.angle && (
          <div className="pt-1">
            <span className="inline-block text-xs text-zinc-600 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded truncate max-w-full">
              {ad.angle}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
