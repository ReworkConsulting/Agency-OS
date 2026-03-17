'use client'

import { useState } from 'react'
import { AdCampaignBuilder } from '@/components/ads/AdCampaignBuilder'
import { AdGallery } from '@/components/ads/AdGallery'
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

  function handleAdsGenerated(newAds: AdCreative[]) {
    setCreatives((prev) => [...newAds, ...prev])
    setGeneratingCount(0)
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-[340px_1fr] gap-8 items-start">
        {/* Left: Campaign Builder */}
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
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-zinc-300">
              {creatives.length > 0
                ? `${creatives.length} Ad${creatives.length !== 1 ? 's' : ''} Generated`
                : 'Ad Gallery'}
            </h2>
            {generatingCount > 0 && (
              <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Generating {generatingCount} ad{generatingCount !== 1 ? 's' : ''}...
              </span>
            )}
          </div>
          <AdGallery creatives={creatives} loadingCount={generatingCount} />
        </div>
      </div>
    </div>
  )
}
