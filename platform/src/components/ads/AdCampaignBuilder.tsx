'use client'

import { useState, useRef } from 'react'
import { AngleSuggestions } from './AngleSuggestions'
import { ReferenceImagePicker } from './ReferenceImagePicker'
import type { AdCreative } from './AdCard'

interface AdCampaignBuilderProps {
  clientSlug: string
  primaryService: string | null
  hasIcp: boolean
  onAdsGenerated: (ads: AdCreative[]) => void
  onGeneratingChange: (count: number) => void
}

type Stage = 'idle' | 'generating' | 'complete' | 'error'

const VISUAL_STYLES = ['Clean & Professional', 'Lifestyle', 'Before & After', 'Text-Heavy', 'Social Proof']
const OBJECTIVES = ['Lead Generation', 'Awareness', 'Retargeting']
const AD_SIZES = [
  { value: 'square', label: 'Square', sub: '1:1' },
  { value: 'portrait', label: 'Portrait', sub: '4:5' },
  { value: 'story', label: 'Story', sub: '9:16' },
]
const ADS_PER_ANGLE = ['3', '5', '10']

export function AdCampaignBuilder({
  clientSlug,
  primaryService,
  hasIcp,
  onAdsGenerated,
  onGeneratingChange,
}: AdCampaignBuilderProps) {
  // Core inputs
  const [targetService, setTargetService] = useState(primaryService ?? '')
  const [selectedAngles, setSelectedAngles] = useState<Set<string>>(new Set())
  const [customAngle, setCustomAngle] = useState('')
  const [adsPerAngle, setAdsPerAngle] = useState('3')

  // Advanced settings
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [objective, setObjective] = useState('Lead Generation')
  const [visualStyle, setVisualStyle] = useState('Clean & Professional')
  const [adSize, setAdSize] = useState<'square' | 'portrait' | 'story'>('square')
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

  // All angles to run: AI-selected + custom (if filled)
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
        visual_style: visualStyle,
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
          // skip
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
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="text-xs font-medium text-zinc-300">Campaign Builder</h3>
        {stage === 'complete' && (
          <span className="text-[10px] text-green-400">Done</span>
        )}
      </div>

      <div className="p-4 space-y-5">

        {/* Target service */}
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5">Target Service</label>
          <input
            type="text"
            value={targetService}
            onChange={(e) => setTargetService(e.target.value)}
            placeholder="e.g. HVAC Installation"
            disabled={isGenerating}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 disabled:opacity-50"
          />
        </div>

        {/* AI Angle Suggestions */}
        <AngleSuggestions
          clientSlug={clientSlug}
          hasIcp={hasIcp}
          selectedAngles={selectedAngles}
          onToggle={toggleAngle}
        />

        {/* Custom angle */}
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5">Add Custom Angle <span className="text-zinc-700">(optional)</span></label>
          <input
            type="text"
            value={customAngle}
            onChange={(e) => setCustomAngle(e.target.value)}
            placeholder="e.g. First-time homeowner buying a new A/C"
            disabled={isGenerating}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 disabled:opacity-50"
          />
        </div>

        {/* Ads per angle */}
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5">Ads per Angle</label>
          <div className="grid grid-cols-3 gap-2">
            {ADS_PER_ANGLE.map((n) => (
              <button
                key={n}
                onClick={() => setAdsPerAngle(n)}
                disabled={isGenerating}
                className={`py-1.5 rounded border text-xs transition-colors ${
                  adsPerAngle === n
                    ? 'border-zinc-500 bg-zinc-800 text-zinc-200'
                    : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'
                } disabled:opacity-50`}
              >
                {n}
              </button>
            ))}
          </div>
          {allAngles.length > 0 && (
            <p className="text-[11px] text-zinc-600 mt-1.5">
              {allAngles.length} angle{allAngles.length !== 1 ? 's' : ''} × {adsPerAngle} = <span className="text-zinc-400">{totalAds} total ads</span>
            </p>
          )}
        </div>

        {/* Advanced settings toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-xs text-zinc-500 hover:text-zinc-400 transition-colors py-1"
        >
          <span>Advanced Settings</span>
          <span className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
            <ChevronIcon />
          </span>
        </button>

        {/* Advanced settings */}
        {showAdvanced && (
          <div className="space-y-4 pt-1 border-t border-zinc-800/60">

            {/* Objective */}
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Campaign Objective</label>
              <div className="grid grid-cols-3 gap-2">
                {OBJECTIVES.map((obj) => (
                  <button
                    key={obj}
                    onClick={() => setObjective(obj)}
                    disabled={isGenerating}
                    className={`px-2 py-1.5 rounded text-xs transition-colors border ${
                      objective === obj
                        ? 'border-zinc-500 bg-zinc-800 text-zinc-200'
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'
                    } disabled:opacity-50`}
                  >
                    {obj}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual style */}
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Visual Style</label>
              <div className="grid grid-cols-2 gap-1.5">
                {VISUAL_STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => setVisualStyle(style)}
                    disabled={isGenerating}
                    className={`px-2 py-1.5 rounded text-xs transition-colors border ${
                      visualStyle === style
                        ? 'border-zinc-500 bg-zinc-800 text-zinc-200'
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'
                    } disabled:opacity-50`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Ad size */}
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Ad Size</label>
              <div className="grid grid-cols-3 gap-2">
                {AD_SIZES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setAdSize(s.value as 'square' | 'portrait' | 'story')}
                    disabled={isGenerating}
                    className={`px-2 py-2 rounded border text-xs transition-colors ${
                      adSize === s.value
                        ? 'border-zinc-500 bg-zinc-800 text-zinc-200'
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'
                    } disabled:opacity-50`}
                  >
                    <div className="font-medium">{s.label}</div>
                    <div className="text-zinc-600 text-[10px] mt-0.5">{s.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Messaging focus */}
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Messaging Focus <span className="text-zinc-700">(optional)</span></label>
              <textarea
                value={messagingFocus}
                onChange={(e) => setMessagingFocus(e.target.value)}
                placeholder="e.g. Emphasize 24/7 availability and same-day service"
                disabled={isGenerating}
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none disabled:opacity-50"
              />
            </div>

            {/* Reference image */}
            <ReferenceImagePicker
              clientSlug={clientSlug}
              value={referenceImageUrl}
              onChange={setReferenceImageUrl}
            />
          </div>
        )}

        {/* Generation status */}
        {isGenerating && (
          <div className="text-xs text-zinc-500 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
              <span>
                Generating: <span className="text-zinc-300 font-medium">{currentAngleLabel}</span>
              </span>
            </div>
            {allAngles.length > 1 && (
              <div className="ml-3.5">
                <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-zinc-500 rounded-full transition-all"
                    style={{ width: `${(angleProgress.current / angleProgress.total) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-700 mt-1">
                  Angle {angleProgress.current} of {angleProgress.total}
                </p>
              </div>
            )}
          </div>
        )}

        {stage === 'error' && (
          <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
            {errorMessage}
          </p>
        )}

        {/* Generate / Cancel */}
        <div className="pt-1">
          {isGenerating ? (
            <button
              onClick={handleCancel}
              className="w-full py-2.5 rounded border border-zinc-700 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full py-2.5 rounded bg-white text-black text-xs font-medium hover:bg-zinc-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {canGenerate
                ? `Generate ${totalAds} Ad${totalAds !== 1 ? 's' : ''}`
                : 'Select at least one angle'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
