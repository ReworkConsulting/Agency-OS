'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface UserInfo {
  id: string
  email?: string
  full_name?: string | null
  role?: string
}

interface SidebarProps {
  clients?: { id: string; slug: string; company_name: string; logo_url: string | null }[]
  user?: UserInfo | null
  allowedMenus?: string[]
  allowedTools?: string[]
}

const ALL_CLIENT_TOOLS = [
  { label: 'Overview',  segment: '',         icon: <HomeIcon />,     menu: 'overview' },
  { label: 'Research',  segment: 'research', icon: <SearchIcon />,   menu: 'research' },
  { label: 'Ads',       segment: 'ads',      icon: <BoltIcon />,     menu: 'ads' },
  { label: 'SEO',       segment: 'seo',      icon: <TrendingIcon />, menu: 'seo' },
  { label: 'Reports',   segment: 'reports',  icon: <ChartIcon />,    menu: 'reports' },
  { label: 'Brand',     segment: 'brand',    icon: <SwatchIcon />,   menu: 'brand' },
]

const TOP_NAV = [
  { label: 'Dashboard',  href: '/',            icon: <GridIcon /> },
  { label: 'Clients',    href: '/clients',     icon: <UsersIcon /> },
  { label: 'Ad Library', href: '/ads/library', icon: <BookmarkIcon /> },
]

