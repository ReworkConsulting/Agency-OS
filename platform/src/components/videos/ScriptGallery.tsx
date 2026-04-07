'use client'

import { ScriptCard, type VideoScript } from './ScriptCard'

interface ScriptGalleryProps {
  scripts: VideoScript[]
  loadingCount?: number
  onStatusChange?: (id: string, status: string) => void
  onWinnerToggle?: (id: string, next: boolean) => void
}

export function ScriptGallery({ scripts, loadingCount = 0, onStatusChange, onWinnerToggle }: ScriptGalleryProps) {
  const isEmpty = scripts.length === 0 && loadingCount === 0

  if (isEmpty) {
    return (
      <div
        className="rounded-xl p-12 text-center"
        style={{ border: '1px solid var(--border)' }}
      >
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>No scripts generated yet.</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-4)' }}>
          Fill out the brief and click Generate to write your first batch.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {scripts.map((script) => (
        <ScriptCard
          key={script.id}
          script={script}
          onStatusChange={onStatusChange}
          onWinnerToggle={onWinnerToggle}
        />
      ))}
      {Array.from({ length: loadingCount }).map((_, i) => (
        <ScriptCard key={`loading-${i}`} script={{} as VideoScript} isLoading />
      ))}
    </div>
  )
}
