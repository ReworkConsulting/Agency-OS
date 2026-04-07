'use client'

import { useState } from 'react'
import { ScriptBuilder } from '@/components/videos/ScriptBuilder'
import { ScriptGallery } from '@/components/videos/ScriptGallery'
import type { VideoScript } from '@/components/videos/ScriptCard'

interface VideosPageClientProps {
  slug: string
  primaryService: string | null
  hasIcp: boolean
  initialScripts: VideoScript[]
}

export function VideosPageClient({
  slug,
  primaryService,
  hasIcp,
  initialScripts,
}: VideosPageClientProps) {
  const [scripts, setScripts] = useState<VideoScript[]>(initialScripts)
  const [generatingCount, setGeneratingCount] = useState(0)

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterLength, setFilterLength] = useState<string | null>(null)
  const [showWinnersOnly, setShowWinnersOnly] = useState(false)

  function handleScriptsGenerated(newScripts: VideoScript[]) {
    setScripts((prev) => [...newScripts, ...prev])
    setGeneratingCount(0)
  }

  function handleStatusChange(id: string, status: string) {
    setScripts((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
  }

  function handleWinnerToggle(id: string, next: boolean) {
    setScripts((prev) => prev.map((s) => (s.id === id ? { ...s, is_winner: next } : s)))
  }

  // Apply filters
  const visibleScripts = scripts.filter((s) => {
    if (showWinnersOnly && !s.is_winner) return false
    if (filterStatus && s.status !== filterStatus) return false
    if (filterLength && s.script_length !== filterLength) return false
    return true
  })

  const hasScripts = scripts.length > 0

  // Unique values for filter chips
  const uniqueLengths = [...new Set(scripts.map((s) => s.script_length))].sort()
  const uniqueStatuses = [...new Set(scripts.map((s) => s.status))]

  return (
    <div className="p-8">
      <div className="grid grid-cols-[380px_1fr] gap-8 items-start">

        {/* Left: Script Brief (sticky) */}
        <div className="sticky top-8">
          <ScriptBuilder
            clientSlug={slug}
            primaryService={primaryService}
            hasIcp={hasIcp}
            onScriptsGenerated={handleScriptsGenerated}
            onGeneratingChange={setGeneratingCount}
          />
        </div>

        {/* Right: Gallery */}
        <div className="min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
              {hasScripts
                ? `${scripts.length} Script${scripts.length !== 1 ? 's' : ''} Generated`
                : 'Script Gallery'}
            </h2>
            {generatingCount > 0 && (
              <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Writing {generatingCount} script{generatingCount !== 1 ? 's' : ''}…
              </span>
            )}
          </div>

          {/* Filter chips */}
          {hasScripts && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {/* Winners toggle */}
              <FilterChip
                active={showWinnersOnly}
                onClick={() => setShowWinnersOnly(!showWinnersOnly)}
                label="★ Winners"
              />

              {/* Status filters */}
              {uniqueStatuses.map((status) => (
                <FilterChip
                  key={status}
                  active={filterStatus === status}
                  onClick={() => setFilterStatus(filterStatus === status ? null : status)}
                  label={status}
                />
              ))}

              {/* Length filters */}
              {uniqueLengths.map((length) => (
                <FilterChip
                  key={length}
                  active={filterLength === length}
                  onClick={() => setFilterLength(filterLength === length ? null : length)}
                  label={length}
                />
              ))}

              {/* Clear */}
              {(filterStatus || filterLength || showWinnersOnly) && (
                <button
                  onClick={() => { setFilterStatus(null); setFilterLength(null); setShowWinnersOnly(false) }}
                  className="text-[10px] px-2 py-1 rounded"
                  style={{ color: 'var(--text-4)' }}
                >
                  Clear
                </button>
              )}

              <span className="text-[10px] ml-auto" style={{ color: 'var(--text-4)' }}>
                {visibleScripts.length} of {scripts.length}
              </span>
            </div>
          )}

          <ScriptGallery
            scripts={visibleScripts}
            loadingCount={generatingCount}
            onStatusChange={handleStatusChange}
            onWinnerToggle={handleWinnerToggle}
          />
        </div>
      </div>
    </div>
  )
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="text-[10px] px-2.5 py-1 rounded-full transition-colors font-medium"
      style={{
        background: active ? 'var(--text-1)' : 'var(--bg-hover)',
        color: active ? 'var(--bg)' : 'var(--text-3)',
        border: `1px solid ${active ? 'var(--text-1)' : 'var(--border)'}`,
      }}
    >
      {label}
    </button>
  )
}
