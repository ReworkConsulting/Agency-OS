'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface BrandEditorProps {
  clientSlug: string
  initialLogoUrl?: string | null
  initialPrimaryColor?: string | null
  initialSecondaryColor?: string | null
}

export function BrandEditor({
  clientSlug,
  initialLogoUrl,
  initialPrimaryColor,
  initialSecondaryColor,
}: BrandEditorProps) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl ?? '')
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor ?? '#2563eb')
  const [secondaryColor, setSecondaryColor] = useState(initialSecondaryColor ?? '#eff6ff')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`/api/clients/${clientSlug}/upload-logo`, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Upload failed'); return }
      setLogoUrl(data.url)
    } catch {
      setError('Upload failed — please try again')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError(null)

    try {
      const res = await fetch(`/api/clients/${clientSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logo_url: logoUrl.trim() || null,
          brand_primary_color: primaryColor || null,
          brand_secondary_color: secondaryColor || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to save')
        return
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges =
    logoUrl !== (initialLogoUrl ?? '') ||
    primaryColor !== (initialPrimaryColor ?? '#2563eb') ||
    secondaryColor !== (initialSecondaryColor ?? '#eff6ff')

  return (
    <div className="space-y-6">
      {/* Preview strip */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--border)' }}
      >
        {/* Accent bar preview */}
        <div
          style={{
            height: 4,
            background: secondaryColor
              ? `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`
              : primaryColor,
          }}
        />
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{ background: 'var(--bg-subtle)' }}
        >
          {/* Logo preview */}
          <div
            className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
            style={{
              background: secondaryColor || 'var(--bg-hover)',
              border: '1px solid var(--border)',
            }}
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Logo preview"
                width={36}
                height={36}
                className="object-contain"
                unoptimized
                onError={() => {}}
              />
            ) : (
              <span className="text-sm font-bold" style={{ color: primaryColor }}>B</span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Brand Preview</p>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>ICP document header will look like this</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span
              className="inline-block w-4 h-4 rounded-full"
              style={{ background: primaryColor, border: '1px solid rgba(0,0,0,0.1)' }}
            />
            <span
              className="inline-block w-4 h-4 rounded-full"
              style={{ background: secondaryColor, border: '1px solid rgba(0,0,0,0.1)' }}
            />
          </div>
        </div>
      </div>

      {/* Fields */}
      <div
        className="rounded-xl p-6 space-y-5"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
      >
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--text-3)' }}>
            Brand Assets
          </p>

          {/* Logo Upload */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
              Logo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3 py-2 text-xs font-medium rounded-lg transition-all"
                style={{
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-1)',
                  opacity: uploading ? 0.5 : 1,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                }}
              >
                {uploading ? 'Uploading…' : logoUrl ? 'Replace Logo' : 'Upload Logo'}
              </button>
              {logoUrl && (
                <span className="text-[11px] truncate max-w-[200px]" style={{ color: 'var(--text-4)' }}>
                  {logoUrl.split('/').pop()}
                </span>
              )}
            </div>
            <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-4)' }}>
              PNG, SVG, JPG, or WebP — max 5MB. Or paste a URL below.
            </p>
            <input
              type="url"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 rounded-lg text-sm mt-2"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                color: 'var(--text-1)',
                outline: 'none',
              }}
            />
          </div>

          {/* Color pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Primary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0.5"
                  style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={e => {
                    const val = e.target.value
                    if (/^#[0-9a-fA-F]{0,6}$/.test(val)) setPrimaryColor(val)
                  }}
                  placeholder="#2563eb"
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-mono"
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-1)',
                    outline: 'none',
                  }}
                />
              </div>
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-4)' }}>
                Used for headings, buttons, accent bar.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Secondary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={e => setSecondaryColor(e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0.5"
                  style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={e => {
                    const val = e.target.value
                    if (/^#[0-9a-fA-F]{0,6}$/.test(val)) setSecondaryColor(val)
                  }}
                  placeholder="#eff6ff"
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-mono"
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-1)',
                    outline: 'none',
                  }}
                />
              </div>
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-4)' }}>
                Light tint for logo background and gradient end.
              </p>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid var(--border-dim)' }}>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
            style={{
              background: saved ? 'rgba(34,197,94,0.1)' : 'var(--accent)',
              color: saved ? '#16a34a' : 'var(--accent-fg)',
              opacity: saving || !hasChanges ? 0.5 : 1,
              cursor: saving || !hasChanges ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Brand Settings'}
          </button>

          {error && (
            <p className="text-xs" style={{ color: '#dc2626' }}>⚠ {error}</p>
          )}

          {saved && !error && (
            <p className="text-xs" style={{ color: '#16a34a' }}>
              Brand colors saved — they will appear on all future ICP documents.
            </p>
          )}
        </div>
      </div>

      {/* Info card */}
      <div
        className="rounded-xl p-4"
        style={{ border: '1px solid var(--border-dim)', background: 'var(--bg-subtle)' }}
      >
        <p className="text-[11px] font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Where brand colors are used</p>
        <ul className="space-y-1">
          {[
            'ICP document — accent bar at the top, heading colors, version chip',
            'Exported PDF — full branded layout with logo and color scheme',
            'Logo initial fallback — shown when logo URL is not set',
          ].map(item => (
            <li key={item} className="text-[11px] flex items-start gap-2" style={{ color: 'var(--text-3)' }}>
              <span style={{ color: 'var(--text-4)' }}>·</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
