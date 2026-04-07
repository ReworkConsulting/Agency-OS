'use client'

import { useState, useRef } from 'react'
import type { VideoScript } from './ScriptCard'

interface ScriptBuilderProps {
  clientSlug: string
  primaryService: string | null
  hasIcp: boolean
  onScriptsGenerated: (scripts: VideoScript[]) => void
  onGeneratingChange: (count: number) => void
}

type Stage = 'idle' | 'generating' | 'complete' | 'error'

const AUDIENCE_TYPES = [
  { value: 'B2C', label: 'B2C', sub: 'Client → Customers' },
  { value: 'B2B', label: 'B2B', sub: 'Agency → Businesses' },
]

const STYLES = [
  { value: 'UGC', label: 'UGC', sub: 'Owner/actor on camera' },
  { value: 'Voice Over', label: 'Voice Over', sub: 'Narration over footage' },
]

const OUTPUT_TYPES = [
  { value: 'videos',    label: 'Videos',   sub: 'Hook + Body + CTA' },
  { value: 'ad_copy',  label: 'Ad Copy',   sub: 'Facebook long-form' },
  { value: 'headlines', label: 'Headlines', sub: '8–12 CTR variations' },
]

const GOALS = [
  { value: 'Lead Generation', label: 'Lead Gen' },
  { value: 'Awareness',       label: 'Awareness' },
  { value: 'Retargeting',     label: 'Retargeting' },
  { value: 'Trust Building',  label: 'Trust' },
]

const LENGTHS = [
  { value: '15s', label: '15s', sub: '~40 words' },
  { value: '30s', label: '30s', sub: '~80 words' },
  { value: '60s', label: '60s', sub: '~150 words' },
  { value: '90s', label: '90s', sub: '~215 words' },
]

const COUNTS = ['1', '3', '5']

