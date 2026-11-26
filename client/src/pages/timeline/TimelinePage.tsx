import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { PriorityIcon } from '@/components/common/StatusAndPriority'
import { Calendar, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

const parseTaskDate = (value: string) => {
  const datePart = value.slice(0, 10)
  const [year, month, day] = datePart.split('-').map(Number)
  if (year && month && day) return new Date(year, month - 1, day)
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const TimelinePage: React.FC = () => {
  const { tasks, projects, setSelectedTaskId } = useAppStore()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all')
  const [weekOffset, setWeekOffset] = useState(0)

  const taskDates = tasks
    .filter(task => selectedProjectId === 'all' || task.projectId === selectedProjectId)
    .flatMap(task => {
      const dueDate = parseTaskDate(task.dueDate)
      return dueDate ? [{ task, dueDate }] : []
    })
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 15)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + weekOffset * 7 + i)
    return {
      dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      dayName: d.toLocaleDateString(undefined, { weekday: 'short' }),
      dayNumber: d.getDate(),
      isToday: d.toDateString() === new Date().toDateString(),
    }
  })

  const dateRangeLabel = `${new Date(`${days[0].dateStr}T00:00:00`).toLocaleDateString()} – ${new Date(`${days[6].dateStr}T00:00:00`).toLocaleDateString()}`

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-foreground font-medium">Gantt & Schedule</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
            Project Timeline
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="h-8 text-xs rounded-md border border-input bg-background px-2"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                [{p.identifier}] {p.name}
              </option>
            ))}
          </select>
          <Button variant="outline" size="icon-xs" onClick={() => setWeekOffset(offset => offset - 1)} title="Previous week">
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          <span className="inline-flex items-center gap-1 whitespace-nowrap text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" /> {dateRangeLabel}
          </span>
          <Button variant="outline" size="icon-xs" onClick={() => setWeekOffset(offset => offset + 1)} title="Next week">
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Lightweight Timeline / Gantt Board */}
      <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
        {/* Date Headers */}
        <div className="grid grid-cols-12 border-b border-border bg-muted/40 text-xs text-muted-foreground">
          <div className="col-span-4 p-2.5 font-semibold uppercase text-[10px] tracking-wider border-r border-border">
            Task & Identifier
          </div>
          <div className="col-span-8 grid grid-cols-7 text-center">
            {days.map((day) => (
              <div
                key={day.dateStr}
                className={`py-2 border-r border-border/60 ${
                  day.isToday ? 'bg-[#EAF5F7] dark:bg-[#173239] font-bold text-[#086F83] dark:text-[#55B6C7]' : ''
                }`}
              >
                <div className="text-[10px] uppercase">{day.dayName}</div>
                <div className="text-xs font-mono">{day.dayNumber}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Rows */}
        <div className="divide-y divide-border">
          {taskDates.map(({ task, dueDate }) => {
            const dueDateKey = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`

            return (
              <div
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className="grid grid-cols-12 hover:bg-muted/30 cursor-pointer transition-colors text-xs items-center"
              >
                <div className="col-span-4 p-2.5 border-r border-border truncate flex items-center gap-2">
                  <span className="font-mono text-[10px] font-semibold text-muted-foreground shrink-0">
                    {task.identifier}
                  </span>
                  <span className="truncate font-medium text-foreground">{task.title}</span>
                  <span className="ml-auto shrink-0"><PriorityIcon priority={task.priority} /></span>
                </div>

                <div className="col-span-8 grid grid-cols-7 p-2 relative h-10 items-center">
                  {days.map(day => (
                    <div key={day.dateStr} className="h-full border-r border-border/40 flex items-center justify-center">
                      {day.dateStr === dueDateKey && (
                        <span className="rounded bg-[#086F83]/15 text-[#086F83] dark:bg-[#173239] dark:text-[#55B6C7] border border-[#086F83]/30 px-2 py-1 text-[10px] font-semibold">
                          Due
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {taskDates.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">No tasks with due dates to display.</p>
          )}
        </div>
      </div>
    </div>
  )
}
