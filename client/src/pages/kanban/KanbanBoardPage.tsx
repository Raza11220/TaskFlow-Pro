import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { StatusBadge, PriorityIcon } from '@/components/common/StatusAndPriority'
import { UserAvatar } from '@/components/common/UserAvatar'
import { Task, TaskStatus } from '@/types'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TaskCreateDialog } from '@/components/common/AppModals'
import { toast } from 'sonner'

// Kanban Columns with Distinct Colored Pills & Indicators
const COLUMNS: {
  id: TaskStatus
  title: string
  pillBg: string
  textColor: string
  dotColor: string
  borderAccent: string
}[] = [
  {
    id: 'To Do',
    title: 'To Do',
    pillBg: 'bg-slate-500/10 dark:bg-slate-500/20',
    textColor: 'text-slate-700 dark:text-slate-300',
    dotColor: 'bg-slate-400',
    borderAccent: 'hover:border-slate-400/50'
  },
  {
    id: 'In Progress',
    title: 'In Progress',
    pillBg: 'bg-sky-500/10 dark:bg-sky-500/20',
    textColor: 'text-sky-700 dark:text-sky-400',
    dotColor: 'bg-[#0284C7]',
    borderAccent: 'hover:border-sky-500/50'
  },
  {
    id: 'Review',
    title: 'In Review',
    pillBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    textColor: 'text-purple-700 dark:text-purple-400',
    dotColor: 'bg-purple-500',
    borderAccent: 'hover:border-purple-500/50'
  },
  {
    id: 'Done',
    title: 'Completed',
    pillBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    dotColor: 'bg-emerald-500',
    borderAccent: 'hover:border-emerald-500/50'
  }
]

// Enhanced Draggable Task Card with Ambient Glow & Micro-interactions
const KanbanTaskCard: React.FC<{ task: Task; isOverlay?: boolean }> = ({
  task,
  isOverlay = false
}) => {
  const { setSelectedTaskId, projects, members } = useAppStore()
  const project = projects.find(p => p.id === task.projectId)
  const assignees = members.filter(m => task.assigneeIds.includes(m.id))

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setSelectedTaskId(task.id)}
      className={`p-3.5 rounded-xl border border-border/80 bg-surface hover:border-[#0284C7]/50 cursor-grab active:cursor-grabbing transition-all duration-200 select-none space-y-2.5 group relative shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${
        isOverlay ? 'shadow-xl border-[#0284C7] ring-2 ring-[#0284C7]/20 scale-105' : ''
      }`}
    >
      {/* Top Header: ID & Priority */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/80 group-hover:text-foreground transition-colors">
            {task.identifier}
          </span>
          {project && (
            <span className="text-[10px] font-medium text-muted-foreground/80 truncate max-w-[90px]">
              {project.identifier}
            </span>
          )}
        </div>
        <PriorityIcon priority={task.priority} />
      </div>

      {/* Title */}
      <h4 className="text-xs font-semibold text-foreground line-clamp-2 leading-relaxed group-hover:text-[#0284C7] dark:group-hover:text-[#38BDF8] transition-colors">
        {task.title}
      </h4>

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.slice(0, 2).map(l => (
            <span
              key={l}
              className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-secondary/80 text-secondary-foreground border border-border/60"
            >
              {l}
            </span>
          ))}
        </div>
      )}

      {/* Card Footer: Due Date, Counts, & Assignee */}
      <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1 text-[10px] font-mono font-medium">
          <Calendar className="w-3 h-3 text-muted-foreground" />
          <span>{task.dueDate}</span>
        </div>

        <div className="flex items-center gap-2">
          {task.comments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <MessageSquare className="w-2.5 h-2.5" />
              {task.comments.length}
            </span>
          )}
          {task.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Paperclip className="w-2.5 h-2.5" />
              {task.attachments.length}
            </span>
          )}
          {assignees[0] && (
            <div className="ring-2 ring-background rounded-full">
              <UserAvatar user={assignees[0]} size="xs" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const KanbanBoardPage: React.FC = () => {
  const { tasks, projects, updateTaskStatus } = useAppStore()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createColumnStatus, setCreateColumnStatus] = useState<TaskStatus>('To Do')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const filteredTasks = tasks.filter(t => {
    if (selectedProjectId !== 'all' && t.projectId !== selectedProjectId) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        t.title.toLowerCase().includes(q) ||
        t.identifier.toLowerCase().includes(q) ||
        t.labels.some(l => l.toLowerCase().includes(q))
      )
    }
    return true
  })

  const handleDragStart = (event: DragStartEvent) => {
    const t = tasks.find(item => item.id === event.active.id)
    if (t) setActiveTask(t)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const taskId = String(active.id)
    const overId = String(over.id)

    const columnMatch = COLUMNS.find(c => c.id === overId)
    if (columnMatch) {
      updateTaskStatus(taskId, columnMatch.id)
      return
    }

    const targetTask = tasks.find(t => t.id === overId)
    if (targetTask && targetTask.status) {
      updateTaskStatus(taskId, targetTask.status)
    }
  }

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-8 max-w-full overflow-hidden h-full">
      {/* Page Header Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 font-mono">
            <span>WORKSPACE</span>
            <span>/</span>
            <span className="text-[#0284C7] font-bold">KANBAN SPRINT BOARD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading flex items-center gap-2.5">
            <span>Kanban Board</span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-[#0284C7] border border-sky-500/20">
              {filteredTasks.length} Cards
            </span>
          </h1>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="relative w-52">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cards, tags..."
              className="h-8.5 text-xs pl-8.5 rounded-xl border-border bg-surface"
            />
          </div>

          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="h-8.5 text-xs font-semibold rounded-xl border border-input bg-surface px-3 outline-none shadow-2xs"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                [{p.identifier}] {p.name}
              </option>
            ))}
          </select>

          <Button
            size="sm"
            onClick={() => {
              setCreateColumnStatus('To Do')
              setCreateDialogOpen(true)
            }}
            className="h-8.5 px-3.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#0284C7] to-indigo-600 hover:from-[#0369A1] hover:to-indigo-700 text-white shadow-md shadow-sky-500/20"
          >
            <Plus className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
            New Item
          </Button>
        </div>
      </div>

      {/* Dnd-Kit Kanban Columns Area */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-5 overflow-x-auto pt-5 pb-3 items-start custom-scroll">
          {COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter(t => t.status === col.id)

            return (
              <div
                key={col.id}
                id={col.id}
                className={`w-[310px] shrink-0 bg-surface rounded-2xl border border-border/80 shadow-xs flex flex-col max-h-full overflow-hidden transition-colors ${col.borderAccent}`}
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-border/60 flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor} shadow-xs`} />
                    <span className={`font-heading font-extrabold text-xs uppercase tracking-wider ${col.textColor}`}>
                      {col.title}
                    </span>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.2 rounded-full bg-background border border-border text-foreground shadow-2xs">
                      {columnTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setCreateColumnStatus(col.id)
                      setCreateDialogOpen(true)
                    }}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title={`Add task to ${col.title}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Column Cards Container */}
                <div className="flex-1 p-3 space-y-2.5 overflow-y-auto min-h-[350px] custom-scroll">
                  <SortableContext
                    items={columnTasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {columnTasks.map((task) => (
                      <KanbanTaskCard key={task.id} task={task} />
                    ))}
                  </SortableContext>
                </div>
              </div>
            )
          })}
        </div>

        <DragOverlay>
          {activeTask ? <KanbanTaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      <TaskCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultStatus={createColumnStatus}
        defaultProjectId={selectedProjectId !== 'all' ? selectedProjectId : undefined}
      />
    </div>
  )
}
