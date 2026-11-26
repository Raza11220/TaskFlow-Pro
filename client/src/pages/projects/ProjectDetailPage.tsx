import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { StatusBadge, PriorityIcon } from '@/components/common/StatusAndPriority'
import { UserAvatar, AvatarGroup } from '@/components/common/UserAvatar'
import { ProjectStatus, TaskStatus } from '@/types'
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  FileText,
  Activity,
  Settings,
  Plus,
  ArrowLeft,
  Share2,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskCreateDialog } from '@/components/common/AppModals'
import { toast } from 'sonner'

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const {
    projects,
    tasks,
    members,
    activities,
    setSelectedTaskId,
    updateProject
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<
    'overview' | 'work-items' | 'cycles' | 'files' | 'activity' | 'settings'
  >('overview')

  const [createTaskOpen, setCreateTaskOpen] = useState(false)

  const project = projects.find(p => p.id === projectId) || projects[0]
  if (!project) {
    return <div className="p-8 text-center">Project not found</div>
  }

  const projectTasks = tasks.filter(t => t.projectId === project.id)
  const projectLead = members.find(m => m.id === project.leadId)
  const projectMembers = members.filter(m => project.memberIds.includes(m.id))
  const projectActivities = activities.filter(a => a.projectId === project.id)

  const completedTasks = projectTasks.filter(t => t.status === 'Done').length
  const activeTasks = projectTasks.filter(t => t.status !== 'Done').length

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Contextual Project Header Inspired by Reference */}
      <div className="bg-surface border-b border-border px-6 pt-5 pb-0 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app/projects')}
              className="p-1 rounded hover:bg-secondary text-muted-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                {project.identifier}
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground font-heading">
                {project.name}
              </h1>
              <StatusBadge status={project.status} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="xs"
              onClick={() => setCreateTaskOpen(true)}
              className="bg-[#086F83] hover:bg-[#075B6C] text-white text-xs h-7 font-medium"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Task
            </Button>
          </div>
        </div>

        {/* Horizontal Project Navigation Tabs */}
        <div className="flex items-center space-x-6 text-xs border-b border-transparent">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'work-items', label: `Work Items (${projectTasks.length})` },
            { id: 'cycles', label: 'Cycles' },
            { id: 'files', label: 'Files' },
            { id: 'activity', label: 'Activity' },
            { id: 'settings', label: 'Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#086F83] text-[#086F83] dark:border-[#55B6C7] dark:text-[#55B6C7] font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Viewport */}
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Main Details & Tasks */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description Card */}
              <div className="p-4 rounded-lg border border-border bg-surface shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Project Scope & Architecture
                </h3>
                <p className="text-xs text-foreground/90 leading-relaxed">
                  {project.description}
                </p>

                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border/80 text-xs">
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Completed Work</span>
                    <span className="font-mono font-bold text-foreground">
                      {completedTasks} / {projectTasks.length} ({Math.round((completedTasks / (projectTasks.length || 1)) * 100)}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Target Timeline</span>
                    <span className="font-mono font-medium text-foreground">{project.startDate} → {project.deadline}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Assigned Lead</span>
                    <span className="font-medium text-foreground">{projectLead?.name}</span>
                  </div>
                </div>
              </div>

              {/* Work Items preview list */}
              <div className="p-4 rounded-lg border border-border bg-surface shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Recent Work Items
                  </h3>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setActiveTab('work-items')}
                    className="text-xs text-[#086F83]"
                  >
                    View All →
                  </Button>
                </div>

                <div className="divide-y divide-border">
                  {projectTasks.slice(0, 5).map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className="py-2.5 flex items-center justify-between hover:bg-muted/30 px-2 rounded cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="font-mono text-[10px] font-semibold text-muted-foreground shrink-0">
                          {t.identifier}
                        </span>
                        <span className="text-xs font-medium text-foreground truncate max-w-[280px]">
                          {t.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <PriorityIcon priority={t.priority} />
                        <StatusBadge status={t.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Contextual Project Info Drawer/Panel */}
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-border bg-surface shadow-xs space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Project Properties
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <select
                      value={project.status}
                      onChange={(e) => updateProject(project.id, { status: e.target.value as ProjectStatus })}
                      className="h-6 text-[11px] font-medium rounded border border-border bg-background px-1.5 cursor-pointer"
                    >
                      <option value="Planning">Planning</option>
                      <option value="Active">Active</option>
                      <option value="On Track">On Track</option>
                      <option value="At Risk">At Risk</option>
                      <option value="Delayed">Delayed</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium text-foreground">{project.category || 'General'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-mono font-semibold">{project.progress}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Project Lead</span>
                    <div className="flex items-center gap-1.5">
                      {projectLead && <UserAvatar user={projectLead} size="xs" />}
                      <span className="font-medium">{projectLead?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <h4 className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    Assigned Team ({projectMembers.length})
                  </h4>
                  <div className="space-y-1.5">
                    {projectMembers.map(m => (
                      <div key={m.id} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2">
                          <UserAvatar user={m} size="xs" />
                          <div>
                            <div className="font-medium text-foreground">{m.name}</div>
                            <div className="text-[10px] text-muted-foreground">{m.jobTitle}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'work-items' && (
          <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                All {project.identifier} Work Items
              </span>
              <Button size="xs" onClick={() => setCreateTaskOpen(true)} className="bg-[#086F83] text-white">
                <Plus className="w-3.5 h-3.5 mr-1" /> New Item
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4 font-semibold">Key</th>
                    <th className="py-2.5 px-3 font-semibold">Title</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Priority</th>
                    <th className="py-2.5 px-3 font-semibold">Assignee</th>
                    <th className="py-2.5 px-4 font-semibold">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projectTasks.map(t => {
                    const assignee = members.find(m => t.assigneeIds.includes(m.id))
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTaskId(t.id)}
                        className="hover:bg-muted/40 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-4 font-mono font-semibold text-muted-foreground">
                          {t.identifier}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-foreground truncate max-w-[280px]">
                          {t.title}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="py-2.5 px-3">
                          <PriorityIcon priority={t.priority} showLabel />
                        </td>
                        <td className="py-2.5 px-3">
                          {assignee ? (
                            <div className="flex items-center gap-1.5">
                              <UserAvatar user={assignee} size="xs" />
                              <span>{assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-muted-foreground">
                          {t.dueDate}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'cycles' && (
          <div className="p-4 rounded-lg border border-border bg-surface text-center py-10 space-y-3">
            <h3 className="font-semibold text-sm">Sprint Cycles for {project.name}</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Cycles track time-boxed iterations, velocity metrics and burndown statistics.
            </p>
            <Button size="sm" onClick={() => navigate('/app/cycles')} className="bg-[#086F83] text-white">
              Open Global Cycles Workspace →
            </Button>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="p-4 rounded-lg border border-border bg-surface text-center py-10 space-y-3">
            <h3 className="font-semibold text-sm">Project Documents & Assets</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              All architecture specs, contracts and export documents associated with {project.name}.
            </p>
            <Button size="sm" onClick={() => navigate('/app/files')} className="bg-[#086F83] text-white">
              Go to Workspace Files →
            </Button>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="p-4 rounded-lg border border-border bg-surface space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Project Audit & Activity Log
            </h3>
            <div className="space-y-3">
              {projectActivities.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-6">
                  No direct activity logged for this project yet.
                </div>
              ) : (
                projectActivities.map(a => {
                  const actor = members.find(m => m.id === a.actorId)
                  return (
                    <div key={a.id} className="flex items-center gap-2.5 text-xs py-1.5 border-b border-border/60">
                      <UserAvatar user={actor} size="xs" />
                      <div className="flex-1">
                        <span className="font-semibold text-foreground mr-1.5">{actor?.name}</span>
                        <span className="text-muted-foreground">{a.description}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">{a.timestamp}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-5 rounded-lg border border-border bg-surface space-y-4 max-w-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Project Configuration
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-foreground block mb-1">Project Identifier (Key)</label>
                <input
                  type="text"
                  value={project.identifier}
                  disabled
                  className="w-full h-8 px-2 rounded border border-border bg-muted/40 font-mono"
                />
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">Target Deadline</label>
                <input
                  type="date"
                  value={project.deadline}
                  onChange={(e) => updateProject(project.id, { deadline: e.target.value })}
                  className="w-full h-8 px-2 rounded border border-border bg-background font-mono"
                />
              </div>
              <div className="pt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Delete project "${project.name}"?`)) {
                      navigate('/app/projects')
                    }
                  }}
                  className="text-xs"
                >
                  Delete Project
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <TaskCreateDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        defaultProjectId={project.id}
      />
    </div>
  )
}
