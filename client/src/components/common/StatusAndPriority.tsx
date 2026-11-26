import React from 'react'
import { TaskStatus, TaskPriority, ProjectStatus, CycleStatus } from '@/types'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  AlertTriangle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Circle,
  Clock,
  HelpCircle,
  MinusCircle,
  PlayCircle
} from 'lucide-react'

export const StatusBadge: React.FC<{
  status: TaskStatus | ProjectStatus | CycleStatus
  className?: string
  showIcon?: boolean
}> = ({ status, className, showIcon = true }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Done':
      case 'Completed':
      case 'On Track':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30 font-medium'
      case 'In Progress':
      case 'Active':
        return 'bg-sky-500/10 text-sky-600 border-sky-500/25 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30 font-medium'
      case 'Review':
      case 'Upcoming':
      case 'Planning':
        return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30 font-medium'
      case 'To Do':
      case 'Backlog':
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30 font-medium'
      case 'At Risk':
      case 'Delayed':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30 font-medium'
      case 'Cancelled':
      case 'Archived':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30 font-medium'
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20'
    }
  }

  const renderIcon = () => {
    switch (status) {
      case 'Done':
      case 'Completed':
      case 'On Track':
        return <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
      case 'In Progress':
      case 'Active':
        return <PlayCircle className="w-3 h-3 text-sky-600 dark:text-sky-400" />
      case 'Review':
        return <Clock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
      case 'To Do':
        return <Circle className="w-3 h-3 text-slate-500 dark:text-slate-400" />
      case 'Backlog':
        return <HelpCircle className="w-3 h-3 text-slate-500 dark:text-slate-400" />
      case 'At Risk':
      case 'Delayed':
        return <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
      case 'Cancelled':
      case 'Archived':
        return <MinusCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
      default:
        return null
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] border leading-tight select-none whitespace-nowrap shadow-2xs',
        getBadgeStyle(),
        className
      )}
    >
      {showIcon && renderIcon()}
      {status}
    </span>
  )
}

export const PriorityIcon: React.FC<{
  priority: TaskPriority
  className?: string
  showLabel?: boolean
}> = ({ priority, className, showLabel = false }) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'Urgent':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500" />,
          color: 'text-rose-600 dark:text-rose-400 font-semibold',
          label: 'Urgent'
        }
      case 'High':
        return {
          icon: <ArrowUp className="w-3.5 h-3.5 text-amber-500" />,
          color: 'text-amber-600 dark:text-amber-400 font-medium',
          label: 'High'
        }
      case 'Medium':
        return {
          icon: <ArrowRight className="w-3.5 h-3.5 text-sky-500" />,
          color: 'text-sky-600 dark:text-sky-400 font-medium',
          label: 'Medium'
        }
      case 'Low':
      default:
        return {
          icon: <ArrowDown className="w-3.5 h-3.5 text-slate-400" />,
          color: 'text-slate-500 font-medium',
          label: 'Low'
        }
    }
  }

  const config = getPriorityConfig()

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[12px]', className)} title={`Priority: ${priority}`}>
      {config.icon}
      {showLabel && <span className={config.color}>{config.label}</span>}
    </span>
  )
}
