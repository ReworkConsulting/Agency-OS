'use client'

import { useState, useEffect } from 'react'

interface AgencySettings {
  id: string
  agency_name: string
  logo_url: string | null
  favicon_url: string | null
  default_theme: 'dark' | 'light'
}

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState<AgencySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [agencyName, setAgencyName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [defaultTheme, setDefaultTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    fetch('/api/settings/agency')
      .then(r => r.json())
      .then(data => {
        setSettings(data.settings)
        setAgencyName(data.settings?.agency_name ?? '')
        setLogoUrl(data.settings?.logo_url ?? '')
        setFaviconUrl(data.settings?.favicon_url ?? '')
        setDefaultTheme(data.settings?.default_theme ?? 'dark')
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch('/api/settings/agency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agency_name: agencyName, logo_url: logoUrl || null, favicon_url: faviconUrl || null, default_theme: defaultTheme }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageSkeleton />

  return (
    <div className="p-8 max-w-2xl animate-fade-in">
      <PageHeader
        title="General"
        description="Agency branding and platform defaults."
      />

      {error && <ErrorBanner message={error} />}

      <div className="space-y-8">
        <Section title="Agency Branding">
          <div className="space-y-4">
            <Field label="Agency Name">
              <input
                type="text"
                value={agencyName}
                onChange={e => setAgencyName(e.target.value)}
                placeholder="Rework Consulting"
                className={inputCls}
                style={inputStyle}
              />
            </Field>
            <Field label="Logo URL" hint="Direct URL to your agency logo image">
              <input
                type="url"
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className={inputCls}
                style={inputStyle}
              />
            </Field>
            <Field label="Favicon URL" hint="Browser tab icon (32×32 px recommended)">
              <input
                type="url"
                value={faviconUrl}
                onChange={e => setFaviconUrl(e.target.value)}
                placeholder="https://..."
                className={inputCls}
                style={inputStyle}
              />
            </Field>
          </div>
        </Section>

        <Section title="Platform Defaults">
          <Field label="Default Theme" hint="Applied to new users on first login">
            <div className="flex gap-2 mt-1">
              {(['dark', 'light'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setDefaultTheme(t)}
                  className="px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize"
                  style={{
                    background: defaultTheme === t ? 'var(--text-1)' : 'var(--bg-subtle)',
                    color: defaultTheme === t ? 'var(--bg)' : 'var(--text-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
        </Section>
      </div>

      <div className="flex items-center gap-3 mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {saved && (
          <span className="text-xs font-medium" style={{ color: '#22c55e' }}>
            ✓ Saved
          </span>
        )}
      </div>
    </div>
  )
}

const inputCls = "mt-1.5 w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors"
const inputStyle = { background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-1)' }

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium" style={{ color: 'var(--text-2)' }}>{label}</label>
      {hint && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-4)' }}>{hint}</p>}
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--text-3)' }}>{title}</h2>
      <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {children}
      </div>
    </section>
  )
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>{title}</h1>
      <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>{description}</p>
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-6 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#dc2626' }}>
      {message}
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="p-8 max-w-2xl space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: 'var(--bg-subtle)' }} />
      ))}
    </div>
  )
}
