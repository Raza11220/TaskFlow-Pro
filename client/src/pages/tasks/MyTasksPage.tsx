import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { StatusBadge, PriorityIcon } from '@/components/common/StatusAndPriority'
import { UserAvatar } from '@/components/common/UserAvatar'
import { TaskStatus, TaskPriority } from '@/types'
import {
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Check,
  Eye,
  ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TaskCreateDialog } from '@/components/common/AppModals'
import { toast } from 'sonner'

export const MyTasksPage: React.FC = () => {
  const {
    tasks,
    projects,
    members,
    currentUser,
    setSelectedTaskId,
    updateTaskStatus,
    deleteTask
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<'assigned' | 'created' | 'all' | 'completed'>('assigned')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  // Tab Filter
  const tabFilteredTasks = tasks.filter(t => {
    if (activeTab === 'assigned') {
      return t.assigneeIds.includes(currentUser.id) && t.status !== 'Done'
    }
    if (activeTab === 'created') {
      return t.creatorId === currentUser.id
    }
    if (activeTab === 'completed') {
      return t.status === 'Done'
    }
    return true
  })

  const filteredTasks = tabFilteredTasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTaskIds(filteredTasks.map(t => t.id))
    } else {
      setSelectedTaskIds([])
    }
  }

  const handleToggleSelect = (id: string) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter(item => item !== id))
    } else {
      setSelectedTaskIds([...selectedTaskIds, id])
    }
  }

  const handleBulkStatusChange = (newStatus: TaskStatus) => {
    selectedTaskIds.forEach(id => updateTaskStatus(id, newStatus))
    toast.success(`Updated ${selectedTaskIds.length} tasks to ${newStatus}`)
    setSelectedTaskIds([])
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 font-mono">
            <span>WORKSPACE</span>
            <span>/</span>
            <span className="text-[#0284C7] font-bold">TASK MANAGER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading flex items-center gap-3">
            <span>My Tasks & Backlog</span>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-sky-500/10 text-[#0284C7] border border-sky-500/20">
              {filteredTasks.length} Visible
            </span>
          </h1>
        </div>

        <Button
          size="sm"
          onClick={() => setCreateDialogOpen(true)}
          className="h-9 px-4 text-xs font-bold rounded-xl bg-gradient-to-r from-[#0284C7] to-indigo-600 hover:from-[#0369A1] hover:to-indigo-700 text-white shadow-md shadow-sky-500/20"
        >
          <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          Create Task
        </Button>
      </div>

      {/* Primary Category Tabs */}
      <div className="flex items-center space-x-6 text-xs border-b border-border/80 pb-1 font-heading">
        {[
          { id: 'assigned', label: `Assigned to me (${tasks.filter(t => t.assigneeIds.includes(currentUser.id) && t.status !== 'Done').length})` },
          { id: 'created', label: `Created by me (${tasks.filter(t => t.creatorId === currentUser.id).length})` },
          { id: 'all', label: `All Accessible Tasks (${tasks.length})` },
          { id: 'completed', label: `Completed (${tasks.filter(t => t.status === 'Done').length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any)
              setSelectedTaskIds([])
            }}
            className={`pb-2.5 font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#0284C7] text-[#0284C7] dark:border-[#38BDF8] dark:text-[#38BDF8]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Bulk Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, identifiers, labels..."
              className="h-8.5 text-xs pl-8.5 rounded-xl border-border bg-surface shadow-2xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8.5 text-xs font-semibold rounded-xl border border-input bg-surface px-3 outline-none shadow-2xs"
          >
            <option value="all">All Statuses</option>
            <option value="Backlog">Backlog</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Done">Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-8.5 text-xs font-semibold rounded-xl border border-input bg-surface px-3 outline-none shadow-2xs"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Bulk Action Controls */}
        {selectedTaskIds.length > 0 && (
          <div className="flex items-center gap-2 bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/30">
            <span className="font-bold text-[11px] text-[#0284C7] dark:text-[#38BDF8]">
              {selectedTaskIds.length} Selected:
            </span>
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleBulkStatusChange('Done')}
              className="h-6.5 text-[11px] font-bold bg-surface border-border text-emerald-600"
            >
              Mark Done
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleBulkStatusChange('In Progress')}
              className="h-6.5 text-[11px] font-bold bg-surface border-border text-sky-600"
            >
              Set Active
            </Button>
          </div>
        )}
      </div>

      {/* High-Craft Data Table with Micro-interactions */}
      <div className="rounded-2xl border border-border/80 bg-surface shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/80 bg-muted/30 text-muted-foreground uppercase text-[10px] font-mono tracking-wider">
                <th className="py-3 px-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredTasks.length > 0 &&
                      selectedTaskIds.length === filteredTasks.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-border text-[#0284C7] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3 font-semibold">Key Identifier</th>
                <th className="py-3 px-3 font-semibold">Task Title</th>
                <th className="py-3 px-3 font-semibold">Project</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Priority</th>
                <th className="py-3 px-3 font-semibold">Assignee</th>
                <th className="py-3 px-3 font-semibold">Deadline</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground font-medium">
                    No matching deliverables found.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const prj = projects.find(p => p.id === t.projectId)
                  const assignees = members.filter(m => t.assigneeIds.includes(m.id))
                  const isSelected = selectedTaskIds.includes(t.id)

                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className={`hover:bg-sky-500/5 cursor-pointer transition-colors group ${
                        isSelected ? 'bg-sky-500/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(t.id)}
                          className="rounded border-border text-[#0284C7] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border group-hover:border-[#0284C7]/40 transition-colors">
                          {t.identifier}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-foreground">
                        <div className="flex items-center gap-2 max-w-[360px]">
                          <span className="truncate group-hover:text-[#0284C7] dark:group-hover:text-[#38BDF8] transition-colors">
                            {t.title}
                          </span>
                          {t.labels.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-secondary text-secondary-foreground border border-border shrink-0 hidden md:inline">
                              {t.labels[0]}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-muted-foreground truncate max-w-[130px] font-medium">
                        {prj?.name}
                      </td>

                      <td className="py-3.5 px-3">
                        <StatusBadge status={t.status} />
                      </td>

                      <td className="py-3.5 px-3">
                        <PriorityIcon priority={t.priority} showLabel />
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          {assignees[0] && <UserAvatar user={assignees[0]} size="xs" />}
                          <span className="truncate max-w-[95px] text-muted-foreground font-medium text-[11px]">
                            {assignees[0]?.name || 'Unassigned'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono font-medium text-muted-foreground">
                        {t.dueDate}
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          {t.status !== 'Done' && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => {
                                updateTaskStatus(t.id, 'Done')
                                toast.success(`Marked ${t.identifier} as Done`)
                              }}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-emerald-600 rounded-lg"
                              title="Mark Done"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => {
                              deleteTask(t.id)
                              toast.success(`Deleted ${t.identifier}`)
                            }}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TaskCreateDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  )
}
