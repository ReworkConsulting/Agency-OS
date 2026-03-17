'use client'

import type { AdCreative } from './AdCard'

interface AdGalleryFiltersProps {
  creatives: AdCreative[]
  filterAngle: string | null
  filterFormat: string | null
  showWinnersOnly: boolean
  visibleCount: number
  onFilterAngle: (v: string | null) => void
  onFilterFormat: (v: string | null) => void
  onToggleWinners: (v: boolean) => void
}

export function AdGalleryFilters({
  creatives,
  filterAngle,
  filterFormat,
  showWinnersOnly,
  visibleCount,
  onFilterAngle,
  onFilterFormat,
  onToggleWinners,
}: AdGalleryFiltersProps) {
  const angles = [...new Set(creatives.map((c) => c.angle).filter(Boolean))] as string[]
  const formats = [...new Set(creatives.map((c) => c.ad_format).filter(Boolean))] as string[]

  const hasFilter = filterAngle !== null || filterFormat !== null || showWinnersOnly
  const winnerCount = creatives.filter((c) => c.is_winner).length

  function clearAll() {
    onFilterAngle(null)
    onFilterFormat(null)
    onToggleWinners(false)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Winner toggle */}
      {winnerCount > 0 && (
        <FilterPill
          active={showWinnersOnly}
          onClick={() => onToggleWinners(!showWinnersOnly)}
        >
          ★ Winners{winnerCount > 0 ? ` (${winnerCount})` : ''}
        </FilterPill>
      )}

      {/* Angle filter */}
      {angles.length > 1 && (
        <FilterDropdown
          label="Angle"
          value={filterAngle}
          options={angles}
          onChange={onFilterAngle}
        />
      )}

      {/* Format filter */}
      {formats.length > 1 && (
        <FilterDropdown
          label="Format"
          value={filterFormat}
          options={formats}
          onChange={onFilterFormat}
        />
      )}

      {/* Clear */}
      {hasFilter && (
        <button
          onClick={clearAll}
          className="text-[10px] px-2 py-1 rounded transition-colors"
          style={{ color: 'var(--text-3)', border: '1px solid var(--border-dim)' }}
        >
          Clear
        </button>
      )}

      {/* Count */}
      <span className="text-[11px] ml-auto" style={{ color: 'var(--text-4)' }}>
        {hasFilter ? `${visibleCount} of ${creatives.length}` : `${creatives.length} ad${creatives.length !== 1 ? 's' : ''}`}
      </span>
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors"
      style={{
        background: active ? 'var(--text-1)' : 'var(--bg-subtle)',
        color: active ? 'var(--bg)' : 'var(--text-3)',
        border: `1px solid ${active ? 'var(--text-1)' : 'var(--border)'}`,
      }}
    >
      {children}
    </button>
  )
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string | null
  options: string[]
  onChange: (v: string | null) => void
}) {
  return (
    <div className="relative">
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="text-[11px] pl-2.5 pr-6 py-1 rounded-full appearance-none cursor-pointer focus:outline-none"
        style={{
          background: value ? 'var(--text-1)' : 'var(--bg-subtle)',
          color: value ? 'var(--bg)' : 'var(--text-3)',
          border: `1px solid ${value ? 'var(--text-1)' : 'var(--border)'}`,
        }}
      >
        <option value="">{label} ▾</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}
