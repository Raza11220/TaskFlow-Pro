import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/store/useAppStore'
import { TaskPriority, TaskStatus, ProjectStatus } from '@/types'
import { toast } from 'sonner'

export const TaskCreateDialog: React.FC<{
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultProjectId?: string
  defaultStatus?: TaskStatus
}> = ({ open, onOpenChange, defaultProjectId, defaultStatus = 'To Do' }) => {
  const { projects, members, addTask } = useAppStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?.id || '')
  const [assigneeId, setAssigneeId] = useState(members[0]?.id || '')
  const [priority, setPriority] = useState<TaskPriority>('Medium')
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0])
  const [effort, setEffort] = useState('8h')
  const [labels, setLabels] = useState('Frontend, Core')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Task title is required')
      return
    }

    addTask({
      title: title.trim(),
      description: description.trim(),
      status: defaultStatus,
      priority,
      projectId: projectId || projects[0]?.id,
      assigneeIds: assigneeId ? [assigneeId] : [],
      creatorId: members[0]?.id,
      dueDate,
      estimatedEffort: effort,
      labels: labels.split(',').map(l => l.trim()).filter(Boolean),
      subtasks: [
        { id: `st-${Date.now()}-1`, title: 'Define acceptance criteria', completed: false }
      ],
      comments: [],
      attachments: []
    })

    toast.success('Task created successfully')
    setTitle('')
    setDescription('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Task Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement refresh token rotation"
              className="h-8 text-xs"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Project</Label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full h-8 text-xs rounded-md border border-input bg-background px-2"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.identifier}] {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Assignee</Label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full h-8 text-xs rounded-md border border-input bg-background px-2"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Priority</Label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full h-8 text-xs rounded-md border border-input bg-background px-2"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Est. Effort</Label>
              <Input
                value={effort}
                onChange={(e) => setEffort(e.target.value)}
                placeholder="e.g. 8h"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Labels (comma separated)</Label>
            <Input
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              placeholder="Backend, API, Security"
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide technical requirements, edge cases, and QA guidelines..."
              rows={3}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-[#086F83] hover:bg-[#075B6C] text-white">
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const ProjectCreateDialog: React.FC<{
  open: boolean
  onOpenChange: (open: boolean) => void
}> = ({ open, onOpenChange }) => {
  const { members, addProject } = useAppStore()
  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [description, setDescription] = useState('')
  const [leadId, setLeadId] = useState(members[0]?.id || '')
  const [category, setCategory] = useState('Enterprise SaaS')
  const [deadline, setDeadline] = useState(new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Project name is required')
      return
    }

    const prj = addProject({
      name: name.trim(),
      identifier: (identifier || name.slice(0, 3)).toUpperCase(),
      description: description.trim(),
      leadId: leadId || members[0]?.id,
      memberIds: [leadId || members[0]?.id].filter(Boolean),
      status: 'Active' as ProjectStatus,
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      deadline,
      category,
      isFavorite: false
    })

    toast.success(`Project ${prj.name} created!`)
    setName('')
    setIdentifier('')
    setDescription('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs font-medium">Project Name *</Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (!identifier && e.target.value.length >= 3) {
                    setIdentifier(e.target.value.slice(0, 3).toUpperCase())
                  }
                }}
                placeholder="e.g. Telehealth Portal"
                className="h-8 text-xs"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Key Prefix</Label>
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value.toUpperCase())}
                placeholder="TEL"
                maxLength={4}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Project Lead</Label>
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full h-8 text-xs rounded-md border border-input bg-background px-2"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.jobTitle})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-8 text-xs rounded-md border border-input bg-background px-2"
              >
                <option value="Healthcare">Healthcare</option>
                <option value="Fintech">Fintech</option>
                <option value="Enterprise SaaS">Enterprise SaaS</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Target Deadline</Label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="High-level mission, client deliverables and core milestones..."
              rows={3}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-[#086F83] hover:bg-[#075B6C] text-white">
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
