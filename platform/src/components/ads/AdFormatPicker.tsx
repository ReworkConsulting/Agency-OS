'use client'

export interface AdFormat {
  name: string
  description: string
  icon: React.ReactNode
}

export const AD_FORMATS: AdFormat[] = [
  {
    name: 'Headline Statement',
    description: 'Bold claim, stops scroll',
    icon: <HeadlineIcon />,
  },
  {
    name: 'Offer / Promotion',
    description: 'Price or deal upfront',
    icon: <OfferIcon />,
  },
  {
    name: 'Testimonial Card',
    description: 'Customer quote + result',
    icon: <TestimonialIcon />,
  },
  {
    name: 'Before & After',
    description: 'Transformation proof',
    icon: <BeforeAfterIcon />,
  },
  {
    name: 'Pain Point Hook',
    description: 'Problem-agitation',
    icon: <PainPointIcon />,
  },
  {
    name: 'Social Proof / Stats',
    description: 'Numbers that persuade',
    icon: <StatsIcon />,
  },
  {
    name: 'Us vs. Them',
    description: 'Win the comparison',
    icon: <VsIcon />,
  },
  {
    name: 'Feature Bullets',
    description: '3-5 key differentiators',
    icon: <BulletsIcon />,
  },
  {
    name: 'Lifestyle / Aspiration',
    description: 'Emotional, warm appeal',
    icon: <LifestyleIcon />,
  },
  {
    name: 'Urgency / Seasonal',
    description: 'Time-limited pressure',
    icon: <UrgencyIcon />,
  },
]

interface AdFormatPickerProps {
  value: string
  onChange: (format: string) => void
  disabled?: boolean
}

export function AdFormatPicker({ value, onChange, disabled }: AdFormatPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {AD_FORMATS.map((fmt) => {
        const isSelected = value === fmt.name
        return (
          <button
            key={fmt.name}
            type="button"
            onClick={() => onChange(fmt.name)}
            disabled={disabled}
            className="flex items-start gap-2.5 px-2.5 py-2.5 rounded-lg text-left border transition-all disabled:opacity-50"
            style={{
              background: isSelected ? 'var(--bg-hover)' : 'var(--bg-subtle)',
              border: `1px solid ${isSelected ? 'var(--border)' : 'var(--border-dim)'}`,
              outline: isSelected ? '1px solid var(--text-3)' : 'none',
              outlineOffset: '-2px',
            }}
          >
            <span
              className="mt-0.5 shrink-0 w-5 h-5 rounded flex items-center justify-center"
              style={{ color: isSelected ? 'var(--text-1)' : 'var(--text-3)' }}
            >
              {fmt.icon}
            </span>
            <div className="min-w-0">
              <p
                className="text-[11px] font-semibold leading-snug truncate"
                style={{ color: isSelected ? 'var(--text-1)' : 'var(--text-2)' }}
              >
                {fmt.name}
              </p>
              <p
                className="text-[10px] leading-snug mt-0.5 truncate"
                style={{ color: 'var(--text-3)' }}
              >
                {fmt.description}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

/* ── Icons ────────────────────────────────────────────────────────────── */

function HeadlineIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function OfferIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 8a6 6 0 1 0 12 0A6 6 0 0 0 2 8z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 5v1.5M8 9.5V11M6.5 7a1.5 1.5 0 0 1 3 0c0 1-1.5 1.5-1.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function TestimonialIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 3h12a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H9l-3 2v-2H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5 7h1M8 7h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function BeforeAfterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4 8h2M10 8h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function PainPointIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L1.5 13h13L8 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
    </svg>
  )
}

function StatsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="9" width="3" height="6" rx="0.8" fill="currentColor" />
      <rect x="6" y="5.5" width="3" height="9.5" rx="0.8" fill="currentColor" />
      <rect x="11" y="2" width="3" height="13" rx="0.8" fill="currentColor" />
    </svg>
  )
}

function VsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="5.5" height="12" rx="1" stroke="currentColor" strokeWidth="1.3" strokeDasharray="2 1.5" />
      <rect x="9.5" y="2" width="5.5" height="12" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7.5 8h1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function BulletsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="3" cy="5" r="1.2" fill="currentColor" />
      <circle cx="3" cy="8.5" r="1.2" fill="currentColor" />
      <circle cx="3" cy="12" r="1.2" fill="currentColor" />
      <path d="M6.5 5h7M6.5 8.5h7M6.5 12h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function LifestyleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3 14c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function UrgencyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5.5v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 1.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
