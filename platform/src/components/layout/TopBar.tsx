'use client'

import { useEffect, useState, useRef } from 'react'

interface Notification {
  id: string
  type: string
  title: string
  message: string | null
  read_at: string | null
  created_at: string
}

export function TopBar() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [panelOpen, setPanelOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setNotifications(data) })
      .catch(() => {})
  }, [])

  // Close panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false)
      }
    }
    if (panelOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [panelOpen])

  const unread = notifications.filter((n) => !n.read_at)

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

  return (
    <div
      className="h-[44px] flex items-center justify-end px-6 shrink-0"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
    >
      {/* Notification bell */}
      <div className="relative" ref={panelRef}>
        <button
          onClick={() => setPanelOpen((v) => !v)}
          className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-all"
          style={{
            background: panelOpen ? 'var(--bg-hover)' : 'transparent',
            border: '1px solid transparent',
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

        {/* Panel */}
        {panelOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-[320px] rounded-xl shadow-xl z-50 overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {/* Panel header */}
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
                <button
                  onClick={markAllRead}
                  className="text-xs"
                  style={{ color: 'var(--text-3)' }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification list */}
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
                    {/* Unread dot */}
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
    </div>
  )
}

function BellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5A4.5 4.5 0 003.5 6v3.5l-1 1.5h11l-1-1.5V6A4.5 4.5 0 008 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6.5 12.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
