import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Check, CheckCheck, Filter, Inbox, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export const InboxPage: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotification,
    setSelectedTaskId
  } = useAppStore()

  const navigate = useNavigate()
  const [filterType, setFilterType] = useState<string>('all')

  const filtered = notifications.filter(n => {
    if (filterType === 'unread') return !n.read
    if (filterType !== 'all' && n.type !== filterType) return false
    return true
  })

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-foreground font-medium">Activity Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
            Inbox & Notifications
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={markAllNotificationsRead}
          className="h-8 text-xs font-medium"
        >
          <CheckCheck className="w-3.5 h-3.5 mr-1" />
          Mark all as read
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-4 text-xs border-b border-border pb-1">
        {[
          { id: 'all', label: 'All Notifications' },
          { id: 'unread', label: 'Unread Only' },
          { id: 'task_update', label: 'Task Updates' },
          { id: 'mention', label: 'Mentions' },
          { id: 'deadline', label: 'Deadlines' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`pb-2 font-medium transition-colors border-b-2 cursor-pointer ${
              filterType === tab.id
                ? 'border-[#086F83] text-[#086F83] dark:border-[#55B6C7] dark:text-[#55B6C7] font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="rounded-lg border border-border bg-surface shadow-xs divide-y divide-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
            <Inbox className="w-8 h-8 mx-auto opacity-40" />
            <p>You're all caught up! No notifications to display.</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationRead(n.id)
                if (n.targetType === 'task' && n.targetId) {
                  setSelectedTaskId(n.targetId)
                }
              }}
              className={`p-4 flex items-start justify-between gap-4 hover:bg-muted/30 cursor-pointer transition-colors ${
                !n.read ? 'bg-[#EAF5F7]/30 dark:bg-[#173239]/20' : ''
              }`}
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[#086F83] shrink-0" />
                  )}
                  <h4 className="font-semibold text-xs text-foreground">{n.title}</h4>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {n.createdAt}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {n.message}
                </p>
              </div>

              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {!n.read && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => markNotificationRead(n.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-[#086F83]"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    clearNotification(n.id)
                    toast.success('Notification removed')
                  }}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
