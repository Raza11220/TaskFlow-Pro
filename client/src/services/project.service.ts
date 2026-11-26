// ─── Project Service ───────────────────────────────────────────────────────────
import api from './api'

export const projectService = {
  async getProjects(orgId: string, params?: { status?: string; page?: number; limit?: number }) {
    const { data } = await api.get(`/organizations/${orgId}/projects`, { params })
    return data
  },

  async getProject(orgId: string, projectId: string) {
    const { data } = await api.get(`/organizations/${orgId}/projects/${projectId}`)
    return data
  },

  async createProject(orgId: string, payload: {
    name: string
    key: string
    description?: string
    icon?: string
    color?: string
    leadId?: string
    memberIds?: string[]
    status?: string
    priority?: string
    startDate?: string
    endDate?: string
  }) {
    const { data } = await api.post(`/organizations/${orgId}/projects`, payload)
    return data
  },

  async updateProject(orgId: string, projectId: string, payload: Record<string, unknown>) {
    const { data } = await api.patch(`/organizations/${orgId}/projects/${projectId}`, payload)
    return data
  },

  async archiveProject(orgId: string, projectId: string) {
    const { data } = await api.post(`/organizations/${orgId}/projects/${projectId}/archive`)
    return data
  },

  async restoreProject(orgId: string, projectId: string) {
    const { data } = await api.post(`/organizations/${orgId}/projects/${projectId}/restore`)
    return data
  },
}
