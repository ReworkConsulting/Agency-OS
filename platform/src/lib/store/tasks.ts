import { create } from 'zustand'

export type TaskStatus = 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assigned_to: string | null
  client_id: string | null
  due_date: string | null
  tags: string[]
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined
  clients?: { id: string; slug: string; company_name: string; logo_url: string | null } | null
  assignee?: { id: string; raw_user_meta_data?: { full_name?: string } } | null
}

interface TasksStore {
  tasks: Task[]
  loading: boolean
  setTasks: (tasks: Task[]) => void
  setLoading: (v: boolean) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  removeTask: (id: string) => void
  moveTask: (id: string, newStatus: TaskStatus) => void
}

export const useTasksStore = create<TasksStore>((set) => ({
  tasks: [],
  loading: false,
  setTasks: (tasks) => set({ tasks }),
  setLoading: (loading) => set({ loading }),
  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
  updateTask: (id, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
  // Optimistic move — patch is sent separately by the caller
  moveTask: (id, newStatus) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    })),
}))
