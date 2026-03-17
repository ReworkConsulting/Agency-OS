'use client'

import { useState } from 'react'

function brandColor(name: string): string {
  const colors = [
    '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6',
    '#ef4444', '#06b6d4', '#f97316', '#ec4899',
    '#84cc16', '#6366f1',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff
  }
  return colors[Math.abs(hash) % colors.length]
}

interface BrandAvatarProps {
  name: string
  logoUrl?: string | null
  size?: 'xs' | 'sm' | 'md'
}

export function BrandAvatar({ name, logoUrl, size = 'md' }: BrandAvatarProps) {
  const [logoError, setLogoError] = useState(false)
  const color = brandColor(name)
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  const sizeClasses = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-8 h-8 text-xs',
  }

  if (logoUrl && !logoError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-contain bg-white shrink-0 p-0.5`}
        onError={() => setLogoError(true)}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold shrink-0`}
      style={{ backgroundColor: `${color}20`, color, border: `1.5px solid ${color}40` }}
    >
      {initials || name[0]?.toUpperCase()}
    </div>
  )
}
