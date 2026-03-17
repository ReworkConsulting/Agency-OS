'use client'

import { useState, useCallback } from 'react'
import { StreamOutput } from './StreamOutput'
import { OutputHistory } from './OutputHistory'
import type { ToolDefinition } from '@/types/tool'
import type { StreamEvent } from '@/types/workflow'

interface WorkflowPanelProps {
  tool: ToolDefinition
  clientSlug: string
  prefills?: Record<string, string>
  initialOutputs?: Parameters<typeof OutputHistory>[0]['outputs']
  compact?: boolean
}

export function WorkflowPanel({
  tool,
  clientSlug,
  prefills = {},
  initialOutputs = [],
  compact = false,
}: WorkflowPanelProps) {
  const [inputs, setInputs] = useState<Record<string, string | boolean>>(() => {
    const defaults: Record<string, string | boolean> = {}
    tool.required_inputs.forEach(i => { defaults[i.key] = prefills[i.prefill_from ?? i.key] ?? i.default_value ?? '' })
    tool.optional_inputs.forEach(i => { defaults[i.key] = prefills[i.key] ?? i.default_value ?? '' })
    return defaults
  })

  const [isRunning, setIsRunning] = useState(false)
  const [streamContent, setStreamContent] = useState('')
  const [outputs, setOutputs] = useState(initialOutputs)
  const [error, setError] = useState<string | null>(null)
  const [runComplete, setRunComplete] = useState(false)

  const handleRun = useCallback(async () => {
    for (const input of tool.required_inputs) {
      if (!inputs[input.key]) { setError(`${input.label} is required`); return }
    }
    setIsRunning(true); setStreamContent(''); setError(null); setRunComplete(false)

    try {
      const response = await fetch('/api/workflows/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_slug: clientSlug, tool_id: tool.id, inputs }),
      })

      if (!response.ok || !response.body) {
        const err = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(err.error ?? 'Workflow request failed')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6)
          if (!raw.trim()) continue
          const event: StreamEvent = JSON.parse(raw)
          if (event.type === 'chunk') { accumulated += event.text; setStreamContent(accumulated) }
          else if (event.type === 'complete') {
            setIsRunning(false); setRunComplete(true)
            const res = await fetch(`/api/workflows/${tool.id}/outputs?client_slug=${clientSlug}`)
            if (res.ok) { const data = await res.json(); setOutputs(data.outputs ?? []) }
          } else if (event.type === 'error') throw new Error(event.message)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setIsRunning(false)
    }
  }, [tool, clientSlug, inputs])

  const allInputs = [...tool.required_inputs, ...tool.optional_inputs]

  const inputClass = "w-full px-3 py-2 rounded-lg text-xs transition-colors focus:outline-none"
  const inputStyle = {
    background: 'var(--bg-subtle)',
    border: '1px solid var(--border)',
    color: 'var(--text-1)',
  }

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
      >
        {!compact && (
          <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-1)' }}>{tool.label}</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>{tool.description}</p>
          </div>
        )}

        <div className={compact ? 'p-4' : 'p-5'}>
          {/* Inputs */}
          {allInputs.length > 0 && (
            <div className="space-y-3.5 mb-4">
              {allInputs.map(input => (
                <div key={input.key}>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                    {input.label}
                    {input.required && <span className="ml-0.5" style={{ color: 'var(--text-3)' }}>*</span>}
                  </label>

                  {input.type === 'boolean' ? (
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(inputs[input.key])}
                        onClick={() => setInputs(p => ({ ...p, [input.key]: !p[input.key] }))}
                        className="relative w-9 h-5 rounded-full transition-colors shrink-0"
                        style={{ background: inputs[input.key] ? 'var(--text-1)' : 'var(--bg-hover)', border: '1px solid var(--border)' }}
                      >
                        <span
                          className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
                          style={{
                            background: inputs[input.key] ? 'var(--bg)' : 'var(--text-3)',
                            transform: inputs[input.key] ? 'translateX(17px)' : 'translateX(2px)',
                          }}
                        />
                      </button>
                      <span className="text-xs" style={{ color: 'var(--text-2)' }}>{input.label}</span>
                    </label>
                  ) : input.type === 'textarea' ? (
                    <textarea
                      value={String(inputs[input.key] ?? '')}
                      onChange={e => setInputs(p => ({ ...p, [input.key]: e.target.value }))}
                      placeholder={input.placeholder}
                      rows={3}
                      className={`${inputClass} resize-none`}
                      style={inputStyle}
                    />
                  ) : input.type === 'select' ? (
                    <select
                      value={String(inputs[input.key] ?? '')}
                      onChange={e => setInputs(p => ({ ...p, [input.key]: e.target.value }))}
                      className={inputClass}
                      style={inputStyle}
                    >
                      <option value="">Select...</option>
                      {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={input.type}
                      value={String(inputs[input.key] ?? '')}
                      onChange={e => setInputs(p => ({ ...p, [input.key]: e.target.value }))}
                      placeholder={input.placeholder}
                      className={inputClass}
                      style={inputStyle}
                    />
                  )}

                  {input.helper_text && (
                    <p className="mt-1 text-[10px]" style={{ color: 'var(--text-3)' }}>{input.helper_text}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#dc2626' }}>
              {error}
            </div>
          )}

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            {isRunning ? (
              <><Spinner /> Generating...</>
            ) : runComplete ? (
              <><span style={{ color: '#22c55e' }}>✓</span> Run Again</>
            ) : (
              <>{compact ? 'Run Research' : `Run ${tool.label}`}</>
            )}
          </button>
        </div>
      </div>

      <StreamOutput content={streamContent} isStreaming={isRunning} />
      {outputs.length > 0 && <OutputHistory outputs={outputs} />}
    </div>
  )
}

function Spinner() {
  return <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
}
