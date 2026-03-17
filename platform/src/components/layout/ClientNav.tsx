'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const CLIENT_NAV_ITEMS = [
  { label: 'Overview', segment: '' },
  { label: 'Research', segment: 'research' },
  { label: 'Ads', segment: 'ads' },
  { label: 'SEO', segment: 'seo' },
  { label: 'Reports', segment: 'reports' },
  { label: 'Brand', segment: 'brand' },
]

interface ClientNavProps {
  slug: string
}

export function ClientNav({ slug }: ClientNavProps) {
  const pathname = usePathname()
  const base = `/clients/${slug}`

  return (
    <nav className="flex gap-1" style={{ borderBottom: '1px solid var(--border)' }}>
      {CLIENT_NAV_ITEMS.map((item) => {
        const href = item.segment ? `${base}/${item.segment}` : base
        const active = item.segment
          ? pathname === href || pathname.startsWith(href + '/')
          : pathname === base

        return (
          <Link
            key={href}
            href={href}
            className="px-3 py-3 text-sm border-b-2 -mb-px transition-colors"
            style={{
              borderBottomColor: active ? 'var(--text-1)' : 'transparent',
              color: active ? 'var(--text-1)' : 'var(--text-3)',
              fontWeight: active ? 500 : 400,
            }}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
