// ─── Backend ↔ Frontend Data Mappers ───────────────────────────────────────────
import type {
  User,
  UserRole,
  Project,
  ProjectStatus,
  Task,
  TaskStatus,
  TaskPriority,
  ProjectCycle,
  CycleStatus,
  NotificationItem,
  ActivityItem,
  ChatConversation,
  ChatMessage,
  AppFileItem,
} from '@/types'

const idOf = (val: unknown): string => {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object' && val !== null) {
    const obj = val as { _id?: unknown; id?: unknown }
    if (obj._id) return String(obj._id)
    if (obj.id) return String(obj.id)
  }
  return String(val)
}

// ── Role Mappers ───────────────────────────────────────────────────────────────
export const mapRoleToUi = (role?: string): UserRole => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'Admin'
    case 'project_manager':
    case 'project manager':
      return 'Project Manager'
    default:
      return 'Employee'
  }
}

export const mapRoleToApi = (role?: string): 'admin' | 'project_manager' | 'employee' => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'admin'
    case 'project manager':
    case 'project_manager':
      return 'project_manager'
    default:
      return 'employee'
  }
}

// ── Task Status & Priority Mappers ─────────────────────────────────────────────
export const mapTaskStatusToUi = (status?: string): TaskStatus => {
  switch (status?.toLowerCase()) {
    case 'backlog':
      return 'Backlog'
    case 'todo':
    case 'to do':
      return 'To Do'
    case 'in_progress':
    case 'in progress':
      return 'In Progress'
    case 'review':
      return 'Review'
    case 'done':
      return 'Done'
    case 'cancelled':
      return 'Cancelled'
    default:
      return 'To Do'
  }
}

export const mapTaskStatusToApi = (
  status?: string
): 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled' => {
  switch (status?.toLowerCase()) {
    case 'backlog':
      return 'backlog'
    case 'to do':
    case 'todo':
      return 'todo'
    case 'in progress':
    case 'in_progress':
      return 'in_progress'
    case 'review':
      return 'review'
    case 'done':
      return 'done'
    case 'cancelled':
      return 'cancelled'
    default:
      return 'todo'
  }
}

export const mapPriorityToUi = (priority?: string): TaskPriority => {
  switch (priority?.toLowerCase()) {
    case 'urgent':
      return 'Urgent'
    case 'high':
      return 'High'
    case 'low':
      return 'Low'
    default:
      return 'Medium'
  }
}

export const mapPriorityToApi = (
  priority?: string
): 'urgent' | 'high' | 'medium' | 'low' | 'none' => {
  switch (priority?.toLowerCase()) {
    case 'urgent':
      return 'urgent'
    case 'high':
      return 'high'
    case 'low':
      return 'low'
    case 'none':
      return 'none'
    default:
      return 'medium'
  }
}

// ── Project Status Mappers ─────────────────────────────────────────────────────
export const mapProjectStatusToUi = (status?: string, archivedAt?: unknown): ProjectStatus => {
  if (archivedAt) return 'Archived'
  switch (status?.toLowerCase()) {
    case 'planned':
    case 'planning':
      return 'Planning'
    case 'active':
      return 'Active'
    case 'on_hold':
      return 'At Risk'
    case 'completed':
      return 'Completed'
    case 'cancelled':
      return 'Delayed'
    default:
      return 'Active'
  }
}

export const mapProjectStatusToApi = (
  status?: string
): 'planned' | 'active' | 'on_hold' | 'completed' | 'cancelled' => {
  switch (status?.toLowerCase()) {
    case 'planning':
    case 'planned':
      return 'planned'
    case 'at risk':
    case 'on_hold':
      return 'on_hold'
    case 'completed':
      return 'completed'
    case 'delayed':
    case 'cancelled':
      return 'cancelled'
    default:
      return 'active'
  }
}

// ── Cycle Status Mapper ────────────────────────────────────────────────────────
export const mapCycleStatusToUi = (status?: string): CycleStatus => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'Active'
    case 'completed':
      return 'Completed'
    default:
      return 'Upcoming'
  }
}

