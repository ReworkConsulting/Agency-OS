'use client'

import ReactMarkdown from 'react-markdown'

interface StreamOutputProps {
  content: string
  isStreaming: boolean
}

export function StreamOutput({ content, isStreaming }: StreamOutputProps) {
  if (!content && !isStreaming) return null

  return (
    <div className="rounded-xl overflow-hidden animate-fade-in" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}
      >
        <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>Output</span>
        {isStreaming && (
          <span className="flex items-center gap-1.5 text-xs text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Generating...
          </span>
        )}
      </div>
      <div className="p-5 prose prose-sm dark:prose-invert max-w-none overflow-auto" style={{ maxHeight: '600px' }}>
        <ReactMarkdown>{content}</ReactMarkdown>
        {isStreaming && (
          <span className="inline-block w-0.5 h-4 bg-current animate-pulse ml-0.5 align-middle opacity-60" />
        )}
      </div>
    </div>
  )
}
