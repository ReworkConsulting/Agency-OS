'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertRecord, AlertModal, SEVERITY_COLORS, SEVERITY_BG } from '@/components/alerts/AlertModal'

interface Client { id: string; company_name: string }
interface TeamMember { id: string; full_name: string; email: string }

interface AlertFeedProps {
  initialAlerts: AlertRecord[]
  clients: Client[]
  teamMembers: TeamMember[]
}

export function AlertFeed({ initialAlerts, clients, teamMembers }: AlertFeedProps) {
  const [alerts, setAlerts] = useState<AlertRecord[]>(initialAlerts)
  const [modal, setModal] = useState<{ open: boolean; alert?: AlertRecord | null }>({ open: false })

  const openAlerts = alerts
    .filter((a) => a.status !== 'resolved')
    .sort((a, b) => {
      const order = { critical: 0, urgent: 1, warning: 2, info: 3 }
      return (order[a.severity] ?? 4) - (order[b.severity] ?? 4)
    })
    .slice(0, 8)

  async function patchAlert(id: string, updates: Partial<AlertRecord>) {
    const res = await fetch(`/api/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      const updated = await res.json()
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)))
    }
  }

  async function createAlert(data: Partial<AlertRecord>) {
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const newAlert = await res.json()
      setAlerts((prev) => [newAlert, ...prev])
    }
  }

  return (
    <div className="rounded-lg" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Alerts</h3>
          {openAlerts.length > 0 && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: '#ef4444', color: '#fff' }}
            >
              {openAlerts.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModal({ open: true, alert: null })}
            className="text-xs px-2 py-1 rounded transition-colors"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
          >
            + Add
          </button>
          <Link href="/alerts" className="text-xs" style={{ color: 'var(--text-3)' }}>
            All →
          </Link>
        </div>
      </div>

      {/* Alert list */}
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {openAlerts.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>No open alerts</p>
          </div>
        ) : (
          openAlerts.map((alert) => (
            <div
              key={alert.id}
              className="px-4 py-3 flex items-start gap-2.5 group"
              style={{ borderLeft: `2px solid ${SEVERITY_COLORS[alert.severity] ?? '#6b7280'}` }}
            >
              <span
                className="text-[9px] font-bold px-1 py-0.5 rounded uppercase tracking-wide shrink-0 mt-0.5"
                style={{ background: SEVERITY_BG[alert.severity], color: SEVERITY_COLORS[alert.severity] }}
              >
                {alert.severity}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-1)' }}>{alert.title}</p>
                {alert.clients && (
                  <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>
                    {alert.clients.company_name}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {alert.status === 'open' && (
                  <button
                    onClick={() => patchAlert(alert.id, { status: 'acknowledged' })}
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}
                  >
                    Ack
                  </button>
                )}
                <button
                  onClick={() => patchAlert(alert.id, { status: 'resolved' })}
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)' }}
                >
                  ✓
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <AlertModal
          alert={modal.alert}
          clients={clients}
          teamMembers={teamMembers}
          onSave={async (data) => {
            if (modal.alert?.id) await patchAlert(modal.alert.id, data)
            else await createAlert(data)
          }}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  )
}
