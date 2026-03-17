'use client'

import { useState, useRef, useCallback } from 'react'

interface LibraryAd {
  id: string
  image_url: string | null
  hook: string
  angle: string
  target_service: string
}

interface BrandAd {
  id: string
  brand_name: string
  image_url: string | null
}

interface ReferenceImagePickerProps {
  clientSlug: string
  value: string | null
  onChange: (url: string | null) => void
}

type Tab = 'upload' | 'library' | 'brands'

export function ReferenceImagePicker({ clientSlug, value, onChange }: ReferenceImagePickerProps) {
  const [tab, setTab] = useState<Tab>('upload')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [libraryAds, setLibraryAds] = useState<LibraryAd[]>([])
  const [libraryLoaded, setLibraryLoaded] = useState(false)
  const [brandAds, setBrandAds] = useState<BrandAd[]>([])
  const [brandsLoaded, setBrandsLoaded] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files allowed')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large (max 10MB)')
      return
    }

    setUploading(true)
    setUploadError(null)

    const fd = new FormData()
    fd.append('file', file)
    fd.append('client_slug', clientSlug)

    try {
      const res = await fetch('/api/upload/reference-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        onChange(data.url)
      } else {
        setUploadError(data.error ?? 'Upload failed')
      }
    } catch {
      setUploadError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) uploadFile(file)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clientSlug]
  )

  async function loadLibrary() {
    if (libraryLoaded) return
    try {
      const res = await fetch('/api/ads/library?limit=30')
      const data = await res.json()
      setLibraryAds(data.ads ?? [])
      setLibraryLoaded(true)
    } catch {
      // silent fail
    }
  }

  async function loadBrands() {
    if (brandsLoaded) return
    try {
      const res = await fetch('/api/brand-ads?limit=30')
      const data = await res.json()
      setBrandAds(data.ads ?? [])
      setBrandsLoaded(true)
    } catch {
      // silent fail
    }
  }

  function switchTab(t: Tab) {
    setTab(t)
    if (t === 'library') loadLibrary()
    if (t === 'brands') loadBrands()
  }

  const TAB_LABELS: Record<Tab, string> = {
    upload: 'Upload',
    library: 'My Ads',
    brands: 'Brands',
  }

  return (
    <div>
      <label className="block text-xs text-zinc-500 mb-1.5">Reference Image <span className="text-zinc-700">(optional)</span></label>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-3">
        {(['upload', 'library', 'brands'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`px-3 py-1 rounded text-xs transition-colors border ${
              tab === t
                ? 'border-zinc-600 bg-zinc-800 text-zinc-200'
                : 'border-zinc-800 text-zinc-500 hover:text-zinc-400'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {tab === 'upload' && (
        <div>
          {value ? (
            <div className="relative">
              <img src={value} alt="Reference" className="w-full h-32 object-cover rounded-md border border-zinc-700" />
              <button
                onClick={() => onChange(null)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded bg-black/70 text-zinc-300 hover:text-white flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-zinc-500 bg-zinc-800/50' : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {uploading ? (
                <p className="text-xs text-zinc-500">Uploading...</p>
              ) : (
                <>
                  <p className="text-xs text-zinc-500">Drag & drop or click to upload</p>
                  <p className="text-[10px] text-zinc-700 mt-1">JPEG, PNG, WebP · max 10MB</p>
                </>
              )}
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f) }}
          />
          {uploadError && <p className="text-xs text-red-400 mt-1">{uploadError}</p>}
        </div>
      )}

      {/* My Ads library tab */}
      {tab === 'library' && (
        <div>
          {!libraryLoaded ? (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square bg-zinc-900 rounded animate-pulse" />
              ))}
            </div>
          ) : libraryAds.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-4">No saved ads in library yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {libraryAds.filter((a) => a.image_url).map((ad) => (
                <button
                  key={ad.id}
                  onClick={() => onChange(ad.image_url!)}
                  className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                    value === ad.image_url ? 'border-white' : 'border-transparent hover:border-zinc-600'
                  }`}
                >
                  <img src={ad.image_url!} alt={ad.hook} className="w-full h-full object-cover" />
                  {value === ad.image_url && (
                    <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
          {value && tab === 'library' && (
            <button onClick={() => onChange(null)} className="text-xs text-zinc-600 hover:text-zinc-400 mt-2">
              Clear selection
            </button>
          )}
        </div>
      )}

      {/* Brands tab */}
      {tab === 'brands' && (
        <div>
          {!brandsLoaded ? (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square bg-zinc-900 rounded animate-pulse" />
              ))}
            </div>
          ) : brandAds.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-4">No brand ads saved yet. Add brands in Ad Library.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {brandAds.filter((a) => a.image_url).map((ad) => (
                <button
                  key={ad.id}
                  onClick={() => onChange(ad.image_url!)}
                  className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                    value === ad.image_url ? 'border-white' : 'border-transparent hover:border-zinc-600'
                  }`}
                  title={ad.brand_name}
                >
                  <img src={ad.image_url!} alt={ad.brand_name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                    <p className="text-[9px] text-zinc-300 truncate">{ad.brand_name}</p>
                  </div>
                  {value === ad.image_url && (
                    <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
          {value && tab === 'brands' && (
            <button onClick={() => onChange(null)} className="text-xs text-zinc-600 hover:text-zinc-400 mt-2">
              Clear selection
            </button>
          )}
        </div>
      )}
    </div>
  )
}
