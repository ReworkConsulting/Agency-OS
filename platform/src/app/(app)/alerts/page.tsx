import { createServerClient } from '@/lib/supabase/server'
import { detectAndSyncAlerts } from '@/lib/alerts'
import { AlertTable } from '@/components/alerts/AlertTable'
import { AlertRecord } from '@/components/alerts/AlertModal'

async function getAlertsData() {
  try {
    const supabase = createServerClient()

    // Run auto-detection (creates new system alerts if needed)
    await detectAndSyncAlerts(supabase)

    const [alertsRes, clientsRes, usersRes] = await Promise.all([
      supabase
        .from('alerts')
        .select(`
          *,
          clients(id, slug, company_name),
          assignee:assigned_to(id, raw_user_meta_data)
        `)
        .order('created_at', { ascending: false }),
      supabase.from('clients').select('id, company_name').eq('status', 'active').order('company_name'),
      supabase.from('user_profiles').select('id, full_name, email').order('full_name'),
    ])

    return {
      alerts: (alertsRes.data ?? []) as AlertRecord[],
      clients: clientsRes.data ?? [],
      teamMembers: (usersRes.data ?? []).map((u) => ({
        id: u.id,
        full_name: u.full_name ?? '',
        email: u.email ?? '',
      })),
    }
  } catch {
    return { alerts: [], clients: [], teamMembers: [] }
  }
}

export default async function AlertsPage() {
  const { alerts, clients, teamMembers } = await getAlertsData()

  const openCount = alerts.filter((a) => a.status === 'open').length
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status !== 'resolved').length

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Alerts</h1>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>
          {openCount} open alert{openCount !== 1 ? 's' : ''}
          {criticalCount > 0 && (
            <span style={{ color: '#ef4444' }}> · {criticalCount} critical</span>
          )}
        </p>
      </div>

      <AlertTable
        initialAlerts={alerts}
        clients={clients}
        teamMembers={teamMembers}
      />
    </div>
  )
}
