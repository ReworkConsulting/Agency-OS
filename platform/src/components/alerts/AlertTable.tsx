'use client'

import { useState } from 'react'
import { AlertRecord, AlertModal, AlertStatus, SEVERITY_COLORS, SEVERITY_BG } from './AlertModal'

interface Client { id: string; company_name: string }
interface TeamMember { id: string; full_name: string; email: string }

interface AlertTableProps {
  initialAlerts: AlertRecord[]
  clients: Client[]
  teamMembers: TeamMember[]
}

const STATUS_STYLES: Record<AlertStatus, { label: string; color: string }> = {
  open: { label: 'Open', color: '#ef4444' },
  acknowledged: { label: 'Acknowledged', color: '#f59e0b' },
  resolved: { label: 'Resolved', color: '#22c55e' },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function AlertTable({ initialAlerts, clients, teamMembers }: AlertTableProps) {
  const [alerts, setAlerts] = useState<AlertRecord[]>(initialAlerts)
  const [modal, setModal] = useState<{ open: boolean; alert?: AlertRecord | null }>({ open: false })
  const [filterStatus, setFilterStatus] = useState<string>('open')
  const [filterSeverity, setFilterSeverity] = useState('')
  const [filterClient, setFilterClient] = useState('')
  const [showResolved, setShowResolved] = useState(false)

  const visible = alerts.filter((a) => {
    if (filterStatus && a.status !== filterStatus) return false
    if (filterSeverity && a.severity !== filterSeverity) return false
    if (filterClient && a.client_id !== filterClient) return false
    return true
  })

  const sorted = [...visible].sort((a, b) => {
    const severityOrder = { critical: 0, urgent: 1, warning: 2, info: 3 }
    return (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)
  })

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

  async function deleteAlert(id: string) {
    await fetch(`/api/alerts/${id}`, { method: 'DELETE' })
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          {(['open', 'acknowledged', 'resolved', ''] as const).map((s) => (
            <button
              key={s || 'all'}
              onClick={() => { setFilterStatus(s); if (s === 'resolved' || s === '') setShowResolved(true) }}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={{
                background: filterStatus === s ? 'var(--text-1)' : 'var(--bg-subtle)',
                color: filterStatus === s ? 'var(--bg)' : 'var(--text-2)',
                border: '1px solid var(--border)',
              }}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}

          {/* Severity filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="rounded-lg px-2.5 py-1.5 text-xs outline-none"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: filterSeverity ? 'var(--text-1)' : 'var(--text-3)' }}
          >
            <option value="">All severities</option>
            <option value="critical">Critical</option>
            <option value="urgent">Urgent</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>

          {/* Client filter */}
          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="rounded-lg px-2.5 py-1.5 text-xs outline-none"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: filterClient ? 'var(--text-1)' : 'var(--text-3)' }}
          >
            <option value="">All clients</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
        </div>

        <button
          onClick={() => setModal({ open: true, alert: null })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
          style={{ background: 'var(--text-1)', color: 'var(--bg)' }}
        >
          <span className="text-base leading-none">+</span> New Alert
        </button>
      </div>

      {/* Count summary */}
      <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>
        {sorted.length} alert{sorted.length !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="rounded-lg p-10 text-center" style={{ border: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>No alerts match your filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((alert) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              onEdit={() => setModal({ open: true, alert })}
              onAcknowledge={() => patchAlert(alert.id, { status: 'acknowledged' })}
              onResolve={() => patchAlert(alert.id, { status: 'resolved' })}
              onReopen={() => patchAlert(alert.id, { status: 'open' })}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <AlertModal
          alert={modal.alert}
          clients={clients}
          teamMembers={teamMembers}
          onSave={async (data) => {
            if (modal.alert?.id) {
              await patchAlert(modal.alert.id, data)
            } else {
              await createAlert(data)
            }
          }}
          onDelete={modal.alert?.id ? async () => deleteAlert(modal.alert!.id) : undefined}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  )
}

function AlertRow({ alert, onEdit, onAcknowledge, onResolve, onReopen }: {
  alert: AlertRecord
  onEdit: () => void
  onAcknowledge: () => void
  onResolve: () => void
  onReopen: () => void
}) {
  const statusStyle = STATUS_STYLES[alert.status]

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-lg transition-all group"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${SEVERITY_COLORS[alert.severity] ?? '#6b7280'}`,
      }}
    >
      {/* Severity badge */}
      <span
        className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 mt-0.5"
        style={{ background: SEVERITY_BG[alert.severity], color: SEVERITY_COLORS[alert.severity] }}
      >
        {alert.severity}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={onEdit}
            className="text-sm font-medium text-left hover:underline"
            style={{ color: 'var(--text-1)' }}
          >
            {alert.title}
          </button>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
            style={{ background: 'var(--bg-subtle)', color: statusStyle.color }}
          >
            {statusStyle.label}
          </span>
        </div>

        {alert.description && (
          <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-3)' }}>{alert.description}</p>
        )}

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {alert.clients && (
            <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
              {alert.clients.company_name}
            </span>
          )}
          <span className="text-[11px]" style={{ color: 'var(--text-4)' }}>
            {formatDate(alert.created_at)}
          </span>
          {alert.source_type && alert.source_type !== 'manual' && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-4)' }}
            >
              {alert.source_type}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {alert.status === 'open' && (
          <ActionBtn onClick={onAcknowledge} label="Acknowledge" color="#f59e0b" />
        )}
        {alert.status !== 'resolved' && (
          <ActionBtn onClick={onResolve} label="Resolve" color="#22c55e" />
        )}
        {alert.status === 'resolved' && (
          <ActionBtn onClick={onReopen} label="Reopen" color="var(--text-3)" />
        )}
        <ActionBtn onClick={onEdit} label="Edit" color="var(--text-3)" />
      </div>
    </div>
  )
}

function ActionBtn({ onClick, label, color }: { onClick: () => void; label: string; color: string }) {
  return (
    <button
      onClick={onClick}
      className="text-[11px] px-2 py-1 rounded transition-colors"
      style={{ color, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
    >
      {label}
    </button>
  )
}
