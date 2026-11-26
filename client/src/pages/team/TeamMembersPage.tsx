import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { UserAvatar } from '@/components/common/UserAvatar'
import { UserRole } from '@/types'
import {
  Mail,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export const TeamMembersPage: React.FC = () => {
  const { members, tasks, inviteMember, updateMember, removeMember } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [inviteOpen, setInviteOpen] = useState(false)

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('Employee')
  const [isInviting, setIsInviting] = useState(false)

  const filteredMembers = members.filter(m => {
    if (departmentFilter !== 'all' && m.department !== departmentFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.jobTitle.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q)
      )
    }
    return true
  })

  const departments = Array.from(new Set(members.map(m => m.department).filter(Boolean)))

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) {
      toast.error('Email is required')
      return
    }

    setIsInviting(true)
    try {
      const sent = await inviteMember(inviteEmail.trim(), inviteRole)
      if (sent) {
        toast.success(`Invitation sent to ${inviteEmail.trim()}`)
        setInviteEmail('')
        setInviteOpen(false)
      }
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-foreground font-medium">Directory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading flex items-center gap-2.5">
            <span>Team Members</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
              {filteredMembers.length}
            </span>
          </h1>
        </div>

        <Button
          size="sm"
          onClick={() => setInviteOpen(true)}
          className="h-8 text-xs font-medium bg-[#086F83] hover:bg-[#075B6C] text-white"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Invite Member
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, role or email..."
              className="h-8 text-xs pl-8"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-8 text-xs rounded-md border border-input bg-background px-2"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4 font-semibold">Member</th>
                <th className="py-2.5 px-3 font-semibold">Role</th>
                <th className="py-2.5 px-3 font-semibold">Department</th>
                <th className="py-2.5 px-3 font-semibold">Active Tasks</th>
                <th className="py-2.5 px-3 font-semibold">Workload</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMembers.map((m) => {
                const memberTasks = tasks.filter(t => t.assigneeIds.includes(m.id))
                const activeCount = memberTasks.filter(t => t.status !== 'Done').length

                return (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={m} size="sm" showStatus />
                        <div>
                          <div className="font-semibold text-foreground">{m.name}</div>
                          <div className="text-[11px] text-muted-foreground">{m.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <select
                        value={m.role}
                        onChange={(e) => {
                          updateMember(m.id, { role: e.target.value as UserRole })
                          toast.success(`Updated role for ${m.name}`)
                        }}
                        className="h-6 text-[11px] rounded border border-border bg-background px-1.5 font-medium"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Employee">Employee</option>
                      </select>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-medium text-foreground">{m.department}</span>
                      <span className="text-[10px] text-muted-foreground block">{m.jobTitle}</span>
                    </td>

                    <td className="py-3 px-3 font-mono font-medium text-foreground">
                      {activeCount} tasks
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 max-w-[100px]">
                        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              m.workloadPercentage > 85
                                ? 'bg-red-500'
                                : m.workloadPercentage > 60
                                ? 'bg-[#086F83]'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${m.workloadPercentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {m.workloadPercentage}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          m.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        ● {m.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          if (confirm(`Remove ${m.name} from the organization?`)) {
                            removeMember(m.id)
                            toast.success(`Removed ${m.name}`)
                          }
                        }}
                        className="text-muted-foreground hover:text-red-600 h-6 w-6 p-0"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Invite Team Member</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleInviteSubmit} className="space-y-3.5 py-1">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Email Address *</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="name@company.com"
                className="h-8 text-xs"
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Role</Label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full h-8 text-xs rounded-md border border-input bg-background px-2"
              >
                <option value="Employee">Employee</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isInviting} className="bg-[#086F83] hover:bg-[#075B6C] text-white">
                {isInviting ? 'Sending…' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
