'use client'

import { useState } from 'react'
import { AdGallery } from './AdGallery'
import { BrandAdCard, type BrandAd } from './BrandAdCard'
import { AddBrandModal } from './AddBrandModal'
import { BrandAvatar } from './BrandAvatar'
import type { AdCreative } from './AdCard'

interface AdLibraryClientProps {
  myAds: AdCreative[]
  initialBrandAds: BrandAd[]
  brands: string[]
}

type Tab = 'mine' | 'brands'

// Get the logo URL for a brand from its ads (first non-null)
function getBrandLogo(ads: BrandAd[], brandName: string): string | null {
  return ads.find((a) => a.brand_name === brandName && a.brand_logo_url)?.brand_logo_url ?? null
}

export function AdLibraryClient({ myAds: initialMyAds, initialBrandAds, brands: initialBrands }: AdLibraryClientProps) {
  const [tab, setTab] = useState<Tab>('mine')
  const [myAds, setMyAds] = useState<AdCreative[]>(initialMyAds)
  const [brandAds, setBrandAds] = useState<BrandAd[]>(initialBrandAds)
  const [brands, setBrands] = useState<string[]>(initialBrands)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalInitialBrand, setModalInitialBrand] = useState<string | undefined>()
  const [activeBrandFilter, setActiveBrandFilter] = useState<string | null>(null)

  function openAddModal(forBrand?: string) {
    setModalInitialBrand(forBrand)
    setModalOpen(true)
  }

  function handleAdded(newAds: BrandAd[]) {
    setBrandAds((prev) => [...newAds, ...prev])
    const newBrands = newAds.map((a) => a.brand_name)
    setBrands((prev) => [...new Set([...newBrands, ...prev])])
    setTab('brands')
    if (modalInitialBrand) setActiveBrandFilter(modalInitialBrand)
  }

  function handleBrandDeleted(id: string) {
    setBrandAds((prev) => {
      const updated = prev.filter((a) => a.id !== id)
      setBrands([...new Set(updated.map((a) => a.brand_name))].sort())
      return updated
    })
  }

  function handleUnsave(id: string) {
    setMyAds((prev) => prev.filter((a) => a.id !== id))
  }

  const filteredBrandAds = activeBrandFilter
    ? brandAds.filter((a) => a.brand_name === activeBrandFilter)
    : brandAds

  return (
    <>
      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-56 shrink-0 flex flex-col min-h-[calc(100vh-120px)]" style={{ borderRight: '1px solid var(--border)' }}>

          {/* My Saved Ads */}
          <div className="px-4 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => { setTab('mine'); setActiveBrandFilter(null) }}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md transition-colors text-left"
              style={{
                background: tab === 'mine' ? 'var(--bg-hover)' : 'transparent',
                color: tab === 'mine' ? 'var(--text-1)' : 'var(--text-3)',
              }}
            >
              <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                <svg className="w-3.5 h-3.5" fill={tab === 'mine' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium leading-none">My Saved Ads</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-4)' }}>{myAds.length} ad{myAds.length !== 1 ? 's' : ''}</p>
              </div>
            </button>
          </div>

          {/* Brand Library */}
          <div className="px-4 py-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>Brand Library</p>
              <button
                onClick={() => openAddModal()}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors"
                style={{ color: 'var(--text-3)' }}
                title="Add a new brand"
              >
                + New Brand
              </button>
            </div>

            <div className="space-y-0.5">
              {/* All brands */}
              <button
                onClick={() => { setActiveBrandFilter(null); setTab('brands') }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-left"
                style={{
                  background: tab === 'brands' && !activeBrandFilter ? 'var(--bg-hover)' : 'transparent',
                  color: tab === 'brands' && !activeBrandFilter ? 'var(--text-1)' : 'var(--text-3)',
                }}
              >
                <span className="w-5 h-5 rounded flex items-center justify-center shrink-0 text-[8px] font-bold" style={{ background: 'var(--bg-subtle)', color: 'var(--text-3)' }}>All</span>
                <span className="text-xs truncate">All brands</span>
                <span className="ml-auto text-[10px] shrink-0" style={{ color: 'var(--text-4)' }}>{brandAds.length}</span>
              </button>

              {brands.length === 0 ? (
                <p className="text-[10px] px-2 py-2" style={{ color: 'var(--text-4)' }}>No brands yet — click + New Brand.</p>
              ) : (
                brands.map((name) => {
                  const count = brandAds.filter((a) => a.brand_name === name).length
                  const isActive = tab === 'brands' && activeBrandFilter === name
                  const logoUrl = getBrandLogo(brandAds, name)
                  return (
                    <button
                      key={name}
                      onClick={() => { setActiveBrandFilter(name); setTab('brands') }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-left"
                      style={{
                        background: isActive ? 'var(--bg-hover)' : 'transparent',
                        color: isActive ? 'var(--text-1)' : 'var(--text-3)',
                      }}
                    >
                      <BrandAvatar name={name} logoUrl={logoUrl} size="xs" />
                      <span className="text-xs truncate flex-1">{name}</span>
                      <span className="text-[10px] shrink-0" style={{ color: 'var(--text-4)' }}>{count}</span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
                {tab === 'mine' ? 'My Saved Ads' : activeBrandFilter ?? 'Brand Inspiration'}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                {tab === 'mine'
                  ? 'Ads you generated and saved from client campaigns'
                  : 'Ad creatives from top brands — use as visual references'}
              </p>
            </div>

            {/* Actions for current view */}
            <div className="flex items-center gap-2">
              {tab === 'brands' && activeBrandFilter && (
                <button
                  onClick={() => openAddModal(activeBrandFilter)}
                  className="text-xs px-3 py-1.5 rounded-md transition-colors"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-1)', border: '1px solid var(--border)' }}
                >
                  + Add More to {activeBrandFilter}
                </button>
              )}
              {tab === 'brands' && (
                <button
                  onClick={() => openAddModal()}
                  className="text-xs px-3 py-1.5 rounded-md transition-colors"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}
                >
                  + New Brand
                </button>
              )}
            </div>
          </div>

          {/* My Ads */}
          {tab === 'mine' && (
            myAds.length > 0 ? (
              <AdGallery creatives={myAds} onUnsave={handleUnsave} />
            ) : (
              <div className="rounded-md p-12 text-center max-w-md mx-auto mt-8" style={{ border: '1px solid var(--border)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>No saved ads yet.</p>
                <p className="text-xs" style={{ color: 'var(--text-4)' }}>
                  Generate ads from any client, then click the bookmark icon to save them here.
                </p>
              </div>
            )
          )}

          {/* Brand Inspiration */}
          {tab === 'brands' && (
            filteredBrandAds.length > 0 ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filteredBrandAds.map((ad) => (
                  <BrandAdCard key={ad.id} ad={ad} onDelete={handleBrandDeleted} />
                ))}
              </div>
            ) : (
              <div className="rounded-md p-12 text-center max-w-md mx-auto mt-8" style={{ border: '1px solid var(--border)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>No brand ads yet.</p>
                <p className="text-xs mb-4" style={{ color: 'var(--text-4)' }}>
                  Import ads from Facebook Ad Library or paste image URLs manually.
                </p>
                <button
                  onClick={() => openAddModal()}
                  className="text-xs px-4 py-2 rounded-md transition-colors"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-1)', border: '1px solid var(--border)' }}
                >
                  + Add Brand Ads
                </button>
              </div>
            )
          )}
        </main>
      </div>

      <AddBrandModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setModalInitialBrand(undefined) }}
        onAdded={handleAdded}
        initialBrand={modalInitialBrand}
      />
    </>
  )
}
