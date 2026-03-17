'use client'

import { useState, useEffect, useCallback } from 'react'

interface UserRecord {
  id: string
  full_name: string | null
  email: string
  role: string
  allowed_tools: string[]
  client_access: 'all' | 'specific'
  allowed_clients: string[]
  allowed_menus: string[]
}

interface ClientRecord {
  id: string
  slug: string
  company_name: string
}

const ALL_TOOLS = [
  { id: 'build_icp',          label: 'ICP Research',       section: 'Research' },
  { id: 'generate_ads',       label: 'Ad Generator',       section: 'Ads' },
  { id: 'ad_angle_generator', label: 'Ad Angle Generator', section: 'Ads' },
  { id: 'competitor_intel',   label: 'Competitor Intel',   section: 'Research' },
  { id: 'seo_audit',          label: 'SEO Audit',          section: 'SEO' },
  { id: 'keyword_clusters',   label: 'Keyword Clusters',   section: 'SEO' },
  { id: 'report_builder',     label: 'Report Builder',     section: 'Reports' },
  { id: 'brand_voice',        label: 'Brand Voice',        section: 'Brand' },
]

const ALL_MENUS = [
  { id: 'research', label: 'Research',  icon: '🔬' },
  { id: 'ads',      label: 'Ads',       icon: '⚡' },
  { id: 'seo',      label: 'SEO',       icon: '📈' },
  { id: 'reports',  label: 'Reports',   icon: '📊' },
  { id: 'brand',    label: 'Brand',     icon: '🎨' },
]

