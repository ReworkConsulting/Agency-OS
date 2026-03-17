'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CONFIDENCE_OPTIONS = ['High', 'Medium', 'Low', 'Estimated']

export function IcpImport({ clientSlug }: { clientSlug: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [confidence, setConfidence] = useState('High')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleImport() {
    if (!content.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/clients/${clientSlug}/icp/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icp_content: content, confidence_level: confidence }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Import failed'); return }
      router.refresh()
      setOpen(false)
      setContent('')
    } catch {
      setError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
        style={{
          border: '1px solid var(--border)',
          background: 'var(--bg-subtle)',
          color: 'var(--text-2)',
        }}
      >
        <UploadIcon />
        Import Existing ICP
      </button>
    )
  }

  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Import Existing ICP</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>
            Paste your existing ICP document — it will be saved as the current version.
          </p>
        </div>
        <button
          onClick={() => { setOpen(false); setError(null) }}
          className="text-xs px-2 py-1 rounded"
          style={{ color: 'var(--text-4)', background: 'var(--bg-hover)' }}
        >
          Cancel
        </button>
      </div>

      <div>
        <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-3)' }}>
          ICP Content
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste your ICP document here (markdown, plain text, or any format)…"
          rows={14}
          className="w-full px-3 py-2.5 rounded-lg text-xs font-mono leading-relaxed resize-y"
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            color: 'var(--text-1)',
            outline: 'none',
            minHeight: 200,
          }}
        />
      </div>

      <div className="flex items-end gap-4">
        <div>
          <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-3)' }}>
            Confidence Level
          </label>
          <select
            value={confidence}
            onChange={e => setConfidence(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs"
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              color: 'var(--text-1)',
              outline: 'none',
            }}
          >
            {CONFIDENCE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleImport}
          disabled={saving || !content.trim()}
          className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
          style={{
            background: 'var(--accent)',
            color: 'var(--accent-fg)',
            opacity: saving || !content.trim() ? 0.5 : 1,
            cursor: saving || !content.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Save ICP'}
        </button>

        {error && <p className="text-xs" style={{ color: '#dc2626' }}>⚠ {error}</p>}
      </div>
    </div>
  )
}

function UploadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M8 2v9M4 5l4-4 4 4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
