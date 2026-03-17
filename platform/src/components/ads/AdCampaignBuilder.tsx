'use client'

import { useState, useRef } from 'react'
import { AngleSuggestions } from './AngleSuggestions'
import { ReferenceImagePicker } from './ReferenceImagePicker'
import { AdFormatPicker } from './AdFormatPicker'
import type { AdCreative } from './AdCard'

interface AdCampaignBuilderProps {
  clientSlug: string
  primaryService: string | null
  hasIcp: boolean
  onAdsGenerated: (ads: AdCreative[]) => void
  onGeneratingChange: (count: number) => void
}

type Stage = 'idle' | 'generating' | 'complete' | 'error'

const OBJECTIVES = [
  { value: 'Lead Generation', label: 'Lead Gen' },
  { value: 'Awareness',       label: 'Awareness' },
  { value: 'Retargeting',     label: 'Retargeting' },
]

const AD_SIZES = [
  { value: 'square',   label: 'Square',   sub: '1:1' },
  { value: 'portrait', label: 'Portrait', sub: '4:5' },
  { value: 'story',    label: 'Story',    sub: '9:16' },
]

const ADS_PER_ANGLE = ['3', '5', '10']

export function AdCampaignBuilder({
  clientSlug,
  primaryService,
  hasIcp,
  onAdsGenerated,
  onGeneratingChange,
}: AdCampaignBuilderProps) {
  // Section 1 — The Job
  const [targetService, setTargetService] = useState(primaryService ?? '')
  const [objective, setObjective] = useState('Lead Generation')

  // Section 2 — The Angle
  const [selectedAngles, setSelectedAngles] = useState<Set<string>>(new Set())
  const [customAngle, setCustomAngle] = useState('')

  // Section 3 — The Format
  const [adFormat, setAdFormat] = useState('Headline Statement')

  // Section 4 — Volume
  const [adSize, setAdSize] = useState<'square' | 'portrait' | 'story'>('square')
  const [adsPerAngle, setAdsPerAngle] = useState('3')

  // Section 5 — Extras
  const [messagingFocus, setMessagingFocus] = useState('')
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null)

  // Generation state
  const [stage, setStage] = useState<Stage>('idle')
  const [currentAngleLabel, setCurrentAngleLabel] = useState('')
  const [angleProgress, setAngleProgress] = useState({ current: 0, total: 0 })
  const [errorMessage, setErrorMessage] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  function toggleAngle(label: string) {
    setSelectedAngles((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const allAngles = [
    ...Array.from(selectedAngles),
    ...(customAngle.trim() ? [customAngle.trim()] : []),
  ]

  const totalAds = allAngles.length * parseInt(adsPerAngle)
  const canGenerate = targetService.trim() && allAngles.length > 0
  const isGenerating = stage === 'generating'

  async function generateForAngle(angle: string, signal: AbortSignal): Promise<AdCreative[]> {
    const res = await fetch('/api/ads/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        client_slug: clientSlug,
        target_service: targetService,
        campaign_objective: objective,
        angle,
        ad_format: adFormat,
        ad_size: adSize,
        ad_count: adsPerAngle,
        messaging_focus: messagingFocus || undefined,
        reference_image_url: referenceImageUrl || undefined,
      }),
    })

    if (!res.body) return []

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let newAds: AdCreative[] = []

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
        try {
          const event = JSON.parse(raw)
          if (event.type === 'complete') newAds = event.creatives ?? []
          if (event.type === 'error') throw new Error(event.message)
        } catch {
          // skip parse errors
        }
      }
    }

    return newAds
  }

  async function handleGenerate() {
    if (!canGenerate) return

    setStage('generating')
    setErrorMessage('')
    setAngleProgress({ current: 0, total: allAngles.length })
    onGeneratingChange(totalAds)

    abortRef.current = new AbortController()

    try {
      for (let i = 0; i < allAngles.length; i++) {
        if (abortRef.current.signal.aborted) break

        const angle = allAngles[i]
        setCurrentAngleLabel(angle)
        setAngleProgress({ current: i + 1, total: allAngles.length })

        const ads = await generateForAngle(angle, abortRef.current.signal)
        if (ads.length > 0) {
          onAdsGenerated(ads)
          onGeneratingChange(Math.max(0, totalAds - (i + 1) * parseInt(adsPerAngle)))
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
          <BriefcaseIcon />
          <h3 className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>Creative Brief</h3>
        </div>
        {stage === 'complete' && (
          <span className="text-[10px] font-medium text-green-500">✓ Done</span>
        )}
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--border-dim)' }}>

        {/* ── 1: THE JOB ─────────────────────────────────────────── */}
        <section className="px-5 py-4 space-y-3">
          <SectionLabel number={1} title="THE JOB" />

          <div>
            <label className="block text-[10px] font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
              Target Service
            </label>
            <input
              type="text"
              value={targetService}
              onChange={(e) => setTargetService(e.target.value)}
              placeholder="e.g. HVAC Installation, Roof Replacement"
              disabled={isGenerating}
              className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none disabled:opacity-50"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                color: 'var(--text-1)',
              }}
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
              Campaign Objective
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {OBJECTIVES.map((obj) => (
                <button
                  key={obj.value}
                  onClick={() => setObjective(obj.value)}
                  disabled={isGenerating}
                  className="py-1.5 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50"
                  style={{
                    background: objective === obj.value ? 'var(--text-1)' : 'var(--bg-subtle)',
                    color: objective === obj.value ? 'var(--bg)' : 'var(--text-3)',
                    border: `1px solid ${objective === obj.value ? 'var(--text-1)' : 'var(--border)'}`,
                  }}
                >
                  {obj.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2: THE ANGLE ───────────────────────────────────────── */}
        <section className="px-5 py-4 space-y-3">
          <SectionLabel number={2} title="THE ANGLE" />

          <AngleSuggestions
            clientSlug={clientSlug}
            hasIcp={hasIcp}
            selectedAngles={selectedAngles}
            onToggle={toggleAngle}
          />

          <div>
            <label className="block text-[10px] font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
              Custom Angle <span style={{ color: 'var(--text-4)' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={customAngle}
              onChange={(e) => setCustomAngle(e.target.value)}
              placeholder="e.g. First-time homeowner replacing old unit"
              disabled={isGenerating}
              className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none disabled:opacity-50"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                color: 'var(--text-1)',
              }}
            />
          </div>
        </section>

        {/* ── 3: THE FORMAT ──────────────────────────────────────── */}
        <section className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <SectionLabel number={3} title="THE FORMAT" />
            <span className="text-[10px] font-medium" style={{ color: 'var(--text-2)' }}>{adFormat}</span>
          </div>
          <AdFormatPicker value={adFormat} onChange={setAdFormat} disabled={isGenerating} />
        </section>

        {/* ── 4: VOLUME ──────────────────────────────────────────── */}
        <section className="px-5 py-4 space-y-3">
          <SectionLabel number={4} title="VOLUME" />

          <div>
            <label className="block text-[10px] font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
              Ad Size
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {AD_SIZES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setAdSize(s.value as typeof adSize)}
                  disabled={isGenerating}
                  className="py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
                  style={{
                    background: adSize === s.value ? 'var(--text-1)' : 'var(--bg-subtle)',
                    color: adSize === s.value ? 'var(--bg)' : 'var(--text-3)',
                    border: `1px solid ${adSize === s.value ? 'var(--text-1)' : 'var(--border)'}`,
                  }}
                >
                  <div className="font-semibold">{s.label}</div>
                  <div className="text-[9px] mt-0.5 opacity-70">{s.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
              Ads per Angle
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {ADS_PER_ANGLE.map((n) => (
                <button
                  key={n}
                  onClick={() => setAdsPerAngle(n)}
                  disabled={isGenerating}
                  className="py-1.5 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50"
                  style={{
                    background: adsPerAngle === n ? 'var(--text-1)' : 'var(--bg-subtle)',
                    color: adsPerAngle === n ? 'var(--bg)' : 'var(--text-3)',
                    border: `1px solid ${adsPerAngle === n ? 'var(--text-1)' : 'var(--border)'}`,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            {allAngles.length > 0 && (
              <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-4)' }}>
                {allAngles.length} angle{allAngles.length !== 1 ? 's' : ''} × {adsPerAngle} ={' '}
                <span style={{ color: 'var(--text-2)' }}>{totalAds} total ads</span>
              </p>
            )}
          </div>
        </section>

        {/* ── 5: EXTRAS ──────────────────────────────────────────── */}
        <section className="px-5 py-4 space-y-3">
          <SectionLabel number={5} title="EXTRAS" subtitle="optional" />

          <div>
            <label className="block text-[10px] font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
              Messaging Notes
            </label>
            <textarea
              value={messagingFocus}
              onChange={(e) => setMessagingFocus(e.target.value)}
              placeholder="e.g. Emphasize 24/7 availability and same-day service"
              disabled={isGenerating}
              rows={2}
              className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none resize-none disabled:opacity-50"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                color: 'var(--text-1)',
              }}
            />
          </div>

          <ReferenceImagePicker
            clientSlug={clientSlug}
            value={referenceImageUrl}
            onChange={setReferenceImageUrl}
          />
        </section>

      </div>

      {/* ── Footer: status + CTA ───────────────────────────────── */}
      <div
        className="px-5 py-4 space-y-3"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)' }}
      >
        {isGenerating && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
              <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                Generating:{' '}
                <span className="font-medium" style={{ color: 'var(--text-1)' }}>{currentAngleLabel}</span>
              </span>
            </div>
            {allAngles.length > 1 && (
              <div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(angleProgress.current / angleProgress.total) * 100}%`,
                      background: 'var(--text-2)',
                    }}
                  />
                </div>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-4)' }}>
                  Angle {angleProgress.current} of {angleProgress.total}
                </p>
              </div>
            )}
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
            Cancel Generation
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
            }}
          >
            {canGenerate
              ? `Generate ${totalAds} Ad${totalAds !== 1 ? 's' : ''}`
              : 'Select at least one angle'}
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function SectionLabel({
  number,
  title,
  subtitle,
}: {
  number: number
  title: string
  subtitle?: string
}) {
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
      {subtitle && (
        <span className="text-[10px]" style={{ color: 'var(--text-4)' }}>{subtitle}</span>
      )}
    </div>
  )
}

function BriefcaseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--text-3)' }}>
      <rect x="1" y="5" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 5V3.5A1.5 1.5 0 0 1 6.5 2h3A1.5 1.5 0 0 1 11 3.5V5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1 9.5h14" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}