export function ScriptBuilder({
  clientSlug,
  primaryService,
  hasIcp,
  onScriptsGenerated,
  onGeneratingChange,
}: ScriptBuilderProps) {
  // Section 1 — The Job
  const [currentOffer, setCurrentOffer] = useState(primaryService ?? '')
  const [audienceType, setAudienceType] = useState<'B2C' | 'B2B'>('B2C')

  // Section 2 — The Style
  const [scriptStyle, setScriptStyle] = useState<'UGC' | 'Voice Over'>('UGC')

  // Section 3 — The Output
  const [outputType, setOutputType] = useState<'videos' | 'ad_copy' | 'headlines'>('videos')

  // Section 4 — The Brief
  const [scriptGoal, setScriptGoal] = useState('Lead Generation')
  const [scriptLength, setScriptLength] = useState('30s')

  // Section 5 — Volume
  const [scriptCount, setScriptCount] = useState('3')

  // Section 6 — Extras
  const [specificOffer, setSpecificOffer] = useState('')
  const [hookAngle, setHookAngle] = useState('')
  const [notes, setNotes] = useState('')
  const [includeBroll, setIncludeBroll] = useState(false)

  // Generation state
  const [stage, setStage] = useState<Stage>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const canGenerate = currentOffer.trim() && hasIcp
  const isGenerating = stage === 'generating'

  async function handleGenerate() {
    if (!canGenerate) return

    setStage('generating')
    setErrorMessage('')
    onGeneratingChange(parseInt(scriptCount))

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/scripts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          client_slug: clientSlug,
          target_service: currentOffer,
          audience_type: audienceType,
          script_goal: scriptGoal,
          script_length: scriptLength,
          script_style: scriptStyle,
          output_type: outputType,
          script_count: scriptCount,
          specific_offer: specificOffer || undefined,
          hook_angle: hookAngle || undefined,
          notes: notes || undefined,
          include_broll_notes: includeBroll,
        }),
      })

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue
          let event: Record<string, unknown>
          try {
            event = JSON.parse(raw)
          } catch {
            continue
          }
          if (event.type === 'complete') {
            onScriptsGenerated((event.scripts ?? []) as VideoScript[])
          }
          if (event.type === 'error') {
            throw new Error(event.message as string)
          }
        }
      }

      setStage('complete')
      onGeneratingChange(0)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setStage('error')
        setErrorMessage(err instanceof Error ? err.message : 'Generation failed')
        onGeneratingChange(0)
      } else {
        setStage('idle')
        onGeneratingChange(0)
      }
    }
  }

  function handleCancel() {
    abortRef.current?.abort()
  }

  const generateLabel = outputType === 'headlines'
    ? `Generate ${scriptCount} Headline Set${parseInt(scriptCount) !== 1 ? 's' : ''}`
    : outputType === 'ad_copy'
    ? `Generate ${scriptCount} Ad Copy${parseInt(scriptCount) !== 1 ? ' Variations' : ''}`
    : `Generate ${scriptCount} Script${parseInt(scriptCount) !== 1 ? 's' : ''}`

  const generatingLabel = outputType === 'headlines'
    ? `Writing ${scriptCount} headline set${parseInt(scriptCount) !== 1 ? 's' : ''}…`
    : outputType === 'ad_copy'
    ? `Writing ${scriptCount} ad copy variation${parseInt(scriptCount) !== 1 ? 's' : ''}…`
    : `Writing ${scriptCount} ${scriptLength} script${parseInt(scriptCount) !== 1 ? 's' : ''}…`

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-3.5 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <ScriptIcon />
          <h3 className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>Script Brief</h3>
        </div>
        {!hasIcp && (
          <span className="text-[10px]" style={{ color: '#f59e0b' }}>ICP required first</span>
        )}
        {stage === 'complete' && (
          <span className="text-[10px] font-medium text-green-500">✓ Done</span>
        )}
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--border-dim)' }}>

        {/* ── 1: THE JOB ───────────────────────────────────────── */}
        <section className="px-5 py-4 space-y-3">
          <SectionLabel number={1} title="THE JOB" />

          <div>
            <label className="block text-[10px] font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
              Current Offer
            </label>
            <input
              type="text"
              value={currentOffer}
              onChange={(e) => setCurrentOffer(e.target.value)}
              placeholder="e.g. Heat Pump Install + Mass Save Rebate"
              disabled={isGenerating}
              className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none disabled:opacity-50"
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
              Audience
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {AUDIENCE_TYPES.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAudienceType(a.value as 'B2C' | 'B2B')}
                  disabled={isGenerating}
                  className="py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
                  style={{
                    background: audienceType === a.value ? 'var(--text-1)' : 'var(--bg-subtle)',
                    color: audienceType === a.value ? 'var(--bg)' : 'var(--text-3)',
                    border: `1px solid ${audienceType === a.value ? 'var(--text-1)' : 'var(--border)'}`,
                  }}
                >
                  <div className="font-semibold">{a.label}</div>
                  <div className="text-[9px] mt-0.5 opacity-70">{a.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2: THE STYLE ─────────────────────────────────────── */}
        <section className="px-5 py-4 space-y-3">
          <SectionLabel number={2} title="THE STYLE" />
          <div className="grid grid-cols-2 gap-1.5">
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setScriptStyle(s.value as 'UGC' | 'Voice Over')}
                disabled={isGenerating}
                className="py-2.5 rounded-lg text-xs transition-colors disabled:opacity-50"
                style={{
                  background: scriptStyle === s.value ? 'var(--text-1)' : 'var(--bg-subtle)',
                  color: scriptStyle === s.value ? 'var(--bg)' : 'var(--text-3)',
                  border: `1px solid ${scriptStyle === s.value ? 'var(--text-1)' : 'var(--border)'}`,
                }}
              >
                <div className="font-semibold">{s.label}</div>
                <div className="text-[9px] mt-0.5 opacity-70">{s.sub}</div>
              </button>
            ))}
          </div>
        </section>

        {/* ── 3: THE OUTPUT ─────────────────────────────────────── */}
        <section className="px-5 py-4 space-y-3">
          <SectionLabel number={3} title="THE OUTPUT" />
          <div className="grid grid-cols-3 gap-1.5">
            {OUTPUT_TYPES.map((o) => (
              <button
                key={o.value}
                onClick={() => setOutputType(o.value as 'videos' | 'ad_copy' | 'headlines')}
                disabled={isGenerating}
                className="py-2.5 rounded-lg text-xs transition-colors disabled:opacity-50"
                style={{
                  background: outputType === o.value ? 'var(--text-1)' : 'var(--bg-subtle)',
                  color: outputType === o.value ? 'var(--bg)' : 'var(--text-3)',
                  border: `1px solid ${outputType === o.value ? 'var(--text-1)' : 'var(--border)'}`,
                }}
              >
                <div className="font-semibold">{o.label}</div>
                <div className="text-[9px] mt-0.5 opacity-70">{o.sub}</div>
              </button>
            ))}
          </div>
        </section>

        {/* ── 4: THE BRIEF ─────────────────────────────────────── */}
        <section className="px-5 py-4 space-y-3">
          <SectionLabel number={4} title="THE BRIEF" />

          <div>
            <label className="block text-[10px] font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
              Goal
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setScriptGoal(g.value)}
                  disabled={isGenerating}
                  className="py-1.5 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50"
                  style={{
                    background: scriptGoal === g.value ? 'var(--text-1)' : 'var(--bg-subtle)',
                    color: scriptGoal === g.value ? 'var(--bg)' : 'var(--text-3)',
                    border: `1px solid ${scriptGoal === g.value ? 'var(--text-1)' : 'var(--border)'}`,
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {outputType === 'videos' && (
            <div>
              <label className="block text-[10px] font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
                Length
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {LENGTHS.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setScriptLength(l.value)}
                    disabled={isGenerating}
                    className="py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
                    style={{
                      background: scriptLength === l.value ? 'var(--text-1)' : 'var(--bg-subtle)',
                      color: scriptLength === l.value ? 'var(--bg)' : 'var(--text-3)',
                      border: `1px solid ${scriptLength === l.value ? 'var(--text-1)' : 'var(--border)'}`,
                    }}
                  >
                    <div className="font-semibold">{l.label}</div>
                    <div className="text-[9px] mt-0.5 opacity-70">{l.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── 5: VOLUME ─────────────────────────────────────────── */}
        <section className="px-5 py-4 space-y-3">
          <SectionLabel number={5} title="VOLUME" />
          <div className="grid grid-cols-3 gap-1.5">
            {COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => setScriptCount(n)}
                disabled={isGenerating}
                className="py-1.5 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50"
                style={{
                  background: scriptCount === n ? 'var(--text-1)' : 'var(--bg-subtle)',
                  color: scriptCount === n ? 'var(--bg)' : 'var(--text-3)',
                  border: `1px solid ${scriptCount === n ? 'var(--text-1)' : 'var(--border)'}`,
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        {/* ── 6: EXTRAS ─────────────────────────────────────────── */}
        <section className="px-5 py-4 space-y-3">
          <SectionLabel number={6} title="EXTRAS" subtitle="optional" />

          <div>
            <label className="block text-[10px] font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
              Specific Offer
            </label>
            <input
              type="text"
              value={specificOffer}
              onChange={(e) => setSpecificOffer(e.target.value)}
              placeholder="e.g. Mass Save $8,500 rebate + 0% financing"
              disabled={isGenerating}
              className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none disabled:opacity-50"
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
              Hook Angle
            </label>
            <input
              type="text"
              value={hookAngle}
              onChange={(e) => setHookAngle(e.target.value)}
              placeholder="e.g. Homeowner delaying the replacement"
              disabled={isGenerating}
              className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none disabled:opacity-50"
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Summer push — address the 'too expensive' objection"
              disabled={isGenerating}
              rows={2}
              className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none resize-none disabled:opacity-50"
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
            />
          </div>

          {outputType === 'videos' && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium" style={{ color: 'var(--text-3)' }}>Include B-Roll Notes</p>
                <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-4)' }}>Adds camera direction cues to each section</p>
              </div>
              <button
                onClick={() => setIncludeBroll(!includeBroll)}
                disabled={isGenerating}
                className="relative w-9 h-5 rounded-full transition-colors disabled:opacity-50"
                style={{ background: includeBroll ? 'var(--text-1)' : 'var(--bg-hover)', border: '1px solid var(--border)' }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
                  style={{
                    left: includeBroll ? '18px' : '2px',
                    background: includeBroll ? 'var(--bg)' : 'var(--text-4)',
                    transition: 'left 0.15s ease',
                  }}
                />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ── Footer: status + CTA ───────────────────────────────── */}
      <div
        className="px-5 py-4 space-y-3"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)' }}
      >
        {isGenerating && (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
            <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
              {generatingLabel}
            </span>
          </div>
        )}

        {stage === 'error' && (
          <p className="text-[11px] text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
            {errorMessage}
          </p>
        )}

        {isGenerating ? (
          <button
            onClick={handleCancel}
            className="w-full py-2.5 rounded-lg text-xs font-medium transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--text-2)', background: 'var(--bg-card)' }}
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            {!hasIcp
              ? 'Build ICP First'
              : !currentOffer.trim()
              ? 'Enter Your Offer'
              : generateLabel}
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function SectionLabel({ number, title, subtitle }: { number: number; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center shrink-0"
        style={{ background: 'var(--bg-hover)', color: 'var(--text-3)', border: '1px solid var(--border-dim)' }}
      >
        {number}
      </span>
      <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>
        {title}
      </p>
      {subtitle && <span className="text-[10px]" style={{ color: 'var(--text-4)' }}>{subtitle}</span>}
    </div>
  )
}

function ScriptIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--text-3)' }}>
      <rect x="1" y="2" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M11 5l4-2v10l-4-2V5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M4 6h5M4 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
