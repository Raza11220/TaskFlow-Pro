export type UserRole = 'Admin' | 'Project Manager' | 'Employee'

export type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'Review' | 'Done' | 'Cancelled'
export type TaskPriority = 'Urgent' | 'High' | 'Medium' | 'Low'

export type ProjectStatus = 'Planning' | 'Active' | 'On Track' | 'At Risk' | 'Delayed' | 'Completed' | 'Archived'

export type CycleStatus = 'Upcoming' | 'Active' | 'Completed'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: UserRole
  department: string
  jobTitle: string
  phone: string
  timezone: string
  bio: string
  status: 'Active' | 'Offline' | 'Away'
  activeTasksCount: number
  workloadPercentage: number
}

export interface Project {
  id: string
  name: string
  identifier: string // e.g. MED, CRM, FIN
  description: string
  leadId: string
  memberIds: string[]
  status: ProjectStatus
  progress: number
  startDate: string
  deadline: string
  isFavorite?: boolean
  isArchived?: boolean
  category?: string
}

export interface SubTask {
  id: string
  title: string
  completed: boolean
}

export interface TaskComment {
  id: string
  authorId: string
  content: string
  createdAt: string
}

export interface TaskAttachment {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
  url?: string
}

export interface Task {
  id: string
  identifier: string // e.g. MED-101
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  assigneeIds: string[]
  creatorId: string
  dueDate: string
  startDate?: string
  labels: string[]
  estimatedEffort?: string // e.g. '8h', '2d'
  cycleId?: string
  subtasks: SubTask[]
  comments: TaskComment[]
  attachments: TaskAttachment[]
  createdAt: string
  updatedAt: string
  order?: number
}

export interface ProjectCycle {
  id: string
  name: string
  projectId: string
  status: CycleStatus
  startDate: string
  endDate: string
  totalTasks: number
  completedTasks: number
  assignedTaskIds: string[]
  burndownHistory?: {
    day: string
    idealRemaining: number
    actualRemaining: number
    completed: number
    totalScope: number
  }[]
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'mention' | 'task_update' | 'project_update' | 'invitation' | 'deadline'
  read: boolean
  createdAt: string
  targetType?: 'task' | 'project' | 'member'
  targetId?: string
}

export interface ActivityItem {
  id: string
  actorId: string
  action: 'created_task' | 'status_changed' | 'assigned_task' | 'updated_project' | 'invited_member' | 'added_comment' | 'completed_cycle'
  description: string
  projectId?: string
  taskId?: string
  timestamp: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  timestamp: string
  replyToId?: string
  attachments?: { name: string; size: number; url?: string }[]
  isVoice?: boolean
  audioUrl?: string
  audioDuration?: number // in seconds
}

export interface ChatConversation {
  id: string
  name: string
  type: 'channel' | 'direct'
  participantIds: string[]
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  description?: string
  topic?: string
}

export interface AppFileItem {
  id: string
  name: string
  size: number
  type: string
  projectId?: string
  uploadedById: string
  uploadedAt: string
  url?: string
}

export interface OrganizationSettings {
  name: string
  domain: string
  location: string
  timezone: string
  logoUrl?: string
  dateFormat: string
  compactDensity: boolean
  theme: 'light' | 'dark' | 'system'
}
