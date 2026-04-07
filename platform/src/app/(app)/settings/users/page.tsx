'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDate } from '@/lib/format-date'

interface UserRecord {
  id: string
  full_name: string | null
  role: 'admin' | 'member'
  created_at: string
  email: string
}

export default function UsersSettingsPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    const res = await fetch('/api/settings/users')
    const data = await res.json()
    setUsers(data.users ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  async function handleRoleToggle(user: UserRecord) {
    const newRole = user.role === 'admin' ? 'member' : 'admin'
    await fetch(`/api/settings/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u))
  }

  async function handleDelete(userId: string) {
    if (!confirm('Remove this user? This cannot be undone.')) return
    await fetch(`/api/settings/users/${userId}`, { method: 'DELETE' })
    setUsers(prev => prev.filter(u => u.id !== userId))
  }

  async function handlePreview(userId: string) {
    await fetch('/api/settings/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    })
    window.location.href = '/'
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteLoading(true)
    setInviteError(null)
    try {
      const res = await fetch('/api/settings/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Invite failed')
      setInviteSuccess(true)
      setInviteEmail('')
      setTimeout(() => { setInviteSuccess(false); setShowInvite(false) }, 3000)
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : String(err))
    } finally {
      setInviteLoading(false)
    }
  }

  if (loading) return <Skeleton />

  return (
    <div className="px-8 pt-10 pb-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>Users</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>Manage team members and their roles.</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
          style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
        >
          <PlusIcon /> Invite User
        </button>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-sm mx-4 rounded-md p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Invite User</h2>
            <p className="text-xs mb-5" style={{ color: 'var(--text-3)' }}>They&apos;ll receive an email to set their password.</p>

            {inviteError && (
              <div className="mb-4 px-3 py-2 rounded-md text-xs" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#dc2626' }}>
                {inviteError}
              </div>
            )}

            {inviteSuccess ? (
              <div className="text-center py-4">
                <div className="text-2xl mb-2">✓</div>
                <p className="text-sm font-medium" style={{ color: '#22c55e' }}>Invitation sent!</p>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Email address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    required
                    autoFocus
                    placeholder="team@rework.com"
                    className="w-full px-3 py-2 rounded-md text-sm focus:outline-none"
                    style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="flex-1 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-50"
                    style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
                  >
                    {inviteLoading ? 'Sending…' : 'Send Invite'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowInvite(false); setInviteEmail(''); setInviteError(null) }}
                    className="px-4 py-2 rounded-md text-sm transition-all"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
              {['User', 'Role', 'Joined', 'Actions'].map(col => (
                <th key={col} className="px-4 py-3 text-left text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr
                key={user.id}
                style={{
                  borderBottom: i < users.length - 1 ? '1px solid var(--border)' : undefined,
                  background: 'var(--bg-card)',
                }}
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
                      {user.full_name || '—'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>{user.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleRoleToggle(user)}
                    className="px-2.5 py-1 rounded text-[11px] font-medium transition-all capitalize"
                    style={{
                      background: user.role === 'admin' ? 'rgba(59,130,246,0.1)' : 'var(--bg-subtle)',
                      color: user.role === 'admin' ? '#3b82f6' : 'var(--text-2)',
                      border: `1px solid ${user.role === 'admin' ? 'rgba(59,130,246,0.2)' : 'var(--border)'}`,
                    }}
                    title="Click to toggle role"
                  >
                    {user.role}
                  </button>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-3)' }}>
                  {formatDate(user.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePreview(user.id)}
                      className="text-xs transition-opacity hover:opacity-70"
                      style={{ color: 'var(--text-3)' }}
                      title="Preview as this user"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-xs transition-opacity hover:opacity-70"
                      style={{ color: '#dc2626' }}
                      title="Remove user"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-3)', background: 'var(--bg-card)' }}>
                  No users yet. Invite someone to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PlusIcon() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
}

function Skeleton() {
  return (
    <div className="p-8 max-w-3xl space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 rounded-md animate-pulse" style={{ background: 'var(--bg-subtle)' }} />
      ))}
    </div>
  )
}
