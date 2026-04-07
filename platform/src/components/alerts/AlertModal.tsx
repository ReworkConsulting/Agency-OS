'use client'

import { useState, useEffect } from 'react'

export type AlertSeverity = 'info' | 'warning' | 'urgent' | 'critical'
export type AlertStatus = 'open' | 'acknowledged' | 'resolved'

export interface AlertRecord {
  id: string
  title: string
  description: string | null
  severity: AlertSeverity
  status: AlertStatus
  source_type: string | null
  source_id: string | null
  client_id: string | null
  assigned_to: string | null
  created_by: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
  clients?: { id: string; slug: string; company_name: string } | null
  assignee?: { id: string; raw_user_meta_data?: { full_name?: string } } | null
}

interface Client { id: string; company_name: string }
interface TeamMember { id: string; full_name: string; email: string }

interface AlertModalProps {
  alert?: AlertRecord | null
  clients: Client[]
  teamMembers: TeamMember[]
  onSave: (data: Partial<AlertRecord>) => Promise<void>
  onDelete?: () => Promise<void>
  onClose: () => void
}

const SEVERITIES: { value: AlertSeverity; label: string; color: string }[] = [
  { value: 'info', label: 'Info', color: '#6b7280' },
  { value: 'warning', label: 'Warning', color: '#f59e0b' },
  { value: 'urgent', label: 'Urgent', color: '#f97316' },
  { value: 'critical', label: 'Critical', color: '#ef4444' },
]

const STATUSES: { value: AlertStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'resolved', label: 'Resolved' },
]

export function AlertModal({ alert, clients, teamMembers, onSave, onDelete, onClose }: AlertModalProps) {
  const [title, setTitle] = useState(alert?.title ?? '')
  const [description, setDescription] = useState(alert?.description ?? '')
  const [severity, setSeverity] = useState<AlertSeverity>(alert?.severity ?? 'warning')
  const [status, setStatus] = useState<AlertStatus>(alert?.status ?? 'open')
  const [clientId, setClientId] = useState(alert?.client_id ?? '')
  const [assignedTo, setAssignedTo] = useState(alert?.assigned_to ?? '')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        description: description || null,
        severity,
        status,
        client_id: clientId || null,
        assigned_to: assignedTo || null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg rounded-xl shadow-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
            {alert ? 'Edit Alert' : 'New Alert'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-3)' }} className="text-lg leading-none">×</button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What is the problem?"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="More context about this problem..."
              rows={3}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AlertSeverity)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
              >
                {SEVERITIES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AlertStatus)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Client</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
              >
                <option value="">No client</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Assign To</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.full_name || m.email}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div>
            {alert && onDelete && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>Delete?</span>
                  <button onClick={async () => { await onDelete(); onClose() }} className="text-xs px-2 py-1 rounded" style={{ background: '#ef4444', color: '#fff' }}>Yes</button>
                  <button onClick={() => setConfirmDelete(false)} className="text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-subtle)', color: 'var(--text-2)' }}>No</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="text-xs px-2 py-1 rounded" style={{ color: '#ef4444' }}>Delete</button>
              )
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-sm" style={{ background: 'var(--bg-subtle)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>Cancel</button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              className="px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40"
              style={{ background: 'var(--text-1)', color: 'var(--bg)' }}
            >
              {saving ? 'Saving…' : alert ? 'Save' : 'Create Alert'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const SEVERITY_COLORS: Record<string, string> = {
  info: '#6b7280',
  warning: '#f59e0b',
  urgent: '#f97316',
  critical: '#ef4444',
}

export const SEVERITY_BG: Record<string, string> = {
  info: 'rgba(107,114,128,0.1)',
  warning: 'rgba(245,158,11,0.1)',
  urgent: 'rgba(249,115,22,0.1)',
  critical: 'rgba(239,68,68,0.1)',
}
