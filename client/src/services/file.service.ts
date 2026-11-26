// ─── File Service ──────────────────────────────────────────────────────────────
import api from './api'

export const fileService = {
  async getFiles(orgId: string, params?: { projectId?: string; taskId?: string; page?: number; limit?: number }) {
    const { data } = await api.get(`/organizations/${orgId}/files`, { params })
    return data
  },

  async uploadFile(orgId: string, file: File, meta: { projectId?: string; taskId?: string }) {
    const form = new FormData()
    form.append('file', file)
    if (meta.projectId) form.append('projectId', meta.projectId)
    if (meta.taskId) form.append('taskId', meta.taskId)
    const { data } = await api.post(`/organizations/${orgId}/files/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async deleteFile(orgId: string, fileId: string) {
    const { data } = await api.delete(`/organizations/${orgId}/files/${fileId}`)
    return data
  },
}
