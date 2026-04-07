'use client'

import { Task } from '@/lib/store/tasks'

const PRIORITY_COLORS: Record<string, string> = {
  low: '#6b7280',
  normal: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
}

function isOverdue(due_date: string | null) {
  if (!due_date) return false
  return new Date(due_date) < new Date(new Date().toDateString())
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getInitials(task: Task) {
  const name = task.assignee?.raw_user_meta_data?.full_name
  if (!name) return '?'
  return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
}

interface TaskCardProps {
  task: Task
  onClick: () => void
  onFlag: () => void
}

export function TaskCard({ task, onClick, onFlag }: TaskCardProps) {
  const overdue = isOverdue(task.due_date)

  return (
    <div
      onClick={onClick}
      className="rounded-md p-3 cursor-pointer group transition-colors duration-150"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Priority + title */}
      <div className="flex items-start gap-2 mb-2">
        <span
          className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.normal }}
          title={PRIORITY_LABELS[task.priority]}
        />
        <p
          className="text-[13px] font-medium leading-snug line-clamp-2"
          style={{ color: 'var(--text-1)' }}
        >
          {task.title}
        </p>
      </div>

      {/* Client tag */}
      {task.clients && (
        <div className="mb-2">
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-3)', border: '1px solid var(--border)' }}
          >
            {task.clients.company_name}
          </span>
        </div>
      )}

      {/* Footer: assignee + due date + flag */}
      <div className="flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-1.5">
          {task.assigned_to ? (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
              title={task.assignee?.raw_user_meta_data?.full_name ?? 'Assigned'}
            >
              {getInitials(task)}
            </div>
          ) : (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'var(--bg-subtle)', border: '1px dashed var(--border)' }}
              title="Unassigned"
            >
              <span style={{ color: 'var(--text-4)', fontSize: 9 }}>–</span>
            </div>
          )}

          {task.due_date && (
            <span
              className="text-[10px]"
              style={{ color: overdue ? '#ef4444' : 'var(--text-3)' }}
            >
              {overdue ? '⚠ ' : ''}{formatDate(task.due_date)}
            </span>
          )}
        </div>

        {/* Flag button */}
        <button
          onClick={(e) => { e.stopPropagation(); onFlag() }}
          className="opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded text-[10px]"
          style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}
          title="Flag as problem"
        >
          ⚑
        </button>
      </div>
    </div>
  )
}
