import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const role = headersList.get('x-user-role')

  // Not admin → redirect to home
  if (role !== 'admin') redirect('/')

  const NAV = [
    { label: 'General',     href: '/settings/general',     icon: <BuildingIcon /> },
    { label: 'Users',       href: '/settings/users',        icon: <UsersIcon /> },
    { label: 'Permissions', href: '/settings/permissions',  icon: <ShieldIcon /> },
    { label: 'Account',     href: '/settings/account',      icon: <UserIcon /> },
  ]

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Settings sidebar */}
      <aside
        className="w-[220px] shrink-0 flex flex-col"
        style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}
      >
        <div className="px-5 h-[60px] flex items-center" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: 'var(--text-1)' }}>Settings</p>
            <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>Agency OS</p>
          </div>
        </div>

        <nav className="px-3 pt-4 space-y-0.5 flex-1">
          {NAV.map(item => (
            <SettingsNavItem key={item.href} href={item.href} icon={item.icon} label={item.label} />
          ))}
        </nav>

        <div className="px-3 pb-4" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <Link
            href="/"
            className="settings-nav-link flex items-center gap-2 px-2 py-2 rounded-lg text-xs"
            style={{ color: 'var(--text-3)' }}
          >
            <ArrowLeftIcon />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto" style={{ background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}

function SettingsNavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="settings-nav-link flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13px]"
      style={{ color: 'var(--text-2)' }}
    >
      <span style={{ color: 'var(--text-3)', flexShrink: 0 }}>{icon}</span>
      {label}
    </Link>
  )
}

function BuildingIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="14" height="11" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M5 4V2.5A1.5 1.5 0 016.5 1h3A1.5 1.5 0 0111 2.5V4" stroke="currentColor" strokeWidth="1.4"/><path d="M8 9v2M6 9v2M10 9v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
}
function UsersIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.4"/><path d="M12 10.5c1.93.4 3 1.8 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
}
function ShieldIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1L2 3.5V8c0 3.3 2.67 5.7 6 7 3.33-1.3 6-3.7 6-7V3.5L8 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
}
function UserIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
}
function ArrowLeftIcon() {
  return <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
