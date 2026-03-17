'use client'

import { useEffect, useRef } from 'react'
import { formatDate } from '@/lib/format-date'
import type { BrandAd } from './BrandAdCard'
import { BrandAvatar } from './BrandAvatar'

interface BrandAdDetailModalProps {
  ad: BrandAd
  onClose: () => void
  onDelete: (id: string) => void
}

export function BrandAdDetailModal({ ad, onClose, onDelete }: BrandAdDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleDelete() {
    await fetch(`/api/brand-ads/${ad.id}`, { method: 'DELETE' })
    onDelete(ad.id)
    onClose()
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text)
  }

  const imageUrl = ad.image_url ?? ad.original_image_url

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="w-full max-w-4xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl">

        {/* Left: Full image */}
        <div className="md:w-[55%] bg-zinc-950 flex items-center justify-center overflow-hidden min-h-[280px]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={ad.headline ?? ad.brand_name}
              className="w-full h-full object-contain max-h-[90vh]"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-700">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs">No image</p>
            </div>
          )}
        </div>

        {/* Right: Info panel */}
        <div className="md:w-[45%] flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <BrandAvatar name={ad.brand_name} logoUrl={ad.brand_logo_url} size="sm" />
              <div>
                <p className="text-sm font-semibold text-white leading-none">{ad.brand_name}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5 capitalize">{ad.platform}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Copy fields */}
          <div className="flex-1 px-5 py-4 space-y-4">
            {ad.headline && (
              <CopyField label="Headline" text={ad.headline} onCopy={handleCopy} />
            )}
            {ad.body_text && (
              <CopyField label="Body Text" text={ad.body_text} onCopy={handleCopy} multiline />
            )}
            {ad.cta && (
              <CopyField label="CTA" text={ad.cta} onCopy={handleCopy} />
            )}

            {!ad.headline && !ad.body_text && !ad.cta && (
              <p className="text-xs text-zinc-600 italic">
                No copy saved with this ad. Add copy manually when saving brand ads.
              </p>
            )}

            {/* Meta info */}
            <div className="border-t border-zinc-800 pt-4 space-y-1.5">
              <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-600 mb-2">Details</p>
              {ad.brand_page_url && (
                <a
                  href={ad.brand_page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View in Ad Library
                </a>
              )}
              <p className="text-xs text-zinc-600">
                Saved {formatDate(ad.created_at)}
              </p>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-5 py-4 border-t border-zinc-800 flex items-center gap-2 shrink-0">
            {imageUrl && (
              <button
                onClick={() => handleCopy(imageUrl)}
                className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700 transition-colors"
              >
                Copy Image URL
              </button>
            )}
            <button
              onClick={handleDelete}
              className="py-2 px-3 rounded-lg border border-zinc-800 text-zinc-500 text-xs hover:text-red-400 hover:border-red-900/50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CopyField({
  label,
  text,
  onCopy,
  multiline = false,
}: {
  label: string
  text: string
  onCopy: (t: string) => void
  multiline?: boolean
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">{label}</p>
        <button
          onClick={() => onCopy(text)}
          className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Copy
        </button>
      </div>
      <p className={`text-xs text-zinc-300 leading-relaxed ${multiline ? '' : 'truncate'}`}>
        {text}
      </p>
    </div>
  )
}
