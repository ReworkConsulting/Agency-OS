'use client'

import { useState, useEffect, useRef } from 'react'
import type { BrandAd } from './BrandAdCard'

interface AddBrandModalProps {
  open: boolean
  onClose: () => void
  onAdded: (ads: BrandAd[]) => void
  initialBrand?: string  // pre-fill + lock brand name when adding more to existing brand
}

type Tab = 'scrape' | 'manual'

export function AddBrandModal({ open, onClose, onAdded, initialBrand }: AddBrandModalProps) {
  const [tab, setTab] = useState<Tab>('scrape')

  // Scrape tab state
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [scrapeBrand, setScrapeBrand] = useState(initialBrand ?? '')
  const [scrapeLimit, setScrapeLimit] = useState('10')
  const [scraping, setScraping] = useState(false)
  const [scrapeResult, setScrapeResult] = useState<{ count: number; message?: string } | null>(null)
  const [scrapeError, setScrapeError] = useState<string | null>(null)

  // Sync brand name when modal opens with a different initialBrand
  useEffect(() => {
    if (open) {
      setScrapeBrand(initialBrand ?? '')
      setManualBrand(initialBrand ?? '')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialBrand])

  // Manual tab state
  const [manualBrand, setManualBrand] = useState(initialBrand ?? '')
  const [manualImageUrl, setManualImageUrl] = useState('')
  const [manualHeadline, setManualHeadline] = useState('')
  const [manualBodyText, setManualBodyText] = useState('')
  const [manualCta, setManualCta] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  async function handleScrape() {
    if (!scrapeUrl || !scrapeBrand) return
    setScraping(true)
    setScrapeError(null)
    setScrapeResult(null)

    try {
      const res = await fetch('/api/brand-ads/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_url: scrapeUrl,
          brand_name: scrapeBrand,
          limit: parseInt(scrapeLimit),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setScrapeError(data.error ?? 'Scrape failed')
        return
      }

      setScrapeResult({ count: data.count, message: data.message })
      if (data.ads?.length > 0) {
        onAdded(data.ads)
      }
    } catch {
      setScrapeError('Network error — try again')
    } finally {
      setScraping(false)
    }
  }

  async function handleSave() {
    if (!manualBrand || !manualImageUrl) return
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const res = await fetch('/api/brand-ads/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: manualBrand,
          image_url: manualImageUrl,
          headline: manualHeadline || undefined,
          body_text: manualBodyText || undefined,
          cta: manualCta || undefined,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setSaveError(data.error ?? 'Save failed')
        return
      }

      onAdded([data.ad])
      setSaveSuccess(true)
      setManualBrand('')
      setManualImageUrl('')
      setManualHeadline('')
      setManualBodyText('')
      setManualCta('')
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setSaveError('Network error — try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-white">
            {initialBrand ? `Add More — ${initialBrand}` : 'Add Brand Ads'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          {(['scrape', 'manual'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                tab === t
                  ? 'text-white border-b-2 border-white -mb-px'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t === 'scrape' ? 'Scrape from Facebook' : 'Add Manually'}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Scrape Tab */}
          {tab === 'scrape' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500">
                Paste a Facebook Ad Library URL for a brand page. We&apos;ll attempt to extract and save their active ads.
              </p>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={scrapeBrand}
                  onChange={(e) => !initialBrand && setScrapeBrand(e.target.value)}
                  placeholder="e.g. Ryze Coffee"
                  readOnly={!!initialBrand}
                  className={`w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 ${initialBrand ? 'opacity-60 cursor-default' : ''}`}
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Facebook Ad Library URL</label>
                <input
                  type="url"
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  placeholder="https://www.facebook.com/ads/library/?..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Max Ads to Import</label>
                <select
                  value={scrapeLimit}
                  onChange={(e) => setScrapeLimit(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="5">5 ads</option>
                  <option value="10">10 ads</option>
                  <option value="20">20 ads</option>
                </select>
              </div>

              {scrapeError && (
                <p className="text-xs text-red-400 bg-red-900/20 border border-red-900/30 rounded-lg px-3 py-2">
                  {scrapeError}
                </p>
              )}

              {scrapeResult && (
                <p className={`text-xs rounded-lg px-3 py-2 ${
                  scrapeResult.count > 0
                    ? 'text-green-400 bg-green-900/20 border border-green-900/30'
                    : 'text-amber-400 bg-amber-900/20 border border-amber-900/30'
                }`}>
                  {scrapeResult.count > 0
                    ? `${scrapeResult.count} ad${scrapeResult.count !== 1 ? 's' : ''} imported successfully.`
                    : (scrapeResult.message ?? 'No ads found. Try adding manually.')}
                </p>
              )}

              <button
                onClick={handleScrape}
                disabled={scraping || !scrapeUrl || !scrapeBrand}
                className="w-full py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {scraping ? 'Scraping...' : 'Scrape Ads'}
              </button>
            </div>
          )}

          {/* Manual Tab */}
          {tab === 'manual' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500">
                Paste an image URL from any source — Facebook, Instagram, a brand website, etc.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-zinc-400 mb-1">Brand Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={manualBrand}
                    onChange={(e) => !initialBrand && setManualBrand(e.target.value)}
                    placeholder="e.g. Ryze Coffee"
                    readOnly={!!initialBrand}
                    className={`w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 ${initialBrand ? 'opacity-60 cursor-default' : ''}`}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-zinc-400 mb-1">Image URL <span className="text-red-500">*</span></label>
                  <input
                    type="url"
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-zinc-400 mb-1">Headline</label>
                  <input
                    type="text"
                    value={manualHeadline}
                    onChange={(e) => setManualHeadline(e.target.value)}
                    placeholder="Ad headline"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-zinc-400 mb-1">Body Text</label>
                  <textarea
                    value={manualBodyText}
                    onChange={(e) => setManualBodyText(e.target.value)}
                    placeholder="Primary ad copy..."
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">CTA</label>
                  <input
                    type="text"
                    value={manualCta}
                    onChange={(e) => setManualCta(e.target.value)}
                    placeholder="e.g. Shop Now"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              {saveError && (
                <p className="text-xs text-red-400 bg-red-900/20 border border-red-900/30 rounded-lg px-3 py-2">
                  {saveError}
                </p>
              )}

              {saveSuccess && (
                <p className="text-xs text-green-400 bg-green-900/20 border border-green-900/30 rounded-lg px-3 py-2">
                  Ad saved to library.
                </p>
              )}

              <button
                onClick={handleSave}
                disabled={saving || !manualBrand || !manualImageUrl}
                className="w-full py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Ad'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
