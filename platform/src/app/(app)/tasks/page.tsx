import { createServerClient } from '@/lib/supabase/server'
import { TaskBoard } from '@/components/tasks/TaskBoard'
import { Task } from '@/lib/store/tasks'

async function getTasksData() {
  try {
    const supabase = createServerClient()

    const [tasksRes, clientsRes, usersRes] = await Promise.all([
      supabase
        .from('tasks')
        .select(`
          *,
          clients(id, slug, company_name, logo_url),
          assignee:assigned_to(id, raw_user_meta_data)
        `)
        .neq('status', 'done')
        .order('created_at', { ascending: false }),
      supabase
        .from('clients')
        .select('id, company_name')
        .eq('status', 'active')
        .order('company_name'),
      supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .order('full_name'),
    ])

    return {
      tasks: (tasksRes.data ?? []) as Task[],
      clients: clientsRes.data ?? [],
      teamMembers: (usersRes.data ?? []).map((u) => ({
        id: u.id,
        full_name: u.full_name ?? '',
        email: u.email ?? '',
      })),
    }
  } catch {
    return { tasks: [], clients: [], teamMembers: [] }
  }
}

export default async function TasksPage() {
  const { tasks, clients, teamMembers } = await getTasksData()

  const openCount = tasks.filter((t) => t.status !== 'done').length
  const overdueCount = tasks.filter((t) => {
    if (!t.due_date || t.status === 'done') return false
    return new Date(t.due_date) < new Date(new Date().toDateString())
  }).length

  return (
    <div className="p-8 flex flex-col h-full min-h-screen animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-1)' }}>
              Task Board
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>
              {openCount} open task{openCount !== 1 ? 's' : ''}
              {overdueCount > 0 && (
                <span style={{ color: '#ef4444' }}> · {overdueCount} overdue</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <TaskBoard
          initialTasks={tasks}
          clients={clients}
          teamMembers={teamMembers}
        />
      </div>
    </div>
  )
}
