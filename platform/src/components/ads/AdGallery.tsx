'use client'

import { AdCard, type AdCreative } from './AdCard'

interface AdGalleryProps {
  creatives: AdCreative[]
  loadingCount?: number
  onUnsave?: (id: string) => void
  onWinnerToggle?: (id: string, next: boolean) => void
}

export function AdGallery({ creatives, loadingCount = 0, onUnsave, onWinnerToggle }: AdGalleryProps) {
  const isEmpty = creatives.length === 0 && loadingCount === 0

  if (isEmpty) {
    return (
      <div
        className="rounded-xl p-12 text-center"
        style={{ border: '1px solid var(--border)' }}
      >
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>No ads generated yet.</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-4)' }}>
          Fill out the brief and click Generate to create your first batch.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
      {creatives.map((ad) => (
        <AdCard
          key={ad.id}
          ad={ad}
          onUnsave={onUnsave}
          onWinnerToggle={onWinnerToggle}
        />
      ))}
      {Array.from({ length: loadingCount }).map((_, i) => (
        <AdCard key={`loading-${i}`} ad={{} as AdCreative} isLoading />
      ))}
    </div>
  )
}