export default function PermissionsPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [allowedTools, setAllowedTools] = useState<string[]>([])
  const [allowedMenus, setAllowedMenus] = useState<string[]>([])
  const [clientAccess, setClientAccess] = useState<'all' | 'specific'>('all')
  const [allowedClients, setAllowedClients] = useState<string[]>([])

  const loadData = useCallback(async () => {
    const [usersRes, clientsRes] = await Promise.all([
      fetch('/api/settings/users'),
      fetch('/api/clients'),
    ])
    const usersData = await usersRes.json()
    const clientsData = await clientsRes.json()
    setUsers(usersData.users ?? [])
    setClients(clientsData.clients ?? [])
    if (usersData.users?.length > 0) {
      const first = usersData.users[0]
      setSelectedUserId(first.id)
      setAllowedTools(first.allowed_tools ?? [])
      setAllowedMenus(first.allowed_menus ?? [])
      setClientAccess(first.client_access ?? 'all')
      setAllowedClients(first.allowed_clients ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  function selectUser(userId: string) {
    const user = users.find(u => u.id === userId)
    if (!user) return
    setSelectedUserId(userId)
    setAllowedTools(user.allowed_tools ?? [])
    setAllowedMenus(user.allowed_menus ?? [])
    setClientAccess(user.client_access ?? 'all')
    setAllowedClients(user.allowed_clients ?? [])
  }

  function toggleTool(id: string) {
    setAllowedTools(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
  }
  function toggleMenu(id: string) {
    setAllowedMenus(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])
  }
  function toggleClient(id: string) {
    setAllowedClients(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  async function handleSave() {
    if (!selectedUserId) return
    setSaving(true)
    setSaved(false)
    await fetch(`/api/settings/users/${selectedUserId}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowed_tools: allowedTools, allowed_menus: allowedMenus, client_access: clientAccess, allowed_clients: allowedClients }),
    })
    setUsers(prev => prev.map(u =>
      u.id === selectedUserId
        ? { ...u, allowed_tools: allowedTools, allowed_menus: allowedMenus, client_access: clientAccess, allowed_clients: allowedClients }
        : u
    ))
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const selectedUser = users.find(u => u.id === selectedUserId)
  const restrictTools = allowedTools.length > 0
  const restrictMenus = allowedMenus.length > 0

  if (loading) return <Skeleton />

  return (
    <div className="p-8 max-w-2xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>Permissions</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
          Control what each team member can access. Admins always have full access.
        </p>
      </div>

      {/* User selector */}
      <div className="mb-6">
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Team Member</label>
        <select
          value={selectedUserId}
          onChange={e => selectUser(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
          style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.full_name || u.email} — {u.role}
            </option>
          ))}
          {users.length === 0 && <option disabled>No users yet</option>}
        </select>
      </div>

      {selectedUser && (
        <div className="space-y-6">

          {/* Menu Access */}
          <Section title="Menu Access" description="Which sidebar tabs this user can see (Overview always visible).">
            <div className="flex items-center gap-2 mb-4">
              <Toggle
                checked={restrictMenus}
                onChange={() => setAllowedMenus(restrictMenus ? [] : ALL_MENUS.map(m => m.id))}
              />
              <span className="text-xs" style={{ color: 'var(--text-2)' }}>
                {restrictMenus ? 'Restricting to selected menus' : 'All menus visible'}
              </span>
            </div>
            {restrictMenus && (
              <div className="grid grid-cols-2 gap-2">
                {ALL_MENUS.map(menu => (
                  <CheckItem
                    key={menu.id}
                    checked={allowedMenus.includes(menu.id)}
                    onChange={() => toggleMenu(menu.id)}
                    label={`${menu.icon}  ${menu.label}`}
                  />
                ))}
              </div>
            )}
          </Section>

          {/* Tool Access */}
          <Section title="Tool Access" description="Which AI tools this user can run.">
            <div className="flex items-center gap-2 mb-4">
              <Toggle
                checked={restrictTools}
                onChange={() => setAllowedTools(restrictTools ? [] : ALL_TOOLS.map(t => t.id))}
              />
              <span className="text-xs" style={{ color: 'var(--text-2)' }}>
                {restrictTools ? 'Restricting to selected tools' : 'All tools allowed'}
              </span>
            </div>
            {restrictTools && (
              <div className="grid grid-cols-2 gap-2">
                {ALL_TOOLS.map(tool => (
                  <CheckItem
                    key={tool.id}
                    checked={allowedTools.includes(tool.id)}
                    onChange={() => toggleTool(tool.id)}
                    label={tool.label}
                    badge={tool.section}
                  />
                ))}
              </div>
            )}
          </Section>

          {/* Client Access */}
          <Section title="Client Access" description="Which clients this user can view and work on.">
            <div className="flex gap-2 mb-3">
              {(['all', 'specific'] as const).map(opt => (
                <button
                  key={opt}
                  onClick={() => setClientAccess(opt)}
                  className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: clientAccess === opt ? 'var(--text-1)' : 'var(--bg-subtle)',
                    color: clientAccess === opt ? 'var(--bg)' : 'var(--text-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {opt === 'all' ? 'All Clients' : 'Specific Clients'}
                </button>
              ))}
            </div>
            {clientAccess === 'specific' && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {clients.map(client => (
                  <CheckItem
                    key={client.id}
                    checked={allowedClients.includes(client.id)}
                    onChange={() => toggleClient(client.id)}
                    label={client.company_name}
                  />
                ))}
                {clients.length === 0 && (
                  <p className="col-span-2 text-xs" style={{ color: 'var(--text-3)' }}>No clients found.</p>
                )}
              </div>
            )}
          </Section>

          {/* Preview As User */}
          <Section title="Preview As User" description="See the platform exactly as this user sees it.">
            <PreviewButton userId={selectedUserId} userName={selectedUser.full_name || selectedUser.email} />
          </Section>

          <div className="flex items-center gap-3 pt-2">
            <SaveButton saving={saving} onSave={handleSave} />
            {saved && <span className="text-xs font-medium" style={{ color: '#22c55e' }}>✓ Saved</span>}
          </div>
        </div>
      )}

      {users.length === 0 && (
        <div className="rounded-xl p-8 text-center" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            No users yet. Go to{' '}
            <a href="/settings/users" style={{ color: 'var(--text-1)', textDecoration: 'underline' }}>
              Users
            </a>{' '}
            to invite team members.
          </p>
        </div>
      )}
    </div>
  )
}

/* ── Sub-components ───────────────────────────────────────────────────── */

function CheckItem({ checked, onChange, label, badge }: {
  checked: boolean
  onChange: () => void
  label: string
  badge?: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <label
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer"
      style={{
        background: checked || hovered ? 'var(--bg-hover)' : 'var(--bg-subtle)',
        border: `1px solid ${checked ? 'var(--border)' : 'var(--border-dim)'}`,
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-3.5 h-3.5 rounded shrink-0"
        style={{ accentColor: 'var(--text-1)' }}
      />
      <span className="text-xs flex-1" style={{ color: 'var(--text-1)' }}>{label}</span>
      {badge && (
        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg)', color: 'var(--text-3)', border: '1px solid var(--border-dim)' }}>
          {badge}
        </span>
      )}
    </label>
  )
}

function PreviewButton({ userId, userName }: { userId: string; userName: string }) {
  const [loading, setLoading] = useState(false)
  const [hovered, setHovered] = useState(false)

  async function handlePreview() {
    setLoading(true)
    await fetch('/api/settings/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    })
    window.location.href = '/'
  }

  return (
    <button
      onClick={handlePreview}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium disabled:opacity-50"
      style={{
        border: '1px solid var(--border)',
        color: hovered ? 'var(--text-1)' : 'var(--text-2)',
        background: hovered ? 'var(--bg-hover)' : 'var(--bg-subtle)',
        transition: 'background-color 0.15s ease, color 0.15s ease',
      }}
    >
      <EyeIcon />
      {loading ? 'Starting preview…' : `Preview as ${userName}`}
    </button>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative w-9 h-5 rounded-full shrink-0 cursor-pointer"
      style={{
        background: checked ? 'var(--text-1)' : 'var(--bg-hover)',
        border: '1px solid var(--border)',
        transition: 'background-color 0.2s ease',
      }}
    >
      <span
        className="absolute top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full shadow-sm"
        style={{
          background: checked ? 'var(--bg)' : 'var(--text-3)',
          left: checked ? 'calc(100% - 16px)' : '2px',
          transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease',
        }}
      />
    </button>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>{title}</h2>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>{description}</p>}
      </div>
      <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {children}
      </div>
    </section>
  )
}

function ClientAccessButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="px-4 py-2 rounded-lg text-xs font-medium"
      style={{
        background: active ? 'var(--text-1)' : hovered ? 'var(--bg-hover)' : 'var(--bg-subtle)',
        color: active ? 'var(--bg)' : hovered ? 'var(--text-1)' : 'var(--text-2)',
        border: '1px solid var(--border)',
        transition: 'background-color 0.15s ease, color 0.15s ease',
      }}
    >
      {label}
    </button>
  )
}

function SaveButton({ saving, onSave }: { saving: boolean; onSave: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onSave}
      disabled={saving}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
      style={{
        background: 'var(--accent)',
        color: 'var(--accent-fg)',
        opacity: hovered && !saving ? 0.85 : 1,
        transition: 'opacity 0.15s ease, transform 0.1s ease',
      }}
    >
      {saving ? 'Saving…' : 'Save Permissions'}
    </button>
  )
}

function EyeIcon() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/></svg>
}

function Skeleton() {
  return (
    <div className="p-8 max-w-2xl space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: 'var(--bg-subtle)' }} />
      ))}
    </div>
  )
}
