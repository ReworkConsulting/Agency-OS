'use client'

import { useState, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push(redirect)
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      {/* Background dot texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--text-1) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative w-full max-w-sm px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
            style={{ background: 'var(--text-1)' }}
          >
            <span style={{ color: 'var(--bg)', fontSize: 13, fontWeight: 900, letterSpacing: '-0.5px' }}>
              RW
            </span>
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: 'var(--text-1)' }}>
            Agency OS
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
            Rework Consulting
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>
            Sign in
          </h2>
          <p className="text-xs mb-6" style={{ color: 'var(--text-3)' }}>
            Use your invite credentials to access the platform.
          </p>

          {error && (
            <div
              className="mb-4 px-3 py-2.5 rounded-lg text-xs"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#dc2626' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Email
              </label>
              <input
                suppressHydrationWarning
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@rework.com"
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-colors"
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-1)',
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
                Password
              </label>
              <input
                suppressHydrationWarning
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-colors"
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-1)',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] mt-6" style={{ color: 'var(--text-4)' }}>
          Access is by invitation only. Contact your admin.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
