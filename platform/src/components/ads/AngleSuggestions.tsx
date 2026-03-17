'use client'

import { useState, useEffect } from 'react'

export interface AngleSuggestion {
  label: string
  description: string
  angle_type: string
  target_profile: string
}

const ANGLE_TYPE_COLORS: Record<string, string> = {
  'Pain Point': 'text-red-400 bg-red-950/40 border-red-900/50',
  'Aspiration': 'text-purple-400 bg-purple-950/40 border-purple-900/50',
  'Offer': 'text-green-400 bg-green-950/40 border-green-900/50',
  'Social Proof': 'text-blue-400 bg-blue-950/40 border-blue-900/50',
  'Urgency': 'text-orange-400 bg-orange-950/40 border-orange-900/50',
  'Education': 'text-zinc-400 bg-zinc-800/60 border-zinc-700/50',
}

interface AngleSuggestionsProps {
  clientSlug: string
  hasIcp: boolean
  selectedAngles: Set<string>
  onToggle: (label: string) => void
}

export function AngleSuggestions({ clientSlug, hasIcp, selectedAngles, onToggle }: AngleSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AngleSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchSuggestions() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ads/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_slug: clientSlug }),
      })
      const data = await res.json()
      if (data.suggestions) {
        setSuggestions(data.suggestions)
        setLoaded(true)
      } else {
        setError('Could not load suggestions')
      }
    } catch {
      setError('Failed to load suggestions')
    } finally {
      setLoading(false)
    }
  }

  // Auto-load on mount
  useEffect(() => {
    fetchSuggestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientSlug])

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500">AI Angle Suggestions</label>
          {!hasIcp && (
            <span className="text-[10px] text-amber-600 border border-amber-900/50 bg-amber-950/30 px-1.5 py-0.5 rounded">
              No ICP — using defaults
            </span>
          )}
        </div>
        <button
          onClick={fetchSuggestions}
          disabled={loading}
          className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1 disabled:opacity-40"
        >
          <RefreshIcon />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-zinc-900 border border-zinc-800 rounded-md animate-pulse" />
          ))}
        </div>
      )}

      {error && !loading && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {loaded && !loading && suggestions.length > 0 && (
        <div className="space-y-1.5">
          {suggestions.map((s) => {
            const isSelected = selectedAngles.has(s.label)
            const typeStyle = ANGLE_TYPE_COLORS[s.angle_type] ?? ANGLE_TYPE_COLORS['Education']

            return (
              <button
                key={s.label}
                onClick={() => onToggle(s.label)}
                className={`w-full text-left px-3 py-2.5 rounded-md border transition-all ${
                  isSelected
                    ? 'border-zinc-500 bg-zinc-800'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className={`mt-0.5 flex-shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      isSelected ? 'bg-white border-white' : 'border-zinc-600'
                    }`}>
                      {isSelected && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4L3 5.5L6.5 2" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-xs font-medium leading-snug ${isSelected ? 'text-zinc-100' : 'text-zinc-300'}`}>
                        {s.label}
                      </p>
                      <p className="text-[11px] text-zinc-600 leading-snug mt-0.5 truncate">
                        {s.description}
                      </p>
                    </div>
                  </div>
                  <span className={`flex-shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded border ${typeStyle}`}>
                    {s.angle_type}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {selectedAngles.size > 0 && (
        <p className="text-[11px] text-zinc-600 mt-2">
          {selectedAngles.size} angle{selectedAngles.size !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  )
}

function RefreshIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path
        d="M8.5 5A3.5 3.5 0 1 1 5 1.5M5 1.5L7 3.5M5 1.5V0"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
