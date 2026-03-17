'use client'

import { useState } from 'react'
import { AdCampaignBuilder } from '@/components/ads/AdCampaignBuilder'
import { AdGallery } from '@/components/ads/AdGallery'
import { AdGalleryFilters } from '@/components/ads/AdGalleryFilters'
import type { AdCreative } from '@/components/ads/AdCard'

interface AdsPageClientProps {
  slug: string
  primaryService: string | null
  hasIcp: boolean
  initialCreatives: AdCreative[]
}

export function AdsPageClient({
  slug,
  primaryService,
  hasIcp,
  initialCreatives,
}: AdsPageClientProps) {
  const [creatives, setCreatives] = useState<AdCreative[]>(initialCreatives)
  const [generatingCount, setGeneratingCount] = useState(0)

  // Filter state
  const [filterAngle, setFilterAngle] = useState<string | null>(null)
  const [filterFormat, setFilterFormat] = useState<string | null>(null)
  const [showWinnersOnly, setShowWinnersOnly] = useState(false)

  function handleAdsGenerated(newAds: AdCreative[]) {
    setCreatives((prev) => [...newAds, ...prev])
    setGeneratingCount(0)
  }

  function handleWinnerToggle(id: string, next: boolean) {
    setCreatives((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_winner: next } : c))
    )
  }

  function handleUnsave(id: string) {
    setCreatives((prev) => prev.filter((c) => c.id !== id))
  }

  // Apply filters
  const visibleCreatives = creatives.filter((c) => {
    if (showWinnersOnly && !c.is_winner) return false
    if (filterAngle && c.angle !== filterAngle) return false
    if (filterFormat && c.ad_format !== filterFormat) return false
    return true
  })

  const hasAds = creatives.length > 0

  return (
    <div className="p-8">
      <div className="grid grid-cols-[420px_1fr] gap-8 items-start">

        {/* Left: Creative Brief (sticky) */}
        <div className="sticky top-8">
          <AdCampaignBuilder
            clientSlug={slug}
            primaryService={primaryService}
            hasIcp={hasIcp}
            onAdsGenerated={handleAdsGenerated}
            onGeneratingChange={setGeneratingCount}
          />
        </div>

        {/* Right: Gallery */}
        <div className="min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
              {hasAds
                ? `${creatives.length} Ad${creatives.length !== 1 ? 's' : ''} Generated`
                : 'Ad Gallery'}
            </h2>
            {generatingCount > 0 && (
              <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Generating {generatingCount} ad{generatingCount !== 1 ? 's' : ''}…
              </span>
            )}
          </div>

          {hasAds && (
            <div className="mb-4">
              <AdGalleryFilters
                creatives={creatives}
                filterAngle={filterAngle}
                filterFormat={filterFormat}
                showWinnersOnly={showWinnersOnly}
                visibleCount={visibleCreatives.length}
                onFilterAngle={setFilterAngle}
                onFilterFormat={setFilterFormat}
                onToggleWinners={setShowWinnersOnly}
              />
            </div>
          )}

          <AdGallery
            creatives={visibleCreatives}
            loadingCount={generatingCount}
            onUnsave={handleUnsave}
            onWinnerToggle={handleWinnerToggle}
          />
        </div>
      </div>
    </div>
  )
}