// ── Document Mappers ───────────────────────────────────────────────────────────
export const mapUserToUi = (raw: Record<string, unknown>, roleOverride?: string): User => {
  const userObj = (raw.userId && typeof raw.userId === 'object' ? raw.userId : raw) as Record<
    string,
    unknown
  >
  const first = String(userObj.firstName || '')
  const last = String(userObj.lastName || '')
  const name = String(userObj.fullName || userObj.name || `${first} ${last}`.trim())
  const presenceStatus = userObj.presenceStatus

  return {
    id: idOf(userObj._id || userObj.id),
    name,
    email: String(userObj.email || ''),
    avatar: String(userObj.avatar || ''),
    role: mapRoleToUi(roleOverride || String(raw.role || userObj.role || 'employee')),
    department: String(raw.department || userObj.department || ''),
    jobTitle: String(userObj.jobTitle || ''),
    phone: String(userObj.phone || ''),
    timezone: String(userObj.timezone || ''),
    bio: String(userObj.bio || ''),
    status: presenceStatus === 'Active' || presenceStatus === 'Away' ? presenceStatus : 'Offline',
    activeTasksCount: Number(raw.activeTasksCount || 0),
    workloadPercentage: Number(raw.workloadPercentage || 0),
  }
}

export const mapProjectToUi = (raw: Record<string, unknown>): Project => {
  const start = raw.startDate ? String(raw.startDate).split('T')[0] : ''
  const end = raw.endDate ? String(raw.endDate).split('T')[0] : ''
  const memberIds = Array.isArray(raw.memberIds) ? raw.memberIds.map(idOf) : []

  return {
    id: idOf(raw._id || raw.id),
    name: String(raw.name || ''),
    identifier: String(raw.key || raw.identifier || ''),
    description: String(raw.description || ''),
    leadId: idOf(raw.leadId || raw.ownerId || raw.createdBy),
    memberIds,
    status: mapProjectStatusToUi(String(raw.status || 'active'), raw.archivedAt),
    progress: Number(raw.progress ?? 0),
    startDate: start,
    deadline: end,
    isFavorite: Boolean(raw.isFavorite),
    isArchived: Boolean(raw.archivedAt),
    category: raw.category ? String(raw.category) : undefined,
  }
}

export const mapTaskToUi = (raw: Record<string, unknown>): Task => {
  const assigneeIds = Array.isArray(raw.assigneeIds) ? raw.assigneeIds.map(idOf) : []
  const dueDate = raw.dueDate
    ? String(raw.dueDate).split('T')[0]
    : ''

  const mins = Number(raw.estimatedMinutes || 0)
  const estimatedEffort = mins > 0 ? (mins >= 60 ? `${Math.round(mins / 60)}h` : `${mins}m`) : undefined

  return {
    id: idOf(raw._id || raw.id),
    identifier: String(raw.identifier || ''),
    title: String(raw.title || ''),
    description: String(raw.description || ''),
    status: mapTaskStatusToUi(String(raw.status || 'todo')),
    priority: mapPriorityToUi(String(raw.priority || 'medium')),
    projectId: idOf(raw.projectId),
    assigneeIds,
    creatorId: idOf(raw.createdBy),
    dueDate,
    startDate: raw.startDate ? String(raw.startDate).split('T')[0] : undefined,
    labels: Array.isArray(raw.labels) ? raw.labels.map(String) : [],
    estimatedEffort,
    cycleId: raw.cycleId ? idOf(raw.cycleId) : undefined,
    subtasks: Array.isArray(raw.subtasks) ? (raw.subtasks as Task['subtasks']) : [],
    comments: Array.isArray(raw.comments) ? (raw.comments as Task['comments']) : [],
    attachments: Array.isArray(raw.attachments) ? (raw.attachments as Task['attachments']) : [],
    createdAt: String(raw.createdAt || ''),
    updatedAt: String(raw.updatedAt || ''),
    order: typeof raw.position === 'number' ? raw.position : undefined,
  }
}

