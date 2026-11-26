import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  User,
  Project,
  Task,
  ProjectCycle,
  NotificationItem,
  ActivityItem,
  ChatConversation,
  ChatMessage,
  AppFileItem,
  OrganizationSettings,
  TaskStatus,
  ProjectStatus,
  UserRole
} from '@/types'
import { projectService } from '@/services/project.service'
import { taskService } from '@/services/task.service'
import { cycleService } from '@/services/cycle.service'
import { organizationService } from '@/services/organization.service'
import { chatService } from '@/services/chat.service'
import { notificationService } from '@/services/notification.service'
import { fileService } from '@/services/file.service'
import { userService } from '@/services/user.service'
import {
  mapProjectToUi,
  mapTaskToUi,
  mapCycleToUi,
  mapMessageToUi,
  mapTaskStatusToApi,
  mapPriorityToApi,
  mapProjectStatusToApi,
  mapRoleToApi,
} from '@/utils/mappers'
import { toast } from 'sonner'

const EMPTY_USER: User = {
  id: '',
  name: '',
  email: '',
  avatar: '',
  role: 'Employee',
  department: '',
  jobTitle: '',
  phone: '',
  timezone: '',
  bio: '',
  status: 'Offline',
  activeTasksCount: 0,
  workloadPercentage: 0,
}

const EMPTY_ORGANIZATION: OrganizationSettings = {
  name: '',
  domain: '',
  location: '',
  timezone: '',
  dateFormat: 'DD/MM/YYYY',
  compactDensity: false,
  theme: 'light',
}

interface HydratePayload {
  organizationId: string
  currentUser: User
  organization?: Partial<OrganizationSettings>
  projects?: Project[]
  tasks?: Task[]
  cycles?: ProjectCycle[]
  members?: User[]
  conversations?: ChatConversation[]
  messages?: Record<string, ChatMessage[]>
  notifications?: NotificationItem[]
  activities?: ActivityItem[]
  files?: AppFileItem[]
}

interface AppState {
  // Backend sync context
  organizationId: string | null
  isSyncing: boolean
  isSynced: boolean
  hydrateWorkspace: (payload: HydratePayload) => void
  setSyncing: (syncing: boolean) => void
  setConversationMessages: (conversationId: string, messages: ChatMessage[]) => void
  appendIncomingMessage: (message: ChatMessage) => void
  clearWorkspace: () => void

  // Current user
  currentUser: User
  setCurrentUser: (user: Partial<User>) => void

  // Organization settings
  organization: OrganizationSettings
  updateOrganization: (settings: Partial<OrganizationSettings>) => void

  // Projects
  projects: Project[]
  selectedProjectId: string | null
  setSelectedProjectId: (id: string | null) => void
  addProject: (project: Omit<Project, 'id'>) => Project
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  toggleFavoriteProject: (id: string) => void
  archiveProject: (id: string) => void
  restoreProject: (id: string) => void

  // Tasks
  tasks: Task[]
  selectedTaskId: string | null
  setSelectedTaskId: (id: string | null) => void
  addTask: (task: Omit<Task, 'id' | 'identifier' | 'createdAt' | 'updatedAt'>) => Task
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  updateTaskStatus: (id: string, status: TaskStatus) => void
  updateTaskPriority: (id: string, priority: Task['priority']) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  addComment: (taskId: string, content: string) => void

  // Cycles
  cycles: ProjectCycle[]
  addCycle: (cycle: Omit<ProjectCycle, 'id'>) => void
  updateCycle: (id: string, updates: Partial<ProjectCycle>) => void

  // Members
  members: User[]
  inviteMember: (email: string, role: UserRole) => Promise<boolean>
  updateMember: (id: string, updates: Partial<User>) => void
  removeMember: (id: string) => void

  // Chat
  conversations: ChatConversation[]
  messages: Record<string, ChatMessage[]>
  activeConversationId: string
  setActiveConversationId: (id: string) => void
  sendMessage: (
    conversationId: string,
    content: string
  ) => void
  deleteMessage: (conversationId: string, messageId: string) => void

  // Notifications
  notifications: NotificationItem[]
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  clearNotification: (id: string) => void

  // Activity Feed
  activities: ActivityItem[]

  // Files
  files: AppFileItem[]
  addFile: (file: Omit<AppFileItem, 'id' | 'uploadedAt' | 'uploadedById'>, rawFile?: File) => void
  deleteFile: (id: string) => void

