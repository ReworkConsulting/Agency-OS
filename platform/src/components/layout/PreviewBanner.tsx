'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PreviewBannerProps {
  userName: string
  userRole: string
}

export function PreviewBanner({ userName, userRole }: PreviewBannerProps) {
  const router = useRouter()
  const [exiting, setExiting] = useState(false)

  async function handleExit() {
    setExiting(true)
    await fetch('/api/settings/preview', { method: 'DELETE' })
    router.push('/settings/permissions')
    router.refresh()
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2.5"
      style={{
        background: 'rgba(234,179,8,0.12)',
        borderBottom: '1px solid rgba(234,179,8,0.3)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <span style={{ color: 'rgb(234,179,8)' }}>
          <EyeIcon />
        </span>
        <span className="text-xs font-medium" style={{ color: 'rgb(161,120,0)' }}>
          Previewing as
        </span>
        <span className="text-xs font-semibold" style={{ color: 'rgb(120,88,0)' }}>
          {userName}
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full capitalize"
          style={{ background: 'rgba(234,179,8,0.15)', color: 'rgb(161,120,0)', border: '1px solid rgba(234,179,8,0.2)' }}
        >
          {userRole}
        </span>
      </div>
      <button
        onClick={handleExit}
        disabled={exiting}
        className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all disabled:opacity-50"
        style={{ background: 'rgba(234,179,8,0.15)', color: 'rgb(120,88,0)', border: '1px solid rgba(234,179,8,0.25)' }}
      >
        {exiting ? 'Exiting…' : <><XIcon /> Exit Preview</>}
      </button>
    </div>
  )
}

function EyeIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/></svg>
}

function XIcon() {
  return <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
}
