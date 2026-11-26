// ─── Task Service ──────────────────────────────────────────────────────────────
import api from './api'

export const taskService = {
  async getTasks(orgId: string, params?: {
    projectId?: string
    assigneeId?: string
    status?: string
    priority?: string
    cycleId?: string
    page?: number
    limit?: number
  }) {
    const { data } = await api.get(`/organizations/${orgId}/tasks`, { params })
    return data
  },

  async getTask(orgId: string, taskId: string) {
    const { data } = await api.get(`/organizations/${orgId}/tasks/${taskId}`)
    return data
  },

  async createTask(orgId: string, payload: {
    projectId: string
    title: string
    description?: string
    status?: string
    priority?: string
    assigneeIds?: string[]
    dueDate?: string
    startDate?: string
    labels?: string[]
    estimatedMinutes?: number
    cycleId?: string
    parentTaskId?: string
  }) {
    const { data } = await api.post(`/organizations/${orgId}/tasks`, payload)
    return data
  },

  async updateTask(orgId: string, taskId: string, payload: Record<string, unknown>) {
    const { data } = await api.patch(`/organizations/${orgId}/tasks/${taskId}`, payload)
    return data
  },

  async updateTaskStatus(orgId: string, taskId: string, status: string) {
    const { data } = await api.patch(`/organizations/${orgId}/tasks/${taskId}/status`, { status })
    return data
  },

  async deleteTask(orgId: string, taskId: string) {
    const { data } = await api.delete(`/organizations/${orgId}/tasks/${taskId}`)
    return data
  },

  async bulkUpdateTasks(orgId: string, taskIds: string[], updates: Record<string, unknown>) {
    const { data } = await api.post(`/organizations/${orgId}/tasks/bulk-update`, { taskIds, updates })
    return data
  },

  // Kanban Board
  async getBoard(orgId: string, projectId: string) {
    const { data } = await api.get(`/organizations/${orgId}/projects/${projectId}/board`)
    return data
  },

  async reorderBoard(orgId: string, projectId: string, updates: Array<{ taskId: string; status: string; position: number }>) {
    const { data } = await api.patch(`/organizations/${orgId}/projects/${projectId}/board/reorder`, { updates })
    return data
  },

  // Comments
  async getComments(orgId: string, taskId: string) {
    const { data } = await api.get(`/organizations/${orgId}/tasks/${taskId}/comments`)
    return data
  },

  async addComment(orgId: string, taskId: string, content: string) {
    const { data } = await api.post(`/organizations/${orgId}/tasks/${taskId}/comments`, { content })
    return data
  },

  async deleteComment(orgId: string, _taskId: string, commentId: string) {
    const { data } = await api.delete(`/organizations/${orgId}/comments/${commentId}`)
    return data
  },
}
