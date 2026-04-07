'use client'

import { useState, useEffect, useCallback } from 'react'

type Audience = 'B2C' | 'B2B'

interface LibraryScript {
  id: string
  title: string
  style: string
  format: string
  length: string
  industry: string
  performance: string
  added: string
  hook: string
  body: string
  cta: string
  audience: Audience
}

const STYLES = ['UGC', 'Voice Over']
const FORMATS = ['Videos', 'Ad Copy', 'Headlines']
const LENGTHS = ['15s', '30s', '60s', '90s', 'N/A']

export function ScriptLibraryClient() {
  const [audience, setAudience] = useState<Audience>('B2C')
  const [scripts, setScripts] = useState<LibraryScript[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const loadScripts = useCallback(async (aud: Audience) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/scripts/library?audience=${aud}`)
      const data = await res.json()
      setScripts(data.scripts ?? [])
    } catch {
      setScripts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadScripts(audience)
  }, [audience, loadScripts])

  async function handleDelete(id: string) {
    if (deleting) return
    setDeleting(id)
    try {
      await fetch(`/api/scripts/library/${id}?audience=${audience}`, { method: 'DELETE' })
      setScripts((prev) => prev.filter((s) => s.id !== id))
    } catch {
      // silent fail
    } finally {
      setDeleting(null)
    }
  }

  async function handleCopy(script: LibraryScript) {
    const text = [
      script.hook ? `[HOOK]\n${script.hook}` : '',
      script.body ? `\n[BODY]\n${script.body}` : '',
      script.cta ? `\n[CTA]\n${script.cta}` : '',
    ].filter(Boolean).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(script.id)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // silent
    }
  }

  function handleAdded(newScript: LibraryScript) {
    if (newScript.audience === audience) {
      setScripts((prev) => [...prev, newScript])
    }
    setShowModal(false)
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left sidebar ── */}
      <aside
        className="w-[220px] shrink-0 border-r p-4 space-y-2"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}
      >
        <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--text-3)' }}>
          Audience
        </p>

        {(['B2C', 'B2B'] as Audience[]).map((a) => (
          <button
            key={a}
            onClick={() => setAudience(a)}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: audience === a ? 'var(--text-1)' : 'transparent',
              color: audience === a ? 'var(--bg)' : 'var(--text-2)',
            }}
          >
            {a}
            <span className="ml-2 text-[10px] opacity-60">
              {audience === a && !loading ? `${scripts.length}` : ''}
            </span>
          </button>
        ))}

        <div className="pt-4">
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-2 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            + Add Script
          </button>
        </div>

        <div className="pt-6" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-4)' }}>
            Scripts here are loaded by Claude during generation. The more you add, the better future scripts get.
          </p>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 p-8">
        <div className="max-w-[900px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>Script Library</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>
                {audience} — {loading ? '...' : `${scripts.length} script${scripts.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl p-5 animate-pulse"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
                >
                  <div className="h-3 rounded w-1/3 mb-3" style={{ background: 'var(--bg-hover)' }} />
                  <div className="h-4 rounded w-full mb-2" style={{ background: 'var(--bg-hover)' }} />
                  <div className="h-4 rounded w-4/5" style={{ background: 'var(--bg-hover)' }} />
                </div>
              ))}
            </div>
          ) : scripts.length === 0 ? (
            <div
              className="rounded-xl p-12 text-center"
              style={{ border: '1px dashed var(--border)', background: 'var(--bg-card)' }}
            >
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-2)' }}>No {audience} scripts yet</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-4)' }}>
                Add your first winning script and Claude will use it as a reference on future {audience} generation runs.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-lg text-xs font-semibold"
                style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
              >
                Add First Script
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {scripts.map((script) => (
                <ScriptLibraryCard
                  key={script.id}
                  script={script}
                  copied={copied === script.id}
                  deleting={deleting === script.id}
                  onCopy={() => handleCopy(script)}
                  onDelete={() => handleDelete(script.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Add Script Modal ── */}
      {showModal && (
        <AddScriptModal
          defaultAudience={audience}
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  )
}

/* ── Script Library Card ─────────────────────────────────────────────── */

function ScriptLibraryCard({
  script,
  copied,
  deleting,
  onCopy,
  onDelete,
}: {
  script: LibraryScript
  copied: boolean
  deleting: boolean
  onCopy: () => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-dim)', background: 'var(--bg-subtle)' }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{script.title}</span>
          <Badge>{script.style}</Badge>
          <Badge>{script.format}</Badge>
          {script.length && script.length !== 'N/A' && <Badge>{script.length}</Badge>}
          {script.industry && <Badge dim>{script.industry}</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="text-[11px] px-2.5 py-1 rounded-md transition-colors"
            style={{ background: copied ? '#16a34a' : 'var(--bg-hover)', color: copied ? 'white' : 'var(--text-3)', border: '1px solid var(--border)' }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onDelete}
                disabled={deleting}
                className="text-[11px] px-2.5 py-1 rounded-md disabled:opacity-40"
                style={{ background: '#ef4444', color: 'white' }}
              >
                Confirm
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-[11px] px-2 py-1 rounded-md"
                style={{ color: 'var(--text-3)', border: '1px solid var(--border)' }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-[11px] px-2 py-1 rounded-md transition-colors"
              style={{ color: 'var(--text-4)', border: '1px solid var(--border)' }}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-3">
        {script.performance && (
          <p className="text-[11px]" style={{ color: '#f59e0b' }}>⚡ {script.performance}</p>
        )}

        {script.hook && (
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--text-3)' }}>Hook</p>
            <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-1)' }}>{script.hook}</p>
          </div>
        )}

        {script.body && (
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--text-3)' }}>Body</p>
            <p
              className="text-xs leading-relaxed whitespace-pre-wrap"
              style={{
                color: 'var(--text-2)',
                display: expanded ? undefined : '-webkit-box',
                WebkitLineClamp: expanded ? undefined : 3,
                WebkitBoxOrient: 'vertical',
                overflow: expanded ? undefined : 'hidden',
              } as React.CSSProperties}
            >
              {script.body}
            </p>
            {script.body.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[10px] mt-1"
                style={{ color: 'var(--text-4)' }}
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {script.cta && script.cta !== 'N/A' && (
          <div className="pt-2" style={{ borderTop: '1px solid var(--border-dim)' }}>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--text-3)' }}>CTA</p>
            <p className="text-xs font-medium" style={{ color: 'var(--text-1)' }}>{script.cta}</p>
          </div>
        )}
      </div>

      {script.added && (
        <div className="px-5 pb-3">
          <p className="text-[10px]" style={{ color: 'var(--text-4)' }}>Added {script.added}</p>
        </div>
      )}
    </div>
  )
}

/* ── Badge ────────────────────────────────────────────────────────────── */

function Badge({ children, dim }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded"
      style={{
        background: 'var(--bg-hover)',
        color: dim ? 'var(--text-4)' : 'var(--text-3)',
        border: '1px solid var(--border-dim)',
      }}
    >
      {children}
    </span>
  )
}

/* ── Add Script Modal ─────────────────────────────────────────────────── */

function AddScriptModal({
  defaultAudience,
  onClose,
  onAdded,
}: {
  defaultAudience: Audience
  onClose: () => void
  onAdded: (script: LibraryScript) => void
}) {
  const [form, setForm] = useState({
    audience: defaultAudience,
    title: '',
    style: 'UGC',
    format: 'Videos',
    length: '30s',
    industry: '',
    hook: '',
    body: '',
    cta: '',
    performance: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.hook.trim()) {
      setError('Title and Hook are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/scripts/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')
      onAdded(data.script)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[560px] rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {/* Modal header */}
        <div
          className="px-5 py-4 flex items-center justify-between sticky top-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Add Winning Script</h2>
          <button onClick={onClose} className="text-xs" style={{ color: 'var(--text-3)' }}>✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Audience */}
          <div>
            <label className="block text-[10px] font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>Audience</label>
            <div className="grid grid-cols-2 gap-2">
              {(['B2C', 'B2B'] as Audience[]).map((a) => (
                <button
                  key={a}
                  onClick={() => update('audience', a)}
                  className="py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    background: form.audience === a ? 'var(--text-1)' : 'var(--bg-subtle)',
                    color: form.audience === a ? 'var(--bg)' : 'var(--text-3)',
                    border: `1px solid ${form.audience === a ? 'var(--text-1)' : 'var(--border)'}`,
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <FieldInput label="Title *" value={form.title} onChange={(v) => update('title', v)} placeholder="e.g. HVAC Owner Mass Save — Pain Hook" />

          {/* Style + Format + Length */}
          <div className="grid grid-cols-3 gap-3">
            <FieldSelect label="Style" value={form.style} onChange={(v) => update('style', v)} options={STYLES} />
            <FieldSelect label="Format" value={form.format} onChange={(v) => update('format', v)} options={FORMATS} />
            <FieldSelect label="Length" value={form.length} onChange={(v) => update('length', v)} options={LENGTHS} />
          </div>

          {/* Industry */}
          <FieldInput label="Industry" value={form.industry} onChange={(v) => update('industry', v)} placeholder="e.g. HVAC, Roofing, Agency Pitch" />

          {/* Performance */}
          <FieldInput label="Performance Notes" value={form.performance} onChange={(v) => update('performance', v)} placeholder="e.g. 2.8% CTR — Facebook, Q1 2026" />

          {/* Hook */}
          <FieldTextarea label="Hook *" value={form.hook} onChange={(v) => update('hook', v)} placeholder="The opening line(s)..." rows={2} />

          {/* Body */}
          <FieldTextarea label="Body" value={form.body} onChange={(v) => update('body', v)} placeholder="The middle section..." rows={4} />

          {/* CTA */}
          <FieldInput label="CTA" value={form.cta} onChange={(v) => update('cta', v)} placeholder="e.g. Call today. The inspection is free." />

          {error && (
            <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-xs font-medium"
              style={{ border: '1px solid var(--border)', color: 'var(--text-2)', background: 'var(--bg-hover)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg text-xs font-semibold disabled:opacity-40"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              {saving ? 'Saving…' : 'Add to Library'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Form helpers ─────────────────────────────────────────────────────── */

function FieldInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-[10px] font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none"
        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
      />
    </div>
  )
}

function FieldTextarea({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div>
      <label className="block text-[10px] font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none resize-none"
        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
      />
    </div>
  )
}

function FieldSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="block text-[10px] font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg px-2 py-2 text-xs focus:outline-none"
        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}
