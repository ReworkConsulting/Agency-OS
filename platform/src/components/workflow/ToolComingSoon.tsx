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
    <div className="p-8 animate-fade-in">
      <div className="max-w-xl">
        {/* Status pill */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-6"
          style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-4)' }} />
          Workflow in development
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
          >
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-1)' }}>{title}</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{description}</p>
          </div>
        </div>

        <div className="h-px mb-6" style={{ background: 'var(--border)' }} />

        {/* Features */}
        <div className="mb-6">
          <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--text-3)' }}>
            What it will do
          </p>
          <ul className="space-y-2.5">
            {features.map(feature => (
              <li key={feature} className="flex items-start gap-2.5">
                <span
                  className="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 text-[8px]"
                  style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
                >
                  ○
                </span>
                <span className="text-sm" style={{ color: 'var(--text-2)' }}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prerequisites */}
        {prerequisites && prerequisites.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-2.5" style={{ color: 'var(--text-3)' }}>
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
    </div>
  )
}
