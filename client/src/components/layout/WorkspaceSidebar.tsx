import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import {
  Calendar,
  CheckCircle2,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Repeat,
  SlidersHorizontal,
  Star,
  Users,
  BarChart2,
  FileText,
  Activity,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const WorkspaceSidebar: React.FC<{
  onOpenCreateTask: () => void
  onOpenCreateProject: () => void
}> = ({ onOpenCreateTask, onOpenCreateProject }) => {
  const {
    organization,
    isSyncing,
    isSynced,
    projects,
    notifications,
    sidebarCollapsed,
    toggleSidebar,
    setSelectedProjectId
  } = useAppStore()

  const navigate = useNavigate()
  const unreadCount = notifications.filter(n => !n.read).length
  const favoriteProjects = projects.filter(p => p.isFavorite && !p.isArchived)

  if (sidebarCollapsed) {
    return (
      <div className="w-[16px] bg-sidebar border-r border-border/80 hover:bg-muted/60 transition-colors flex items-center justify-center shrink-0 z-20">
        <button
          onClick={toggleSidebar}
          title="Expand workspace sidebar"
          className="opacity-50 hover:opacity-100 p-1 rounded-md"
        >
          <PanelLeftOpen className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <aside className="w-[245px] bg-sidebar border-r border-border/80 flex flex-col justify-between py-3 shrink-0 select-none overflow-hidden text-xs z-20 shadow-xs">
      {/* Scrollable Navigation section */}
      <div className="flex-1 overflow-y-auto px-3 space-y-4 custom-scroll">
        {/* Workspace pill & Collapse */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
            <span>Workspace</span>
          </div>
          <button
            onClick={toggleSidebar}
            title="Collapse sidebar"
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Button */}
        <div>
          <Button
            size="sm"
            onClick={onOpenCreateTask}
            className="w-full bg-gradient-to-r from-[#0284C7] to-indigo-600 hover:from-[#0369A1] hover:to-indigo-700 text-white h-8.5 text-xs font-semibold shadow-sm shadow-[#0284C7]/20 justify-start px-3 gap-2 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Work Item</span>
          </Button>
        </div>

        {/* Primary Navigation List */}
        <nav className="space-y-0.5">
          {[
            { to: '/app/dashboard', icon: LayoutDashboard, label: 'Overview' },
            { to: '/app/tasks', icon: CheckCircle2, label: 'My Tasks' },
            { to: '/app/inbox', icon: Inbox, label: 'Inbox', badge: unreadCount },
            { to: '/app/board', icon: FolderKanban, label: 'Kanban Board' },
            { to: '/app/cycles', icon: Repeat, label: 'Cycles & Sprints' },
            { to: '/app/timeline', icon: SlidersHorizontal, label: 'Timeline' },
            { to: '/app/calendar', icon: Calendar, label: 'Calendar' },
            { to: '/app/chat', icon: MessageSquare, label: 'Team Chat' },
            { to: '/app/team', icon: Users, label: 'Team Members' },
            { to: '/app/reports', icon: BarChart2, label: 'Reports & Analytics' },
            { to: '/app/files', icon: FileText, label: 'Files' },
            { to: '/app/activity', icon: Activity, label: 'Activity Feed' }
          ].map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3 py-1.5 rounded-xl font-medium transition-all duration-150',
                    isActive
                      ? 'bg-gradient-to-r from-sky-500/15 to-indigo-500/10 text-[#0284C7] dark:text-[#38BDF8] font-bold shadow-2xs border border-sky-500/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )
                }
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0 stroke-[1.8]" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="font-mono text-[10px] px-2 py-0.2 rounded-full bg-rose-500 text-white font-bold shadow-xs">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            )
          })}
        </nav>

        {/* Favorite Projects */}
        {favoriteProjects.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground px-1 mb-1.5 uppercase font-mono tracking-wider">
              <span className="flex items-center gap-1.5">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> Favorites
              </span>
            </div>
            <div className="space-y-0.5">
              {favoriteProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProjectId(p.id)
                    navigate(`/app/projects/${p.id}`)
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 text-left transition-colors cursor-pointer group"
                >
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground border border-border">
                    {p.identifier}
                  </span>
                  <span className="truncate group-hover:text-foreground font-medium text-[11px]">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Projects List with live progress indicators */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground px-1 mb-1.5 uppercase font-mono tracking-wider">
            <span>Projects ({projects.length})</span>
            <button
              onClick={onOpenCreateProject}
              className="hover:text-foreground p-1 rounded-md hover:bg-muted cursor-pointer transition-colors"
              title="Create new project"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-0.5 max-h-[170px] overflow-y-auto custom-scroll">
            {projects.slice(0, 8).map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedProjectId(p.id)
                  navigate(`/app/projects/${p.id}`)
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground border border-border shrink-0">
                    {p.identifier}
                  </span>
                  <span className="truncate font-medium text-[11px]">{p.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono font-semibold">
                  {p.progress}%
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer Info Card */}
      <div className="p-3 border-t border-border/80 mt-1">
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500/10 via-indigo-500/5 to-transparent border border-sky-500/20 text-[11px] text-muted-foreground flex items-center justify-between shadow-2xs">
          <div className="truncate">
            <span className="truncate font-heading font-bold text-foreground block text-xs">{organization.name || 'Workspace'}</span>
            <span className="text-[10px] font-semibold">
              ● {isSyncing ? 'Syncing...' : isSynced ? 'Connected' : 'Not connected'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