export function Sidebar({ clients = [], user, allowedMenus = [] }: SidebarProps) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const clientSlugMatch = pathname.match(/^\/clients\/([^/]+)/)
  const activeSlug = clientSlugMatch?.[1]
  const activeClient = clients.find(c => c.slug === activeSlug)

  // Admins always see all menus; members filtered by allowedMenus (empty = all)
  const isAdmin = user?.role === 'admin'
  const clientTools = isAdmin || allowedMenus.length === 0
    ? ALL_CLIENT_TOOLS
    : ALL_CLIENT_TOOLS.filter(t => t.menu === 'overview' || allowedMenus.includes(t.menu))

  // Safe: only use resolvedTheme after mount to avoid hydration mismatch
  const isDark = mounted ? resolvedTheme === 'dark' : true

  return (
    <aside
      className="w-[240px] shrink-0 min-h-screen flex flex-col"
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
    >
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div
        className="px-5 h-[60px] flex items-center shrink-0"
        style={{ borderBottom: '1px solid var(--sidebar-border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
            style={{ background: 'var(--text-1)' }}
          >
            <span style={{ color: 'var(--bg)', fontSize: 10, fontWeight: 900, letterSpacing: '-0.5px' }}>RW</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold leading-none" style={{ color: 'var(--text-1)' }}>Agency OS</p>
            <p className="text-[11px] leading-none mt-1" style={{ color: 'var(--text-3)' }}>Rework Consulting</p>
          </div>
        </div>
      </div>

      {/* ── Top nav ──────────────────────────────────────────── */}
      <nav className="px-3 pt-4 pb-2">
        {TOP_NAV.map(item => {
          const active = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href) && !activeSlug
          return <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} active={active} />
        })}
      </nav>

      {/* ── Active client tools ───────────────────────────────── */}
      {activeClient && (
        <>
          <Divider />
          <div className="px-4 mb-2">
            <div className="flex items-center gap-2.5">
              <ClientLogo client={activeClient} size={22} />
              <span className="text-[12px] font-medium truncate" style={{ color: 'var(--text-2)' }}>
                {activeClient.company_name}
              </span>
            </div>
          </div>
          <nav className="px-3 space-y-0.5">
            {clientTools.map(tool => {
              const href = tool.segment
                ? `/clients/${activeSlug}/${tool.segment}`
                : `/clients/${activeSlug}`
              const active = tool.segment
                ? pathname === href || pathname.startsWith(href + '/')
                : pathname === href
              return <NavItem key={href} href={href} icon={tool.icon} label={tool.label} active={active} indent />
            })}
          </nav>
        </>
      )}

      {/* ── Clients list ─────────────────────────────────────── */}
      {clients.length > 0 && (
        <>
          <Divider />
          <div className="px-4 mb-2">
            <p className="text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: 'var(--text-3)' }}>
              Clients
            </p>
          </div>
          <nav className="px-3 pb-2 space-y-0.5 flex-1 overflow-y-auto">
            {clients.map(client => {
              const href = `/clients/${client.slug}`
              const active = pathname.startsWith(href)
              return (
                <ClientLink key={client.slug} href={href} active={active} client={client} />
              )
            })}
          </nav>
        </>
      )}

      {/* Spacer pushes footer down when no clients list */}
      {clients.length === 0 && <div className="flex-1" />}

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="mt-auto" style={{ borderTop: '1px solid var(--sidebar-border)' }}>

        {/* Settings — only show for admins */}
        {isAdmin && (
          <div className="px-3 pt-3">
            <NavItem
              href="/settings"
              icon={<GearIcon />}
              label="Settings"
              active={pathname.startsWith('/settings')}
            />
          </div>
        )}

        {/* User info */}
        {user && (
          <div
            className="px-4 py-3 flex items-center gap-2.5"
            style={{ borderTop: isAdmin ? '1px solid var(--sidebar-border)' : undefined, marginTop: isAdmin ? '8px' : undefined }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
            >
              {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium truncate" style={{ color: 'var(--text-1)' }}>
                {user.full_name || user.email}
              </p>
              <p className="text-[10px] capitalize" style={{ color: 'var(--text-4)' }}>{user.role}</p>
            </div>
          </div>
        )}

        {/* Version + theme toggle */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--sidebar-border)' }}
        >
          <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>v0.1.0</span>
          {mounted && (
            <ThemeToggleButton isDark={isDark} setTheme={setTheme} />
          )}
        </div>
      </div>
    </aside>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function Divider() {
  return <div className="mx-4 my-3 h-px" style={{ background: 'var(--sidebar-border)' }} />
}

function ThemeToggleButton({ isDark, setTheme }: { isDark: boolean; setTheme: (t: string) => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md"
      style={{
        background: hovered ? 'var(--bg-subtle)' : 'var(--bg-hover)',
        color: hovered ? 'var(--text-1)' : 'var(--text-2)',
        border: '1px solid var(--border)',
        transition: 'background-color 0.15s ease, color 0.15s ease',
      }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      <span className="text-[11px] font-medium">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}

function ClientLogo({ client, size }: { client: { company_name: string; logo_url: string | null }, size: number }) {
  if (client.logo_url) {
    return (
      <div
        className="rounded overflow-hidden shrink-0 flex items-center justify-center"
        style={{ width: size, height: size, background: 'var(--bg-subtle)' }}
      >
        <Image src={client.logo_url} alt="" width={size} height={size} className="object-contain" unoptimized />
      </div>
    )
  }
  return (
    <div
      className="rounded shrink-0 flex items-center justify-center"
      style={{ width: size, height: size, background: 'var(--bg-subtle)' }}
    >
      <span style={{ fontSize: size * 0.45, fontWeight: 700, color: 'var(--text-3)' }}>
        {client.company_name.charAt(0)}
      </span>
    </div>
  )
}

function NavItem({ href, icon, label, active, indent = false }: {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
  indent?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const lit = active || hovered

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13px] relative"
      style={{
        paddingLeft: indent ? '0.875rem' : undefined,
        background: lit ? 'var(--bg-hover)' : 'transparent',
        color: lit ? 'var(--text-1)' : 'var(--text-2)',
        fontWeight: active ? 500 : 400,
        transition: 'background-color 0.15s ease, color 0.15s ease',
      }}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
          style={{ background: 'var(--text-1)' }}
        />
      )}
      <span style={{ color: lit ? 'var(--text-1)' : 'var(--text-3)', flexShrink: 0, transition: 'color 0.15s ease' }}>{icon}</span>
      {label}
    </Link>
  )
}

function ClientLink({ href, active, client }: {
  href: string
  active: boolean
  client: { company_name: string; logo_url: string | null }
}) {
  const [hovered, setHovered] = useState(false)
  const lit = active || hovered

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-2.5 px-2 py-2 rounded-lg"
      style={{
        background: lit ? 'var(--bg-hover)' : 'transparent',
        color: lit ? 'var(--text-1)' : 'var(--text-2)',
        transition: 'background-color 0.15s ease, color 0.15s ease',
      }}
    >
      <ClientLogo client={client} size={18} />
      <span className="text-[13px] truncate">{client.company_name}</span>
    </Link>
  )
}

/* ── Icons ───────────────────────────────────────────────────────────── */
function GridIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" /><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" /><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" /><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" /></svg>
}
function UsersIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" /><path d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.4" /><path d="M12 10.5c1.93.4 3 1.8 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
}
function HomeIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M6 15V9h4v6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
}
function SearchIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" /><path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
}
function BoltIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M9 1L3 9h5l-1 6 7-8H9L10 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
}
function TrendingIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M1 11l4-4 3 3 4-4 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function ChartIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="9" width="3" height="6" rx="1" fill="currentColor" /><rect x="6" y="6" width="3" height="9" rx="1" fill="currentColor" /><rect x="11" y="3" width="3" height="12" rx="1" fill="currentColor" /></svg>
}
function SwatchIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="5" cy="8" r="4" stroke="currentColor" strokeWidth="1.4" /><circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.4" /></svg>
}
function SunIcon() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.22 3.22l1.42 1.42M11.36 11.36l1.42 1.42M3.22 12.78l1.42-1.42M11.36 4.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
}
function MoonIcon() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M13.5 10A6.5 6.5 0 016 2.5a6.5 6.5 0 100 11 6.5 6.5 0 007.5-3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
}
function BookmarkIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 2h10a1 1 0 011 1v11l-6-3-6 3V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
}
function GearIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
}
