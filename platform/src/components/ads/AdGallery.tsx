'use client'

import { AdCard, type AdCreative } from './AdCard'

interface AdGalleryProps {
  creatives: AdCreative[]
  loadingCount?: number
  onUnsave?: (id: string) => void
}

export function AdGallery({ creatives, loadingCount = 0, onUnsave }: AdGalleryProps) {
  const isEmpty = creatives.length === 0 && loadingCount === 0

  if (isEmpty) {
    return (
      <div className="border border-zinc-800 rounded-lg p-12 text-center">
        <p className="text-xs text-zinc-600">No ads generated yet.</p>
        <p className="text-xs text-zinc-700 mt-1">
          Fill out the form and click Generate to create your first batch.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
      {creatives.map((ad) => (
        <AdCard key={ad.id} ad={ad} onUnsave={onUnsave} />
      ))}
      {Array.from({ length: loadingCount }).map((_, i) => (
        <AdCard
          key={`loading-${i}`}
          ad={{} as AdCreative}
          isLoading
        />
      ))}
    </div>
  )
}
