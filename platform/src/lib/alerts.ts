import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Auto-detect system alerts based on current DB state.
 * Called on dashboard load. Creates alerts if they don't already exist
 * (deduplicated by source_type + source_id).
 */
export async function detectAndSyncAlerts(supabase: SupabaseClient) {
  try {
    // 1. Overdue tasks
    const { data: overdueTasks } = await supabase
      .from('tasks')
      .select('id, title, client_id')
      .lt('due_date', new Date().toISOString().split('T')[0])
      .not('status', 'eq', 'done')
      .not('status', 'eq', 'review')

    // 2. Clients with no KPI entry in 30+ days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { data: activeClients } = await supabase
      .from('clients')
      .select('id, company_name')
      .eq('status', 'active')

    const { data: recentKpis } = await supabase
      .from('kpi_snapshots')
      .select('client_id')
      .gte('period', thirtyDaysAgo.toISOString().split('T')[0])

    const clientsWithRecentKpis = new Set((recentKpis ?? []).map((k) => k.client_id))
    const staleKpiClients = (activeClients ?? []).filter((c) => !clientsWithRecentKpis.has(c.id))

    // 3. Clients with no workflow run in 30 days
    const { data: recentRuns } = await supabase
      .from('workflow_runs')
      .select('client_id')
      .gte('started_at', thirtyDaysAgo.toISOString())
      .eq('status', 'completed')

    const clientsWithRecentRuns = new Set((recentRuns ?? []).map((r) => r.client_id))
    const inactiveClients = (activeClients ?? []).filter((c) => !clientsWithRecentRuns.has(c.id))

    // Fetch existing system alerts to avoid duplicates
    const { data: existingAlerts } = await supabase
      .from('alerts')
      .select('source_type, source_id')
      .eq('source_type', 'system')
      .neq('status', 'resolved')

    const existingKeys = new Set(
      (existingAlerts ?? []).map((a) => `${a.source_type}:${a.source_id}`)
    )

    const toInsert: {
      title: string
      description: string
      severity: string
      status: string
      source_type: string
      source_id: string
      client_id?: string
    }[] = []

    // Overdue task alerts
    for (const task of overdueTasks ?? []) {
      const key = `system:overdue-task-${task.id}`
      if (!existingKeys.has(key)) {
        toInsert.push({
          title: `Overdue task: ${task.title}`,
          description: 'This task has passed its due date.',
          severity: 'warning',
          status: 'open',
          source_type: 'system',
          source_id: `overdue-task-${task.id}`,
          client_id: task.client_id ?? undefined,
        })
      }
    }

    // Stale KPI alerts
    for (const client of staleKpiClients) {
      const key = `system:stale-kpi-${client.id}`
      if (!existingKeys.has(key)) {
        toInsert.push({
          title: `No KPI data: ${client.company_name}`,
          description: 'No KPI snapshot has been entered in the last 30 days.',
          severity: 'info',
          status: 'open',
          source_type: 'system',
          source_id: `stale-kpi-${client.id}`,
          client_id: client.id,
        })
      }
    }

    // Inactive client alerts
    for (const client of inactiveClients) {
      const key = `system:inactive-client-${client.id}`
      if (!existingKeys.has(key)) {
        toInsert.push({
          title: `No recent work: ${client.company_name}`,
          description: 'No completed workflow runs for this client in the last 30 days.',
          severity: 'info',
          status: 'open',
          source_type: 'system',
          source_id: `inactive-client-${client.id}`,
          client_id: client.id,
        })
      }
    }

    if (toInsert.length > 0) {
      await supabase.from('alerts').insert(toInsert)
    }
  } catch (err) {
    // Don't throw — alert detection is best-effort
    console.error('[detectAndSyncAlerts]', err)
  }
}
