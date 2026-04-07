'use client'

const SCRIPT_STYLES = [
  {
    value: 'Pain Hook',
    label: 'Pain Hook',
    description: 'Open with the consequence of the problem',
  },
  {
    value: 'Results First',
    label: 'Results First',
    description: 'Lead with the outcome, then earn it',
  },
  {
    value: 'Testimonial Style',
    label: 'Testimonial',
    description: 'Deliver results through a customer lens',
  },
  {
    value: 'Day-in-Life',
    label: 'Day-in-Life',
    description: 'Walk through the customer experience',
  },
  {
    value: 'Problem-Agitate-Solve',
    label: 'P-A-S',
    description: 'State, deepen, then resolve the problem',
  },
  {
    value: 'Offer Drop',
    label: 'Offer Drop',
    description: 'Lead with the offer — no warmup',
  },
  {
    value: 'Myth Bust',
    label: 'Myth Bust',
    description: 'Challenge a common wrong belief',
  },
  {
    value: 'Direct Response',
    label: 'Direct Response',
    description: 'Pure action-driving copy, nothing else',
  },
]

interface ScriptStylePickerProps {
  value: string
  onChange: (style: string) => void
  disabled?: boolean
}

export function ScriptStylePicker({ value, onChange, disabled }: ScriptStylePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {SCRIPT_STYLES.map((style) => {
        const active = value === style.value
        return (
          <button
            key={style.value}
            onClick={() => onChange(style.value)}
            disabled={disabled}
            className="text-left p-2.5 rounded-lg transition-colors disabled:opacity-50"
            style={{
              background: active ? 'var(--text-1)' : 'var(--bg-subtle)',
              border: `1px solid ${active ? 'var(--text-1)' : 'var(--border)'}`,
            }}
          >
            <p
              className="text-[11px] font-semibold"
              style={{ color: active ? 'var(--bg)' : 'var(--text-1)' }}
            >
              {style.label}
            </p>
            <p
              className="text-[10px] mt-0.5 leading-tight"
              style={{ color: active ? 'var(--bg-hover)' : 'var(--text-4)' }}
            >
              {style.description}
            </p>
          </button>
        )
      })}
    </div>
  )
}
