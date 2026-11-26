import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { StatusBadge, PriorityIcon } from '@/components/common/StatusAndPriority'
import { UserAvatar } from '@/components/common/UserAvatar'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts'
import {
  CheckCircle2,
  Clock,
  FolderKanban,
  AlertTriangle,
  Users,
  Plus,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { TaskCreateDialog, ProjectCreateDialog } from '@/components/common/AppModals'

export const DashboardPage: React.FC = () => {
  const {
    projects,
    tasks,
    members,
    organization,
    setSelectedTaskId,
    setSelectedProjectId
  } = useAppStore()

  const navigate = useNavigate()
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [createProjectOpen, setCreateProjectOpen] = useState(false)

  // Derived metrics
  const totalProjects = projects.filter(p => !p.isArchived).length
  const activeProjects = projects.filter(p => p.status === 'Active' || p.status === 'On Track').length
  const activeTasks = tasks.filter(t => t.status !== 'Done' && t.status !== 'Cancelled').length
  const completedTasks = tasks.filter(t => t.status === 'Done').length
  const unassignedTasks = tasks.filter(t => t.status !== 'Done' && t.status !== 'Cancelled' && t.assigneeIds.length === 0).length
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'Done' || t.status === 'Cancelled') return false
    const dueDate = new Date(t.dueDate)
    return !Number.isNaN(dueDate.getTime()) && dueDate < today
  }).length
  const totalMembers = members.length

  // Vivid status counts for charts
  const statusCounts = {
    'To Do': tasks.filter(t => t.status === 'To Do' || t.status === 'Backlog').length,
    'In Progress': tasks.filter(t => t.status === 'In Progress').length,
    'Review': tasks.filter(t => t.status === 'Review').length,
    'Done': tasks.filter(t => t.status === 'Done').length
  }

  // Vibrant palette: Cyan/Sky, Indigo/Violet, Emerald, Amber
  const pieData = [
    { name: 'To Do', value: statusCounts['To Do'], color: '#64748B' },
    { name: 'In Progress', value: statusCounts['In Progress'], color: '#0EA5E9' },
    { name: 'Review', value: statusCounts['Review'], color: '#8B5CF6' },
    { name: 'Done', value: statusCounts['Done'], color: '#10B981' }
  ]

  const trendData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const isSameDay = (value: string) => {
      const taskDate = new Date(value)
      return !Number.isNaN(taskDate.getTime()) && taskDate.toDateString() === date.toDateString()
    }

    return {
      name: date.toLocaleDateString(undefined, { weekday: 'short' }),
      completed: tasks.filter(task => task.status === 'Done' && isSameDay(task.updatedAt)).length,
      created: tasks.filter(task => isSameDay(task.createdAt)).length,
    }
  })

  const workloadData = members.slice(0, 6).map(m => ({
    name: m.name.split(' ')[0],
    assigned: tasks.filter(t => t.assigneeIds.includes(m.id)).length,
    completed: tasks.filter(t => t.assigneeIds.includes(m.id) && t.status === 'Done').length
  }))

  const upcomingDeadlines = tasks
    .filter(t => t.status !== 'Done' && t.status !== 'Cancelled')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-7 text-foreground">
      {/* Top Banner Ribbon with Rich Ambient Lighting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500/15 via-indigo-500/10 to-emerald-500/10 border border-sky-500/25 p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-[#0284C7] dark:text-[#38BDF8] text-xs font-bold border border-sky-500/30">
            <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
            <span>{organization.name || 'Workspace'} • DELIVERY OVERVIEW</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
            Workspace Overview
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Project and task status based on your workspace data.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateProjectOpen(true)}
            className="h-9 px-4 text-xs font-semibold rounded-xl border-border bg-surface hover:bg-muted/70 shadow-xs"
          >
            New Project
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateTaskOpen(true)}
            className="h-9 px-4 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#0284C7] to-indigo-600 hover:from-[#0369A1] hover:to-indigo-700 text-white shadow-md shadow-sky-500/25"
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            New Work Item
          </Button>
        </div>
      </div>

      {/* Colorful, Rich Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: 'Total Projects',
            val: totalProjects,
            sub: `${activeProjects} active tracks`,
            icon: FolderKanban,
            gradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
            border: 'border-sky-500/30 hover:border-sky-500',
            badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
            iconColor: 'text-sky-500'
          },
          {
            label: 'Active Tasks',
            val: activeTasks,
            sub: 'in progress & review',
            icon: Clock,
            gradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
            border: 'border-indigo-500/30 hover:border-indigo-500',
            badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
            iconColor: 'text-indigo-500'
          },
          {
            label: 'Completed',
            val: completedTasks,
            sub: `${Math.round((completedTasks / (tasks.length || 1)) * 100)}% of workspace tasks`,
            icon: CheckCircle2,
            gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
            border: 'border-emerald-500/30 hover:border-emerald-500',
            badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            iconColor: 'text-emerald-500'
          },
          {
            label: 'Overdue Items',
            val: overdueTasks,
            sub: 'past their due date',
            icon: AlertTriangle,
            gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
            border: 'border-amber-500/30 hover:border-amber-500',
            badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
            iconColor: 'text-amber-500'
          },
          {
            label: 'Team Members',
            val: totalMembers,
            sub: `${totalMembers} in this workspace`,
            icon: Users,
            gradient: 'from-violet-500/10 via-violet-500/5 to-transparent',
            border: 'border-violet-500/30 hover:border-violet-500',
            badgeBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
            iconColor: 'text-violet-500'
          },
          {
            label: 'Unassigned Tasks',
            val: unassignedTasks,
            sub: 'open tasks without an assignee',
            icon: Users,
            gradient: 'from-teal-500/10 via-teal-500/5 to-transparent',
            border: 'border-teal-500/30 hover:border-teal-500',
            badgeBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
            iconColor: 'text-teal-500'
          }
        ].map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border ${item.border} bg-surface bg-gradient-to-br ${item.gradient} shadow-xs hover:shadow-md transition-all duration-200 group relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-muted-foreground">{item.label}</span>
                <div className={`p-1.5 rounded-lg ${item.badgeBg}`}>
                  <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
              </div>
              <div className="text-2xl font-black font-mono tracking-tight text-foreground group-hover:scale-105 transition-transform origin-left">
                {item.val}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 truncate font-medium">
                {item.sub}
              </div>
            </div>
          )
        })}
      </div>

      {/* Primary Chart Arena (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task activity area chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border/80 bg-surface shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-base text-foreground">
                  Task Activity
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tasks created and completed over the last seven days
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                <span className="w-3 h-3 rounded-full bg-[#0EA5E9]" /> Completed Tasks
              </span>
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                <span className="w-3 h-3 rounded-full bg-[#8B5CF6]" /> Created Tasks
              </span>
            </div>
          </div>

          {tasks.length ? <div className="h-64 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCompletedVivid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCreatedVivid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.7} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Completed Tasks"
                  stroke="#0EA5E9"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCompletedVivid)"
                />
                <Area
                  type="monotone"
                  dataKey="created"
                  name="Incoming"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorCreatedVivid)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div> : <p className="py-16 text-center text-sm text-muted-foreground">No task activity yet.</p>}
        </div>

        {/* Vibrant Status Donut with Glowing Center (1 col) */}
        <div className="p-6 rounded-2xl border border-border/80 bg-surface shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-extrabold text-base text-foreground">
                Task Status Spectrum
              </h3>
              <p className="text-xs text-muted-foreground">Distribution across work stages</p>
            </div>
            <span className="font-mono text-xs font-bold text-sky-600 bg-sky-500/10 px-2 py-0.5 rounded-full">
              {tasks.length} Total
            </span>
          </div>

          {tasks.length ? (
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black font-mono text-foreground">{completedTasks}</span>
                <span className="text-[10px] uppercase font-bold text-emerald-600 font-mono tracking-wider">DONE</span>
              </div>
            </div>
          ) : <p className="py-16 text-center text-sm text-muted-foreground">No tasks to summarize.</p>}

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/80">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                <span className="flex items-center gap-2 text-muted-foreground text-[11px] font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-mono font-bold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Graphs & Tables Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Capacity Bar Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border/80 bg-surface shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-extrabold text-base text-foreground">
                Task Assignments
              </h3>
              <p className="text-xs text-muted-foreground">Assigned and completed tasks by team member</p>
            </div>
          </div>

          {workloadData.length ? <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '10px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="assigned" name="Assigned" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div> : <p className="py-16 text-center text-sm text-muted-foreground">No team members to display.</p>}
        </div>

        {/* Priority Spectrum Alert Cards (1 col) */}
        <div className="p-6 rounded-2xl border border-border/80 bg-surface shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-base text-foreground">
                Urgent Deliverables
              </h3>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>

            <div className="space-y-2.5">
              {upcomingDeadlines.map(t => {
                const prj = projects.find(p => p.id === t.projectId)
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTaskId(t.id)}
                    className="p-3.5 rounded-xl border border-border/80 bg-gradient-to-r from-muted/30 to-transparent hover:border-[#0284C7]/50 hover:shadow-xs cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">
                        {t.identifier}
                      </span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        Due {t.dueDate}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-foreground line-clamp-1">
                      {t.title}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span className="truncate max-w-[130px] font-medium">{prj?.name}</span>
                      <PriorityIcon priority={t.priority} showLabel />
                    </div>
                  </div>
                )
              })}
              {upcomingDeadlines.length === 0 && (
                <p className="py-8 text-center text-xs text-muted-foreground">No open tasks with deadlines.</p>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/calendar')}
            className="w-full text-xs font-bold rounded-xl border-border hover:bg-muted py-2"
          >
            Open Interactive Calendar →
          </Button>
        </div>
      </div>

      {/* Active Strategic Projects Table */}
      <div className="p-6 rounded-2xl border border-border/80 bg-surface shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-extrabold text-base text-foreground">
              Project Progress
            </h3>
            <p className="text-xs text-muted-foreground">            Current projects and their reported progress</p>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => navigate('/app/projects')}
            className="text-xs text-[#0284C7] hover:text-[#0369A1] font-bold"
          >
            All Projects →
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/80 text-muted-foreground uppercase text-[10px] font-mono tracking-wider">
                <th className="pb-3 font-semibold">Track & Key</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Progress Bar</th>
                <th className="pb-3 font-semibold">Lead</th>
                <th className="pb-3 font-semibold text-right">Target Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {projects.slice(0, 6).map(p => {
                const lead = members.find(m => m.id === p.leadId)
                return (
                  <tr
                    key={p.id}
                    onClick={() => {
                      setSelectedProjectId(p.id)
                      navigate(`/app/projects/${p.id}`)
                    }}
                    className="hover:bg-muted/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 font-medium">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border">
                          {p.identifier}
                        </span>
                        <div>
                          <span className="font-semibold text-foreground group-hover:text-[#0284C7] transition-colors block text-sm">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground line-clamp-1 max-w-[240px]">
                            {p.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5 max-w-[140px]">
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full transition-all duration-300 shadow-xs"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-foreground">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      {lead && (
                        <div className="flex items-center gap-2">
                          <UserAvatar user={lead} size="xs" />
                          <span className="text-foreground font-semibold text-[11px] truncate max-w-[110px]">
                            {lead.name}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 text-right font-mono font-semibold text-muted-foreground">
                      {p.deadline}
                    </td>
                  </tr>
                )
              })}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No projects yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TaskCreateDialog open={createTaskOpen} onOpenChange={setCreateTaskOpen} />
      <ProjectCreateDialog open={createProjectOpen} onOpenChange={setCreateProjectOpen} />
    </div>
  )
}
