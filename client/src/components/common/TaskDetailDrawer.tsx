import React, { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge, PriorityIcon } from '@/components/common/StatusAndPriority'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useAppStore } from '@/store/useAppStore'
import { TaskPriority, TaskStatus } from '@/types'
import {
  Calendar,
  CheckSquare,
  Clock,
  Copy,
  FolderKanban,
  MessageSquare,
  Paperclip,
  Share2,
  Trash2,
  X
} from 'lucide-react'
import { toast } from 'sonner'

export const TaskDetailDrawer: React.FC = () => {
  const {
    tasks,
    selectedTaskId,
    setSelectedTaskId,
    taskDetailDrawerOpen,
    setTaskDetailDrawerOpen,
    projects,
    members,
    updateTask,
    updateTaskStatus,
    updateTaskPriority,
    toggleSubtask,
    addComment,
    deleteTask
  } = useAppStore()

  const [newComment, setNewComment] = useState('')
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')

  const task = tasks.find(t => t.id === selectedTaskId)
  const project = projects.find(p => p.id === task?.projectId)
  const assignees = members.filter(m => task?.assigneeIds.includes(m.id))

  if (!task) return null

  const handleTitleSubmit = () => {
    if (editedTitle.trim()) {
      updateTask(task.id, { title: editedTitle.trim() })
    }
    setIsEditingTitle(false)
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    addComment(task.id, newComment.trim())
    setNewComment('')
    toast.success('Comment posted')
  }

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return
    const updatedSubtasks = [
      ...task.subtasks,
      { id: `st-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false }
    ]
    updateTask(task.id, { subtasks: updatedSubtasks })
    setNewSubtaskTitle('')
  }

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href)
    toast.success(`Task link for ${task.identifier} copied!`)
  }

  return (
    <Sheet
      open={taskDetailDrawerOpen}
      onOpenChange={(open) => {
        setTaskDetailDrawerOpen(open)
        if (!open) setSelectedTaskId(null)
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col bg-background border-l border-border h-full overflow-hidden"
      >
        {/* Header toolbar */}
        <SheetHeader className="px-5 py-3 border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
              {task.identifier}
            </span>
            <span className="text-xs text-muted-foreground">in</span>
            <span className="text-xs font-medium text-foreground truncate max-w-[150px]">
              {project?.name}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleCopyLink}
              title="Copy task link"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                deleteTask(task.id)
                toast.success(`Deleted ${task.identifier}`)
              }}
              title="Delete task"
              className="h-7 w-7 text-muted-foreground hover:text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                setTaskDetailDrawerOpen(false)
                setSelectedTaskId(null)
              }}
              className="h-7 w-7"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Title Area */}
          <div>
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="h-8 text-base font-semibold"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSubmit()
                    if (e.key === 'Escape') setIsEditingTitle(false)
                  }}
                />
                <Button size="xs" onClick={handleTitleSubmit}>Save</Button>
              </div>
            ) : (
              <h2
                onClick={() => {
                  setEditedTitle(task.title)
                  setIsEditingTitle(true)
                }}
                className="text-base font-semibold tracking-tight text-foreground hover:bg-muted/50 p-1 -m-1 rounded cursor-pointer transition-colors"
                title="Click to inline edit title"
              >
                {task.title}
              </h2>
            )}
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs bg-muted/30 p-3.5 rounded-lg border border-border">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Status
              </span>
              <select
                value={task.status}
                onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                className="h-6 text-[11px] font-medium rounded border border-border bg-background px-1.5 cursor-pointer"
              >
                <option value="Backlog">Backlog</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                Priority
              </span>
              <select
                value={task.priority}
                onChange={(e) => updateTaskPriority(task.id, e.target.value as TaskPriority)}
                className="h-6 text-[11px] font-medium rounded border border-border bg-background px-1.5 cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Assignees */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                Assignee
              </span>
              <div className="flex items-center gap-1.5">
                {assignees.map(a => (
                  <UserAvatar key={a.id} user={a} size="xs" />
                ))}
                <span className="text-foreground font-medium truncate max-w-[90px]">
                  {assignees[0]?.name || 'Unassigned'}
                </span>
              </div>
            </div>

            {/* Due date */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Due Date
              </span>
              <span className="font-mono text-foreground font-medium">
                {task.dueDate}
              </span>
            </div>

            {/* Effort */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Estimated Effort</span>
              <span className="font-mono text-foreground font-medium">{task.estimatedEffort || 'None'}</span>
            </div>

            {/* Project code */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Project Key</span>
              <span className="font-mono text-foreground font-medium">{project?.identifier}</span>
            </div>
          </div>

          {/* Labels */}
          <div>
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Labels
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {task.labels.map(l => (
                <span key={l} className="px-2 py-0.5 rounded text-[11px] font-medium bg-secondary text-secondary-foreground border border-border">
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Description
            </h4>
            <Textarea
              value={task.description}
              onChange={(e) => updateTask(task.id, { description: e.target.value })}
              className="text-xs leading-relaxed min-h-[90px] resize-none"
              placeholder="Task technical specifications and QA scope..."
            />
          </div>

          {/* Subtasks checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" /> Subtasks (
                {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})
              </h4>
            </div>

            <div className="space-y-1.5">
              {task.subtasks.map(st => (
                <div
                  key={st.id}
                  onClick={() => toggleSubtask(task.id, st.id)}
                  className="flex items-center gap-2 p-2 rounded border border-border/80 hover:bg-muted/50 cursor-pointer text-xs transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => {}}
                    className="rounded border-border text-[#086F83] focus:ring-0 cursor-pointer"
                  />
                  <span className={st.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>
                    {st.title}
                  </span>
                </div>
              ))}

              <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
                <Input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a new checklist subtask..."
                  className="h-7 text-xs"
                />
                <Button type="submit" size="xs" variant="outline">
                  Add
                </Button>
              </form>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5" /> Attachments ({task.attachments.length})
            </h4>

            <div className="space-y-1.5">
              {task.attachments.map(att => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2 rounded border border-border bg-muted/20 text-xs"
                >
                  <span className="font-mono text-foreground truncate max-w-[280px]">
                    {att.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {(att.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              ))}
              {task.attachments.length === 0 && (
                <p className="py-2 text-xs text-muted-foreground">No attachments.</p>
              )}
            </div>
          </div>

          {/* Activity / Comments */}
          <div>
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Discussion ({task.comments.length})
            </h4>

            <div className="space-y-3 mb-3">
              {task.comments.map(c => {
                const author = members.find(m => m.id === c.authorId)
                return (
                  <div key={c.id} className="flex gap-2.5 text-xs">
                    <UserAvatar user={author} size="xs" />
                    <div className="flex-1 bg-muted/40 p-2.5 rounded-lg border border-border/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-foreground text-[11px]">
                          {author?.name || 'Team Member'}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {c.createdAt.slice(0, 10)}
                        </span>
                      </div>
                      <p className="text-foreground/90 leading-relaxed text-xs">
                        {c.content}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a message or update..."
                className="h-8 text-xs flex-1"
              />
              <Button type="submit" size="xs" className="bg-[#086F83] hover:bg-[#075B6C] text-white">
                Send
              </Button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
