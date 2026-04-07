'use client'

import { useEffect, useState, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { useTasksStore, Task, TaskStatus } from '@/lib/store/tasks'
import { TaskCard } from './TaskCard'
import { TaskModal } from './TaskModal'

interface Client { id: string; company_name: string }
interface TeamMember { id: string; full_name: string; email: string }

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
]

interface TaskBoardProps {
  initialTasks: Task[]
  clients: Client[]
  teamMembers: TeamMember[]
}

export function TaskBoard({ initialTasks, clients, teamMembers }: TaskBoardProps) {
  const { tasks, setTasks, moveTask, addTask, updateTask, removeTask } = useTasksStore()
  const [modal, setModal] = useState<{ open: boolean; task?: Task | null }>({ open: false })
  const [flagTarget, setFlagTarget] = useState<Task | null>(null)
  const [filterClient, setFilterClient] = useState('')
  const [filterAssignee, setFilterAssignee] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks, setTasks])

  const visibleTasks = tasks.filter((t) => {
    if (filterClient && t.client_id !== filterClient) return false
    if (filterAssignee && t.assigned_to !== filterAssignee) return false
    if (filterPriority && t.priority !== filterPriority) return false
    return true
  })

  const tasksByColumn = (status: TaskStatus) => visibleTasks.filter((t) => t.status === status)

  const onDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination) return
    const taskId = result.draggableId
    const newStatus = result.destination.droppableId as TaskStatus
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return

    // Optimistic update
    moveTask(taskId, newStatus)

    // Sync to server (fire and forget, no rollback for now)
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
  }, [tasks, moveTask])

  async function handleCreate(data: Partial<Task>) {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const newTask = await res.json()
      addTask(newTask)
    }
  }

  async function handleUpdate(taskId: string, data: Partial<Task>) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const updated = await res.json()
      updateTask(taskId, updated)
    }
  }

  async function handleDelete(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    removeTask(taskId)
  }

  async function handleFlag(task: Task) {
    setFlagTarget(task)
  }

  async function submitFlag(title: string, severity: string) {
    if (!flagTarget) return
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        severity,
        source_type: 'task',
        source_id: flagTarget.id,
        client_id: flagTarget.client_id,
        description: `Flagged from task: ${flagTarget.title}`,
      }),
    })
    setFlagTarget(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Client filter */}
          <FilterSelect value={filterClient} onChange={setFilterClient} placeholder="All clients">
            {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </FilterSelect>
          {/* Assignee filter */}
          <FilterSelect value={filterAssignee} onChange={setFilterAssignee} placeholder="All assignees">
            {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.full_name || m.email}</option>)}
          </FilterSelect>
          {/* Priority filter */}
          <FilterSelect value={filterPriority} onChange={setFilterPriority} placeholder="All priorities">
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </FilterSelect>
          {(filterClient || filterAssignee || filterPriority) && (
            <button
              onClick={() => { setFilterClient(''); setFilterAssignee(''); setFilterPriority('') }}
              className="text-xs px-2 py-1 rounded"
              style={{ color: 'var(--text-3)' }}
            >
              Clear ×
            </button>
          )}
        </div>
        <button
          onClick={() => setModal({ open: true, task: null })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'var(--text-1)', color: 'var(--bg)' }}
        >
          <span className="text-base leading-none">+</span> New Task
        </button>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0">
          {COLUMNS.map((col) => {
            const colTasks = tasksByColumn(col.id)
            return (
              <div key={col.id} className="flex flex-col shrink-0 w-[240px]">
                {/* Column header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-2)' }}>
                      {col.label}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: 'var(--bg-subtle)', color: 'var(--text-3)' }}
                    >
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setModal({ open: true, task: { status: col.id } as Task })}
                    className="text-base leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--text-3)' }}
                    title={`Add to ${col.label}`}
                  >
                    +
                  </button>
                </div>

                {/* Droppable column */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-1 rounded-lg p-2 space-y-2 min-h-[120px] transition-colors"
                      style={{
                        background: snapshot.isDraggingOver ? 'var(--bg-hover)' : 'var(--bg-subtle)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {colTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.85 : 1,
                                transform: snapshot.isDragging
                                  ? `${provided.draggableProps.style?.transform} scale(1.02)`
                                  : provided.draggableProps.style?.transform,
                              }}
                            >
                              <TaskCard
                                task={task}
                                onClick={() => setModal({ open: true, task })}
                                onFlag={() => handleFlag(task)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {/* Task Modal */}
      {modal.open && (
        <TaskModal
          task={modal.task ?? null}
          clients={clients}
          teamMembers={teamMembers}
          onSave={async (data) => {
            if (modal.task?.id) {
              await handleUpdate(modal.task.id, data)
            } else {
              await handleCreate(data)
            }
          }}
          onDelete={modal.task?.id ? async () => { await handleDelete(modal.task!.id) } : undefined}
          onClose={() => setModal({ open: false })}
        />
      )}

      {/* Flag as Problem dialog */}
      {flagTarget && (
        <FlagDialog
          taskTitle={flagTarget.title}
          onSubmit={submitFlag}
          onClose={() => setFlagTarget(null)}
        />
      )}
    </div>
  )
}

function FilterSelect({ value, onChange, placeholder, children }: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg px-2.5 py-1.5 text-xs outline-none"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        color: value ? 'var(--text-1)' : 'var(--text-3)',
      }}
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  )
}

function FlagDialog({ taskTitle, onSubmit, onClose }: {
  taskTitle: string
  onSubmit: (title: string, severity: string) => Promise<void>
  onClose: () => void
}) {
  const [title, setTitle] = useState(`Problem: ${taskTitle}`)
  const [severity, setSeverity] = useState('warning')
  const [saving, setSaving] = useState(false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
    >
      <div
        className="w-full max-w-sm rounded-xl p-6 shadow-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Flag as Problem</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-2)' }}>Alert title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-2)' }}>Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
            >
              <option value="warning">Warning</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-sm" style={{ background: 'var(--bg-subtle)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={async () => {
              setSaving(true)
              await onSubmit(title, severity)
              setSaving(false)
            }}
            className="px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40"
            style={{ background: '#f59e0b', color: '#000' }}
          >
            {saving ? 'Flagging…' : 'Flag Alert'}
          </button>
        </div>
      </div>
    </div>
  )
}
