import type { ReactNode } from 'react'

interface ToolComingSoonProps {
  title: string
  description: string
  features: string[]
  prerequisites?: string[]
  icon: ReactNode
}

export function ToolComingSoon({ title, description, features, prerequisites, icon }: ToolComingSoonProps) {
  return (
    <div className="px-8 pt-14 pb-12 max-w-lg">
      {/* Status pill */}
      <div
        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest mb-8"
        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-4)' }} />
        Workflow in development
      </div>

      {/* Header */}
      <div
        className="w-10 h-10 rounded-md flex items-center justify-center mb-5"
        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
      >
        {icon}
      </div>
      <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--text-1)' }}>{title}</h2>
      <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-2)' }}>{description}</p>

      {/* Features */}
      <div className="mb-8">
        <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--text-3)' }}>
          What it will do
        </p>
        <ul className="space-y-2">
          {features.map(feature => (
            <li key={feature} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--text-4)' }} className="shrink-0 mt-px">–</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Prerequisites */}
      {prerequisites && prerequisites.length > 0 && (
        <div className="rounded-md p-4" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] font-semibold tracking-widest uppercase mb-2.5" style={{ color: 'var(--text-3)' }}>
            Prerequisites
          </p>
          <ul className="space-y-1.5">
            {prerequisites.map(req => (
              <li key={req} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--text-4)' }}>→</span>
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