export const mapCycleToUi = (raw: Record<string, unknown>): ProjectCycle => ({
  id: idOf(raw._id || raw.id),
  name: String(raw.name || ''),
  projectId: idOf(raw.projectId),
  status: mapCycleStatusToUi(String(raw.status || 'planned')),
  startDate: raw.startDate ? String(raw.startDate).split('T')[0] : '',
  endDate: raw.endDate ? String(raw.endDate).split('T')[0] : '',
  totalTasks: Number(raw.totalTasks ?? raw.initialScope ?? 0),
  completedTasks: Number(raw.completedTasks ?? 0),
  assignedTaskIds: Array.isArray(raw.assignedTaskIds) ? raw.assignedTaskIds.map(idOf) : [],
})

export const mapConversationToUi = (raw: Record<string, unknown>): ChatConversation => ({
  id: idOf(raw._id || raw.id),
  name: String(raw.name || ''),
  type: raw.type === 'direct' ? 'direct' : 'channel',
  participantIds: Array.isArray(raw.memberIds) ? raw.memberIds.map(idOf) : [],
  lastMessage: raw.lastMessage ? String(raw.lastMessage) : undefined,
  lastMessageTime: raw.lastMessageAt
    ? new Date(String(raw.lastMessageAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : undefined,
  unreadCount: Number(raw.unreadCount || 0),
  description: raw.description ? String(raw.description) : undefined,
})

export const mapMessageToUi = (raw: Record<string, unknown>): ChatMessage => {
  const voice = (raw.voiceData || {}) as { audioUrl?: string; duration?: number }
  return {
    id: idOf(raw._id || raw.id),
    conversationId: idOf(raw.conversationId),
    senderId: idOf(raw.senderId),
    content: String(raw.content || ''),
    timestamp: raw.createdAt
      ? new Date(String(raw.createdAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
    replyToId: raw.replyToMessageId ? idOf(raw.replyToMessageId) : undefined,
    attachments: Array.isArray(raw.attachments)
      ? (raw.attachments as ChatMessage['attachments'])
      : undefined,
    isVoice: raw.messageType === 'voice' || Boolean(voice.audioUrl),
    audioUrl: voice.audioUrl,
    audioDuration: voice.duration,
  }
}

export const mapNotificationToUi = (raw: Record<string, unknown>): NotificationItem => ({
  id: idOf(raw._id || raw.id),
  title: String(raw.title || 'Notification'),
  message: String(raw.message || ''),
  type: (raw.type as NotificationItem['type']) || 'task_update',
  read: Boolean(raw.readAt),
  createdAt: raw.createdAt ? new Date(String(raw.createdAt)).toLocaleString() : '',
  targetType: raw.entityType as NotificationItem['targetType'],
  targetId: raw.entityId ? idOf(raw.entityId) : undefined,
})

export const mapActivityToUi = (raw: Record<string, unknown>): ActivityItem => ({
  id: idOf(raw._id || raw.id),
  actorId: idOf(raw.actorId),
  action: (raw.action as ActivityItem['action']) || 'created_task',
  description: String(raw.description || raw.action || ''),
  projectId: raw.projectId ? idOf(raw.projectId) : undefined,
  taskId: raw.taskId ? idOf(raw.taskId) : undefined,
  timestamp: raw.createdAt ? new Date(String(raw.createdAt)).toLocaleString() : '',
})

export const mapFileToUi = (raw: Record<string, unknown>): AppFileItem => ({
  id: idOf(raw._id || raw.id),
  name: String(raw.originalName || raw.filename || raw.name || ''),
  size: Number(raw.size || 0),
  type: String(raw.mimeType || raw.type || 'application/octet-stream'),
  projectId: raw.projectId ? idOf(raw.projectId) : undefined,
  uploadedById: idOf(raw.uploadedBy),
  uploadedAt: raw.createdAt
    ? String(raw.createdAt).split('T')[0]
    : '',
  url: raw.url ? String(raw.url) : undefined,
})
