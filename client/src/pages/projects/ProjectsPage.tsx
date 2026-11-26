import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { StatusBadge } from '@/components/common/StatusAndPriority'
import { UserAvatar, AvatarGroup } from '@/components/common/UserAvatar'
import { ProjectStatus } from '@/types'
import {
  FolderKanban,
  Plus,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Star,
  Archive,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { ProjectCreateDialog } from '@/components/common/AppModals'
import { toast } from 'sonner'

export const ProjectsPage: React.FC = () => {
  const {
    projects,
    tasks,
    members,
    setSelectedProjectId,
    toggleFavoriteProject,
    archiveProject,
    restoreProject,
    deleteProject
  } = useAppStore()

  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showArchived, setShowArchived] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Filter projects
  const filteredProjects = projects.filter(p => {
    if (showArchived) {
      if (!p.isArchived) return false
    } else {
      if (p.isArchived) return false
    }

    if (statusFilter !== 'all' && p.status !== statusFilter) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        p.name.toLowerCase().includes(q) ||
        p.identifier.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-foreground font-medium">Projects Directory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading flex items-center gap-2.5">
            <span>Projects</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
              {filteredProjects.length}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className={`h-8 text-xs ${showArchived ? 'bg-secondary font-semibold' : ''}`}
          >
            <Archive className="w-3.5 h-3.5 mr-1" />
            {showArchived ? 'Show Active' : 'View Archived'}
          </Button>

          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="h-8 text-xs font-medium bg-[#086F83] hover:bg-[#075B6C] text-white"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Create Project
          </Button>
        </div>
      </div>

      {/* Filter and View Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name or key..."
              className="h-8 text-xs pl-8"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 text-xs rounded-md border border-input bg-background px-2"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Track">On Track</option>
            <option value="At Risk">At Risk</option>
            <option value="Delayed">Delayed</option>
            <option value="Planning">Planning</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-md border border-border shrink-0">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'table' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
            }`}
            title="List Table View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'grid' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
            }`}
            title="Compact Cards View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-4 font-semibold">Project & Key</th>
                  <th className="py-2.5 px-3 font-semibold">Lead</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Progress</th>
                  <th className="py-2.5 px-3 font-semibold">Active Tasks</th>
                  <th className="py-2.5 px-3 font-semibold">Deadline</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No matching projects found.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((p) => {
                    const lead = members.find(m => m.id === p.leadId)
                    const projectTasks = tasks.filter(t => t.projectId === p.id)
                    const activeCount = projectTasks.filter(t => t.status !== 'Done').length

                    return (
                      <tr
                        key={p.id}
                        onClick={() => {
                          setSelectedProjectId(p.id)
                          navigate(`/app/projects/${p.id}`)
                        }}
                        className="hover:bg-muted/40 cursor-pointer transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavoriteProject(p.id)
                              }}
                              className="text-muted-foreground hover:text-amber-500"
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  p.isFavorite ? 'text-amber-500 fill-amber-500' : ''
                                }`}
                              />
                            </button>
                            <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                              {p.identifier}
                            </span>
                            <div>
                              <div className="font-semibold text-foreground group-hover:text-[#086F83] dark:group-hover:text-[#55B6C7] transition-colors">
                                {p.name}
                              </div>
                              <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-[280px]">
                                {p.description}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          {lead ? (
                            <div className="flex items-center gap-1.5">
                              <UserAvatar user={lead} size="xs" />
                              <span className="text-foreground truncate max-w-[120px] font-medium">
                                {lead.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <StatusBadge status={p.status} />
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2 max-w-[120px]">
                            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#086F83] dark:bg-[#55B6C7] h-full rounded-full"
                                style={{ width: `${p.progress}%` }}
                              />
                            </div>
                            <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                              {p.progress}%
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-muted-foreground">
                          {activeCount} active / {projectTasks.length}
                        </td>

                        <td className="py-3 px-3 font-mono text-muted-foreground">
                          {p.deadline}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            {p.isArchived ? (
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => {
                                  restoreProject(p.id)
                                  toast.success(`Restored ${p.name}`)
                                }}
                              >
                                Restore
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => {
                                  archiveProject(p.id)
                                  toast.info(`Archived ${p.name}`)
                                }}
                                title="Archive project"
                              >
                                <Archive className="w-3.5 h-3.5 text-muted-foreground" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => {
                                if (confirm(`Are you sure you want to permanently delete project "${p.name}"?`)) {
                                  deleteProject(p.id)
                                  toast.success(`Deleted ${p.name}`)
                                }
                              }}
                              className="text-muted-foreground hover:text-red-600"
                              title="Delete project"
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
      ) : (
        /* Compact Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((p) => {
            const lead = members.find(m => m.id === p.leadId)
            const projectTasks = tasks.filter(t => t.projectId === p.id)

            return (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProjectId(p.id)
                  navigate(`/app/projects/${p.id}`)
                }}
                className="p-4 rounded-lg border border-border bg-surface hover:border-[#086F83]/50 cursor-pointer transition-all shadow-xs flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                        {p.identifier}
                      </span>
                      <StatusBadge status={p.status} />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavoriteProject(p.id)
                      }}
                      className="text-muted-foreground hover:text-amber-500"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          p.isFavorite ? 'text-amber-500 fill-amber-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <h3 className="font-semibold text-foreground text-sm group-hover:text-[#086F83] dark:group-hover:text-[#55B6C7] transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/80">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-mono font-semibold">{p.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#086F83] dark:bg-[#55B6C7] h-full rounded-full"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      {lead && <UserAvatar user={lead} size="xs" />}
                      <span className="text-muted-foreground text-[11px]">{lead?.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      Due {p.deadline}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Creation Modal */}
      <ProjectCreateDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  )
}
