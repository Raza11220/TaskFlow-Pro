import React from 'react'
import { useAppStore } from '@/store/useAppStore'
import { UserAvatar } from '@/components/common/UserAvatar'
import { PriorityIcon, StatusBadge } from '@/components/common/StatusAndPriority'
import { Mail, Phone, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export const UserProfilePage: React.FC = () => {
  const { currentUser, tasks, projects, setSelectedTaskId } = useAppStore()
  const navigate = useNavigate()

  const myTasks = tasks.filter(t => t.assigneeIds.includes(currentUser.id))
  const completedCount = myTasks.filter(t => t.status === 'Done').length
  const activeCount = myTasks.filter(t => t.status !== 'Done').length

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="rounded-lg border border-border bg-surface p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <UserAvatar user={currentUser} size="lg" className="w-20 h-20 text-xl" />

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-xl font-bold text-foreground font-heading">{currentUser.name}</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EAF5F7] text-[#086F83] dark:bg-[#173239] dark:text-[#55B6C7] border border-[#086F83]/30">
              <Shield className="w-3 h-3" /> {currentUser.role}
            </span>
          </div>

          {(currentUser.jobTitle || currentUser.department) && (
            <p className="text-xs text-muted-foreground">
              {[currentUser.jobTitle, currentUser.department].filter(Boolean).join(' • ')}
            </p>
          )}
          {currentUser.bio && <p className="text-xs text-foreground/80 pt-1 max-w-xl leading-relaxed">{currentUser.bio}</p>}

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {currentUser.email}</span>
            {currentUser.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {currentUser.phone}</span>}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/app/settings')}
          className="text-xs shrink-0"
        >
          Edit Profile
        </Button>
      </div>

      {/* Output Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-border bg-surface shadow-xs text-center">
          <span className="text-xs text-muted-foreground">Active Work Items</span>
          <div className="text-2xl font-bold font-mono text-[#086F83] dark:text-[#55B6C7] mt-1">{activeCount}</div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-surface shadow-xs text-center">
          <span className="text-xs text-muted-foreground">Completed Tasks</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{completedCount}</div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-surface shadow-xs text-center">
          <span className="text-xs text-muted-foreground">Workload Score</span>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">{currentUser.workloadPercentage}%</div>
        </div>
      </div>

      {/* Assigned Tasks list */}
      <div className="rounded-lg border border-border bg-surface p-4 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Assigned Tasks & Deliverables ({myTasks.length})
        </h3>

        <div className="divide-y divide-border text-xs">
          {myTasks.slice(0, 8).map(t => {
            const prj = projects.find(p => p.id === t.projectId)
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTaskId(t.id)}
                className="py-2.5 flex items-center justify-between hover:bg-muted/30 px-2 rounded cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="font-mono text-[10px] font-semibold text-muted-foreground">
                    {t.identifier}
                  </span>
                  <span className="font-medium text-foreground truncate max-w-md">{t.title}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <PriorityIcon priority={t.priority} />
                  <StatusBadge status={t.status} />
                  <span className="font-mono text-[10px] text-muted-foreground">{t.dueDate}</span>
                </div>
              </div>
            )
          })}
          {myTasks.length === 0 && (
            <p className="py-6 text-center text-muted-foreground">No tasks are assigned to you yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
