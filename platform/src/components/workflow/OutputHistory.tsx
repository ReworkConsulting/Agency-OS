'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { formatDateTime } from '@/lib/format-date'

interface OutputRecord {
  id: string
  created_at: string
  output_markdown?: string
  output_type: string | null
  workflow_runs?: { status: string; started_at: string; completed_at: string | null }
}

interface OutputHistoryProps {
  outputs: OutputRecord[]
  onRefresh?: () => void
}

export function OutputHistory({ outputs, onRefresh }: OutputHistoryProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (outputs.length === 0) {
    return (
      <div className="rounded-xl p-6 text-center" style={{ border: '1px solid var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>No previous runs yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Previous Runs</h3>
        {onRefresh && (
          <button onClick={onRefresh} className="text-xs transition-opacity hover:opacity-70" style={{ color: 'var(--text-3)' }}>
            Refresh
          </button>
        )}
      </div>

      {outputs.map(output => {
        const isExpanded = expanded === output.id
        const date = formatDateTime(output.created_at)

        return (
          <div key={output.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            <button
              onClick={() => setExpanded(isExpanded ? null : output.id)}
              className="w-full flex items-center justify-between px-4 py-3 transition-all text-left"
              style={{ background: isExpanded ? 'var(--bg-subtle)' : undefined }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: 'var(--text-2)' }}>{date}</span>
                {output.output_type && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded"
                    style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                  >
                    {output.output_type}
                  </span>
                )}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>{isExpanded ? '↑' : '↓'}</span>
            </button>

            {isExpanded && output.output_markdown && (
              <div
                className="p-5 prose prose-sm dark:prose-invert max-w-none overflow-auto"
                style={{ borderTop: '1px solid var(--border)', maxHeight: '500px' }}
              >
                <ReactMarkdown>{output.output_markdown}</ReactMarkdown>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
