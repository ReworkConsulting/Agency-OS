'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AccountPage() {
  const router = useRouter()
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null)
  const [fullName, setFullName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [savingName, setSavingName] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  const [changingPw, setChangingPw] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)

  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null)
      // Load profile name
      if (user) {
        fetch('/api/settings/users')
          .then(r => r.json())
          .then(data => {
            const me = (data.users ?? []).find((u: { id: string; full_name: string | null }) => u.id === user.id)
            if (me) setFullName(me.full_name ?? '')
          })
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    setSavingName(true)
    setNameError(null)
    try {
      const res = await fetch(`/api/settings/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 3000)
    } catch (err) {
      setNameError(err instanceof Error ? err.message : String(err))
    } finally {
      setSavingName(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match'); return }
    if (newPassword.length < 8) { setPwError('Password must be at least 8 characters'); return }
    setChangingPw(true)
    setPwError(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPwError(error.message)
    } else {
      setPwSaved(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPwSaved(false), 3000)
    }
    setChangingPw(false)
  }

  async function handleSignOut() {
    setSigningOut(true)
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>Account</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
          {user?.email && <span style={{ color: 'var(--text-2)' }}>{user.email}</span>}
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <Section title="Profile">
          <form onSubmit={handleSaveName} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
              />
            </div>
            {nameError && <p className="text-xs" style={{ color: '#dc2626' }}>{nameError}</p>}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={savingName}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
              >
                {savingName ? 'Saving…' : 'Save Name'}
              </button>
              {nameSaved && <span className="text-xs font-medium" style={{ color: '#22c55e' }}>✓ Saved</span>}
            </div>
          </form>
        </Section>

        {/* Change password */}
        <Section title="Change Password">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
              />
            </div>
            {pwError && <p className="text-xs" style={{ color: '#dc2626' }}>{pwError}</p>}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={changingPw || !newPassword}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
              >
                {changingPw ? 'Updating…' : 'Update Password'}
              </button>
              {pwSaved && <span className="text-xs font-medium" style={{ color: '#22c55e' }}>✓ Password updated</span>}
            </div>
          </form>
        </Section>

        {/* Sign out */}
        <Section title="Session">
          <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>
            Sign out of Agency OS on this device.
          </p>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#dc2626', background: 'rgba(239,68,68,0.06)' }}
          >
            {signingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--text-3)' }}>{title}</h2>
      <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {children}
      </div>
    </section>
  )
}