  // UI state
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
  taskDetailDrawerOpen: boolean
  setTaskDetailDrawerOpen: (open: boolean) => void

}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      organizationId: null,
      isSyncing: false,
      isSynced: false,

      setSyncing: (syncing) => set({ isSyncing: syncing }),

      hydrateWorkspace: (payload) => {
        set((state) => ({
          organizationId: payload.organizationId,
          currentUser: payload.currentUser,
          isSynced: true,
          isSyncing: false,
          organization: payload.organization
            ? { ...state.organization, ...payload.organization }
            : state.organization,
          projects: payload.projects ?? state.projects,
          tasks: payload.tasks ?? state.tasks,
          cycles: payload.cycles ?? state.cycles,
          members: payload.members ?? state.members,
          conversations: payload.conversations ?? state.conversations,
          messages: payload.messages ?? state.messages,
          activeConversationId:
            payload.conversations
              ? payload.conversations[0]?.id ?? ''
              : state.activeConversationId,
          notifications: payload.notifications ?? state.notifications,
          activities: payload.activities ?? state.activities,
          files: payload.files ?? state.files,
        }))
      },

      setConversationMessages: (conversationId, msgs) => {
        set((state) => ({
          messages: { ...state.messages, [conversationId]: msgs },
        }))
      },

      appendIncomingMessage: (message) => {
        set((state) => {
          const existing = state.messages[message.conversationId] || []
          if (existing.some((m) => m.id === message.id)) return state
          return {
            messages: {
              ...state.messages,
              [message.conversationId]: [...existing, message],
            },
            conversations: state.conversations.map((c) =>
              c.id === message.conversationId
                ? {
                    ...c,
                    lastMessage: message.isVoice
                      ? `🎤 Voice message (${Math.round(message.audioDuration || 0)}s)`
                      : message.content,
                    lastMessageTime: message.timestamp,
                  }
                : c
            ),
          }
        })
      },

      clearWorkspace: () => {
        set({
          organizationId: null,
          isSynced: false,
          isSyncing: false,
          currentUser: EMPTY_USER,
          organization: EMPTY_ORGANIZATION,
          projects: [],
          selectedProjectId: null,
          tasks: [],
          selectedTaskId: null,
          cycles: [],
          members: [],
          conversations: [],
          messages: {},
          activeConversationId: '',
          notifications: [],
          activities: [],
          files: [],
          taskDetailDrawerOpen: false,
        })
      },

      // Current user
      currentUser: EMPTY_USER,

      setCurrentUser: (updates) => {
        const orgId = get().organizationId
        set(state => ({
          currentUser: { ...state.currentUser, ...updates },
          members: state.members.map(m => m.id === state.currentUser.id ? { ...m, ...updates } : m)
        }))
        if (orgId) {
          const nameParts = updates.name?.trim().split(' ')
          userService.updateProfile({
            ...(nameParts ? { firstName: nameParts[0], lastName: nameParts.slice(1).join(' ') || nameParts[0] } : {}),
            phone: updates.phone,
            jobTitle: updates.jobTitle,
            department: updates.department,
            bio: updates.bio,
            timezone: updates.timezone,
          }).catch(() => {
            toast.error('Failed to sync profile changes to server')
          })
        }
      },

      // Organization
      organization: EMPTY_ORGANIZATION,
      updateOrganization: (updates) => {
        const orgId = get().organizationId
        set(state => ({
          organization: { ...state.organization, ...updates }
        }))
        if (orgId) {
          organizationService.updateOrganization(orgId, {
            name: updates.name,
            timezone: updates.timezone,
          }).catch(() => {
            toast.error('Failed to update organization settings')
          })
        }
      },

      // Projects
      projects: [],
      selectedProjectId: null,
      setSelectedProjectId: (id) => set({ selectedProjectId: id }),

      addProject: (newProjectData) => {
        const tempId = `p-${Date.now()}`
        const identifier = newProjectData.identifier?.toUpperCase() || 'PRJ'
        const project: Project = {
          ...newProjectData,
          id: tempId,
          identifier,
          status: newProjectData.status || 'Planning',
          progress: 0,
          startDate: newProjectData.startDate || new Date().toISOString().split('T')[0],
          deadline: newProjectData.deadline || new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]
        }
        set(state => ({
          projects: [project, ...state.projects]
        }))

        const orgId = get().organizationId
        if (orgId) {
          projectService.createProject(orgId, {
            name: project.name,
            key: identifier,
            description: project.description,
            leadId: project.leadId || undefined,
            memberIds: project.memberIds,
            status: mapProjectStatusToApi(project.status),
            startDate: project.startDate,
            endDate: project.deadline,
          }).then((res) => {
            const created = res?.data?.project
            if (created) {
              const mapped = mapProjectToUi(created)
              set(state => ({
                projects: state.projects.map(p => p.id === tempId ? mapped : p)
              }))
            }
          }).catch((err) => {
            toast.error(err?.response?.data?.message || 'Failed to save project to server')
          })
        }
        return project
      },

      updateProject: (id, updates) => {
        set(state => ({
          projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
        }))
        const orgId = get().organizationId
        if (orgId && !id.startsWith('p-')) {
          projectService.updateProject(orgId, id, {
            ...(updates.name !== undefined ? { name: updates.name } : {}),
            ...(updates.description !== undefined ? { description: updates.description } : {}),
            ...(updates.status !== undefined ? { status: mapProjectStatusToApi(updates.status) } : {}),
            ...(updates.deadline !== undefined ? { endDate: updates.deadline } : {}),
          }).catch(() => toast.error('Failed to update project on server'))
        }
      },

      deleteProject: (id) => {
        set(state => ({
          projects: state.projects.filter(proj => proj.id !== id),
          tasks: state.tasks.filter(t => t.projectId !== id),
          selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId
        }))
        const orgId = get().organizationId
        if (orgId && !id.startsWith('p-')) {
          projectService.archiveProject(orgId, id).catch(() => {})
        }
      },

      toggleFavoriteProject: (id) => {
        set(state => ({
          projects: state.projects.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)
        }))
      },

      archiveProject: (id) => {
        set(state => ({
          projects: state.projects.map(p => p.id === id ? { ...p, isArchived: true, status: 'Archived' as ProjectStatus } : p)
        }))
        const orgId = get().organizationId
        if (orgId && !id.startsWith('p-')) {
          projectService.archiveProject(orgId, id).catch(() => toast.error('Failed to archive project'))
        }
      },

      restoreProject: (id) => {
        set(state => ({
          projects: state.projects.map(p => p.id === id ? { ...p, isArchived: false, status: 'Active' as ProjectStatus } : p)
        }))
        const orgId = get().organizationId
        if (orgId && !id.startsWith('p-')) {
          projectService.restoreProject(orgId, id).catch(() => toast.error('Failed to restore project'))
        }
      },

      // Tasks
      tasks: [],
      selectedTaskId: null,
      setSelectedTaskId: (id) => set({ selectedTaskId: id, taskDetailDrawerOpen: Boolean(id) }),

      addTask: (newTaskData) => {
        const tempId = `t-${Date.now()}`
        const project = get().projects.find(p => p.id === newTaskData.projectId)
        const count = get().tasks.filter(t => t.projectId === newTaskData.projectId).length + 101
        const identifier = `${project?.identifier || 'TSK'}-${count}`
        const task: Task = {
          ...newTaskData,
          id: tempId,
          identifier,
          subtasks: newTaskData.subtasks || [],
          comments: newTaskData.comments || [],
          attachments: newTaskData.attachments || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        set(state => ({
          tasks: [task, ...state.tasks]
        }))

        const orgId = get().organizationId
        if (orgId && newTaskData.projectId && !newTaskData.projectId.startsWith('p-')) {
          taskService.createTask(orgId, {
            projectId: newTaskData.projectId,
            title: newTaskData.title,
            description: newTaskData.description,
            status: mapTaskStatusToApi(newTaskData.status),
            priority: mapPriorityToApi(newTaskData.priority),
            assigneeIds: newTaskData.assigneeIds,
            dueDate: newTaskData.dueDate,
            startDate: newTaskData.startDate,
            labels: newTaskData.labels,
            cycleId: newTaskData.cycleId,
          }).then((res) => {
            const created = res?.data?.task
            if (created) {
              const mapped = mapTaskToUi(created)
              set(state => ({
                tasks: state.tasks.map(t => t.id === tempId ? mapped : t),
                selectedTaskId: state.selectedTaskId === tempId ? mapped.id : state.selectedTaskId,
              }))
            }
          }).catch((err) => {
            toast.error(err?.response?.data?.message || 'Failed to save task to server')
          })
        }
        return task
      },

      updateTask: (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)
        }))
        const orgId = get().organizationId
        if (orgId && !id.startsWith('t-')) {
          taskService.updateTask(orgId, id, {
            ...(updates.title !== undefined ? { title: updates.title } : {}),
            ...(updates.description !== undefined ? { description: updates.description } : {}),
            ...(updates.priority !== undefined ? { priority: mapPriorityToApi(updates.priority) } : {}),
            ...(updates.assigneeIds !== undefined ? { assigneeIds: updates.assigneeIds } : {}),
            ...(updates.dueDate !== undefined ? { dueDate: updates.dueDate } : {}),
            ...(updates.labels !== undefined ? { labels: updates.labels } : {}),
          }).catch(() => toast.error('Failed to update task on server'))
        }
      },

      deleteTask: (id) => {
        set(state => ({
          tasks: state.tasks.filter(t => t.id !== id),
          selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
          taskDetailDrawerOpen: state.selectedTaskId === id ? false : state.taskDetailDrawerOpen
        }))
        const orgId = get().organizationId
        if (orgId && !id.startsWith('t-')) {
          taskService.deleteTask(orgId, id).catch(() => toast.error('Failed to delete task on server'))
        }
      },

      updateTaskStatus: (id, status) => {
        const task = get().tasks.find(t => t.id === id)
        if (!task || task.status === status) return
        const prevStatus = task.status
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t)
        }))

        const orgId = get().organizationId
        if (orgId && !id.startsWith('t-')) {
          taskService.updateTaskStatus(orgId, id, mapTaskStatusToApi(status)).catch((err) => {
            // Revert if backend workflow rules reject the transition
            set(state => ({
              tasks: state.tasks.map(t => t.id === id ? { ...t, status: prevStatus } : t)
            }))
            toast.error(err?.response?.data?.message || 'Status transition not allowed')
          })
        }
      },

      updateTaskPriority: (id, priority) => {
        const task = get().tasks.find(t => t.id === id)
        if (!task) return
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, priority, updatedAt: new Date().toISOString() } : t)
        }))
        const orgId = get().organizationId
        if (orgId && !id.startsWith('t-')) {
          taskService.updateTask(orgId, id, { priority: mapPriorityToApi(priority) }).catch(() => {
            toast.error('Failed to update task priority')
          })
        }
      },

      toggleSubtask: (taskId, subtaskId) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id !== taskId) return t
            return {
              ...t,
              subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st)
            }
          })
        }))
      },

      addComment: (taskId, content) => {
        const user = get().currentUser
        const newComment = {
          id: `c-${Date.now()}`,
          authorId: user.id,
          content,
          createdAt: new Date().toISOString()
        }
        set(state => ({
          tasks: state.tasks.map(t => t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t)
        }))
        const orgId = get().organizationId
        if (orgId && !taskId.startsWith('t-')) {
          taskService.addComment(orgId, taskId, content).catch(() => {
            toast.error('Failed to save comment')
          })
        }
      },

      // Cycles
      cycles: [],
      addCycle: (newCycleData) => {
        const tempId = `cyc-${Date.now()}`
        const cycle: ProjectCycle = {
          ...newCycleData,
          id: tempId
        }
        set(state => ({
          cycles: [cycle, ...state.cycles]
        }))
        const orgId = get().organizationId
        if (orgId && newCycleData.projectId) {
          cycleService.createCycle(orgId, {
            projectId: newCycleData.projectId,
            name: newCycleData.name,
            startDate: newCycleData.startDate,
            endDate: newCycleData.endDate,
          }).then((res) => {
            const created = res?.data?.cycle
            if (created) {
              const mapped = mapCycleToUi(created)
              set(state => ({
                cycles: state.cycles.map(c => c.id === tempId ? mapped : c)
              }))
            }
          }).catch(() => toast.error('Failed to create cycle on server'))
        }
      },
      updateCycle: (id, updates) => {
        set(state => ({
          cycles: state.cycles.map(c => c.id === id ? { ...c, ...updates } : c)
        }))
        const orgId = get().organizationId
        if (orgId && !id.startsWith('cyc-')) {
          if (updates.status === 'Active') {
            cycleService.startCycle(orgId, id).catch(() => toast.error('Failed to start cycle'))
          } else if (updates.status === 'Completed') {
            cycleService.completeCycle(orgId, id).catch(() => toast.error('Failed to complete cycle'))
          }
        }
      },

      // Members
      members: [],
      inviteMember: async (email, role) => {
        const orgId = get().organizationId
        if (!orgId) {
          toast.error('Workspace is not ready. Try again after it finishes loading.')
          return false
        }

        try {
          await organizationService.inviteMember(orgId, {
            email,
            role: mapRoleToApi(role),
          })
          return true
        } catch (err) {
          const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          toast.error(message || 'Failed to send invitation')
          return false
        }
      },

      updateMember: (id, updates) => {
        set(state => ({
          members: state.members.map(m => m.id === id ? { ...m, ...updates } : m)
        }))
        const orgId = get().organizationId
        if (orgId && updates.role && !id.startsWith('u-')) {
          organizationService.updateMemberRole(orgId, id, mapRoleToApi(updates.role)).catch(() => {
            toast.error('Failed to update member role')
          })
        }
      },

      removeMember: (id) => {
        set(state => ({
          members: state.members.filter(u => u.id !== id)
        }))
        const orgId = get().organizationId
        if (orgId && !id.startsWith('u-')) {
          organizationService.removeMember(orgId, id).catch(() => {
            toast.error('Failed to remove member')
          })
        }
      },

      // Chat
      conversations: [],
      messages: {},
      activeConversationId: '',
      setActiveConversationId: (id) => set({ activeConversationId: id }),

      sendMessage: (conversationId, content) => {
        const user = get().currentUser
        const tempId = `m-${Date.now()}`
        const newMsg: ChatMessage = {
          id: tempId,
          conversationId,
          senderId: user.id,
          content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        set(state => ({
          messages: {
            ...state.messages,
            [conversationId]: [...(state.messages[conversationId] || []), newMsg]
          },
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage: content,
                  lastMessageTime: 'Just now'
                }
              : c
          )
        }))
        const orgId = get().organizationId
        if (orgId && !conversationId.startsWith('conv-')) {
          chatService.sendMessage(orgId, conversationId, {
            content,
            messageType: 'text',
          }).then((res) => {
            const saved = res?.data?.message
            if (saved) {
              const mapped = mapMessageToUi(saved)
              set(state => ({
                messages: {
                  ...state.messages,
                  [conversationId]: (state.messages[conversationId] || []).map(m =>
                    m.id === tempId ? mapped : m
                  )
                }
              }))
            }
          }).catch(() => toast.error('Failed to send message'))
        }
      },

      deleteMessage: (conversationId, messageId) => {
        set(state => ({
          messages: {
            ...state.messages,
            [conversationId]: (state.messages[conversationId] || []).filter(m => m.id !== messageId)
          }
        }))
        const orgId = get().organizationId
        if (orgId && !messageId.startsWith('m-')) {
          chatService.deleteMessage(orgId, conversationId, messageId).catch(() => {})
        }
      },

      // Notifications
      notifications: [],
      markNotificationRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
        }))
        const orgId = get().organizationId
        if (orgId && !id.startsWith('n-')) {
          notificationService.markAsRead(orgId, id).catch(() => {})
        }
      },
      markAllNotificationsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true }))
        }))
        const orgId = get().organizationId
        if (orgId) {
          notificationService.markAllAsRead(orgId).catch(() => {})
        }
      },
      clearNotification: (id) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      },

      // Activity Feed
      activities: [],

      // Files
      files: [],
      addFile: (fileData, rawFile) => {
        const tempId = `f-${Date.now()}`
        const file: AppFileItem = {
          ...fileData,
          id: tempId,
          uploadedById: get().currentUser.id,
          uploadedAt: new Date().toISOString().split('T')[0]
        }
        set(state => ({
          files: [file, ...state.files]
        }))
        const orgId = get().organizationId
        if (orgId && rawFile) {
          fileService.uploadFile(orgId, rawFile, { projectId: fileData.projectId }).catch(() => {
            toast.error('Failed to upload file to server')
          })
        }
      },
      deleteFile: (id) => {
        set(state => ({
          files: state.files.filter(f => f.id !== id)
        }))
        const orgId = get().organizationId
        if (orgId && !id.startsWith('f-')) {
          fileService.deleteFile(orgId, id).catch(() => toast.error('Failed to delete file'))
        }
      },

      // UI
      sidebarCollapsed: false,
      toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      taskDetailDrawerOpen: false,
      setTaskDetailDrawerOpen: (open) => set({ taskDetailDrawerOpen: open }),
    }),
    {
      name: 'taskflow-pro-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed
      })
    }
  )
)
