'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { useTheme } from 'next-themes'

interface UserInfo {
  id: string
  email?: string
  full_name?: string | null
  role?: string
}

interface TopBarProps {
  user?: UserInfo | null
  isAdmin?: boolean
}

interface Notification {
  id: string
  type: string
  title: string
  message: string | null
  read_at: string | null
  created_at: string
}

export function TopBar({ user, isAdmin }: TopBarProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [mounted, setMounted] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setNotifications(data) })
      .catch(() => {})
  }, [])

  // Close panels on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    if (notifOpen || profileOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [notifOpen, profileOpen])

  const unread = notifications.filter((n) => !n.read_at)
  const isDark = mounted ? resolvedTheme === 'dark' : true

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    )
  }

  async function markAllRead() {
    await Promise.all(unread.map((n) => fetch(`/api/notifications/${n.id}`, { method: 'PATCH' })))
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })))
  }

  async function handleSignOut() {
    setSigningOut(true)
    await fetch('/api/auth/signout', { method: 'POST' })
    window.location.href = '/login'
  }

  const userInitial = (user?.full_name || user?.email || 'U').charAt(0).toUpperCase()
  const userName = user?.full_name || user?.email || ''

  return (
    <div
      className="h-[44px] flex items-center justify-end px-4 gap-1 shrink-0"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
    >
      {/* Notification bell */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false) }}
          className="relative flex items-center justify-center w-8 h-8 rounded-md transition-all"
          style={{
            background: notifOpen ? 'var(--bg-hover)' : 'transparent',
            color: 'var(--text-2)',
          }}
          title="Notifications"
        >
          <BellIcon />
          {unread.length > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-bold px-0.5"
              style={{ background: '#ef4444', color: '#fff' }}
            >
              {unread.length > 9 ? '9+' : unread.length}
            </span>
          )}
        </button>

        {notifOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-[320px] rounded-md z-50 overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Notifications</span>
                {unread.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: '#ef4444', color: '#fff' }}>
                    {unread.length}
                  </span>
                )}
              </div>
              {unread.length > 0 && (
                <button onClick={markAllRead} className="text-xs" style={{ color: 'var(--text-3)' }}>
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: !n.read_at ? 'var(--bg-hover)' : 'transparent',
                    }}
                    onClick={() => { if (!n.read_at) markRead(n.id) }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                      style={{ background: !n.read_at ? '#3b82f6' : 'transparent' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium" style={{ color: 'var(--text-1)' }}>{n.title}</p>
                      {n.message && (
                        <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--text-3)' }}>{n.message}</p>
                      )}
                      <p className="text-[10px] mt-1" style={{ color: 'var(--text-4)' }}>
                        {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Theme toggle */}
      {mounted && (
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="flex items-center justify-center w-8 h-8 rounded-md transition-all"
          style={{ color: 'var(--text-2)' }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      )}

      {/* User avatar + profile dropdown */}
      {user && (
        <div className="relative ml-1" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false) }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold transition-all"
            style={{
              background: profileOpen ? 'var(--text-1)' : 'var(--bg-hover)',
              color: profileOpen ? 'var(--bg)' : 'var(--text-1)',
              border: '1px solid var(--border)',
            }}
            title="Account"
          >
            {userInitial}
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-[200px] rounded-md z-50 overflow-hidden"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              {/* User info header */}
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)' }}>{userName}</p>
                {user.email && user.full_name && (
                  <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>{user.email}</p>
                )}
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  href="/settings/account"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm transition-colors"
                  style={{ color: 'var(--text-2)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <PersonIcon />
                  Profile
                </Link>

                {isAdmin && (
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm transition-colors"
                    style={{ color: 'var(--text-2)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <GearIcon />
                    Settings
                  </Link>
                )}

                <div className="my-1" style={{ borderTop: '1px solid var(--border)' }} />

                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors disabled:opacity-50"
                  style={{ color: '#dc2626' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <SignOutIcon />
                  {signingOut ? 'Signing out…' : 'Sign Out'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Icons ───────────────────────────────────────────────────────────── */
function BellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5A4.5 4.5 0 003.5 6v3.5l-1 1.5h11l-1-1.5V6A4.5 4.5 0 008 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6.5 12.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
function SunIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.22 3.22l1.42 1.42M11.36 11.36l1.42 1.42M3.22 12.78l1.42-1.42M11.36 4.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
}
function MoonIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13.5 10A6.5 6.5 0 016 2.5a6.5 6.5 0 100 11 6.5 6.5 0 007.5-3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
}
function PersonIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
}
function GearIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
}
function SignOutIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
