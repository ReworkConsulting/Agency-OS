'use client'

import { useState } from 'react'
import { BrandAvatar } from './BrandAvatar'
import { BrandAdDetailModal } from './BrandAdDetailModal'

export interface BrandAd {
  id: string
  brand_name: string
  brand_page_url: string | null
  brand_logo_url: string | null
  image_url: string | null
  original_image_url: string | null
  headline: string | null
  body_text: string | null
  cta: string | null
  tags: string[]
  platform: string
  created_at: string
}

interface BrandAdCardProps {
  ad: BrandAd
  onDelete?: (id: string) => void
  onUseAsReference?: (url: string) => void
}

export function BrandAdCard({ ad, onDelete, onUseAsReference }: BrandAdCardProps) {
  const [imgError, setImgError] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const imageUrl = ad.image_url ?? ad.original_image_url

  return (
    <>
      <div
        className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 cursor-pointer hover:border-zinc-700 transition-colors"
        onClick={() => setDetailOpen(true)}
      >
        {/* Image — full natural dimensions */}
        <div className="relative bg-zinc-900 overflow-hidden">
          {imageUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={ad.headline ?? ad.brand_name}
              className="w-full h-auto block"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full aspect-square flex items-center justify-center">
              <span className="text-xs text-zinc-600">No image</span>
            </div>
          )}

          {/* Platform badge */}
          <div className="absolute top-2 right-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900/80 text-zinc-400 capitalize">
              {ad.platform}
            </span>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-xs text-white font-medium bg-black/60 px-3 py-1.5 rounded-lg">
              View Details
            </span>
          </div>
        </div>

        {/* Brand footer */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-zinc-800">
          <BrandAvatar name={ad.brand_name} logoUrl={ad.brand_logo_url} size="xs" />
          <p className="text-xs text-zinc-400 font-medium truncate">{ad.brand_name}</p>
          {ad.cta && (
            <span className="ml-auto shrink-0 text-[10px] px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-600">
              {ad.cta}
            </span>
          )}
        </div>
      </div>

      {detailOpen && (
        <BrandAdDetailModal
          ad={ad}
          onClose={() => setDetailOpen(false)}
          onDelete={(id) => {
            onDelete?.(id)
            setDetailOpen(false)
          }}
        />
      )}
    </>
  )
}
