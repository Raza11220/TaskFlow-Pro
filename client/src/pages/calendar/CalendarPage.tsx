import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskCreateDialog } from '@/components/common/AppModals'
import { toast } from 'sonner'

export const CalendarPage: React.FC = () => {
  const { tasks, setSelectedTaskId, updateTask } = useAppStore()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Map tasks to FullCalendar event format
  const events = tasks.map((t) => {
    let color = '#086F83'
    if (t.priority === 'Urgent') color = '#DC4444'
    else if (t.status === 'Done') color = '#16865C'
    else if (t.priority === 'High') color = '#D97706'

    return {
      id: t.id,
      title: `[${t.identifier}] ${t.title}`,
      start: t.dueDate,
      allDay: true,
      backgroundColor: color,
      borderColor: color,
      extendedProps: { taskId: t.id }
    }
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-foreground font-medium">Schedule</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
            Calendar & Deadlines
          </h1>
        </div>

        <Button
          size="sm"
          onClick={() => setCreateDialogOpen(true)}
          className="h-8 text-xs font-medium bg-[#086F83] hover:bg-[#075B6C] text-white"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Schedule Task
        </Button>
      </div>

      {/* FullCalendar Wrapper with Enterprise Design Overrides */}
      <div className="rounded-lg border border-border bg-surface p-4 shadow-xs text-xs">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
          }}
          editable={true}
          events={events}
          eventClick={(info) => {
            const taskId = info.event.extendedProps.taskId
            if (taskId) setSelectedTaskId(taskId)
          }}
          eventDrop={(info) => {
            const taskId = info.event.extendedProps.taskId
            const newDate = info.event.startStr
            if (taskId && newDate) {
              updateTask(taskId, { dueDate: newDate.slice(0, 10) })
              toast.success(`Rescheduled task deadline to ${newDate.slice(0, 10)}`)
            }
          }}
          height={650}
        />
      </div>

      <TaskCreateDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  )
}
