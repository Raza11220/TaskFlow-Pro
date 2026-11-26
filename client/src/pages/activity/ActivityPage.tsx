import React from 'react'
import { useAppStore } from '@/store/useAppStore'
import { UserAvatar } from '@/components/common/UserAvatar'
import { Activity, Clock, Filter } from 'lucide-react'

export const ActivityPage: React.FC = () => {
  const { activities, members, projects, setSelectedTaskId } = useAppStore()

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="pb-2 border-b border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <span>Workspace</span>
          <span>/</span>
          <span className="text-foreground font-medium">Audit Trail</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
          Workspace Activity Feed
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real-time record of all state transitions, issue completions and project milestones
        </p>
      </div>

      {/* Activity Timeline List */}
      <div className="rounded-lg border border-border bg-surface p-4 shadow-xs space-y-4">
        {activities.map((item) => {
          const actor = members.find(m => m.id === item.actorId)
          const project = projects.find(p => p.id === item.projectId)

          return (
            <div
              key={item.id}
              onClick={() => {
                if (item.taskId) setSelectedTaskId(item.taskId)
              }}
              className="flex items-start gap-3 text-xs py-2.5 border-b border-border/60 hover:bg-muted/20 p-2 rounded cursor-pointer transition-colors"
            >
              <UserAvatar user={actor} size="sm" />
              <div className="flex-1 space-y-0.5">
                <div>
                  <strong className="text-foreground font-semibold">{actor?.name}</strong>{' '}
                  <span className="text-foreground/90">{item.description}</span>
                </div>
                {project && (
                  <div className="text-[11px] text-muted-foreground">
                    Project: <span className="font-medium text-foreground">{project.name}</span> [{project.identifier}]
                  </div>
                )}
              </div>
              <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                {item.timestamp}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
