// ─── Cycle Service ─────────────────────────────────────────────────────────────
import api from './api'

export const cycleService = {
  async getCycles(orgId: string, projectId?: string) {
    const { data } = await api.get(`/organizations/${orgId}/cycles`, {
      params: projectId ? { projectId } : undefined,
    })
    return data
  },

  async getCycle(orgId: string, cycleId: string) {
    const { data } = await api.get(`/organizations/${orgId}/cycles/${cycleId}`)
    return data
  },

  async createCycle(orgId: string, payload: {
    projectId: string
    name: string
    description?: string
    goal?: string
    startDate: string
    endDate: string
  }) {
    const { data } = await api.post(`/organizations/${orgId}/cycles`, payload)
    return data
  },

  async startCycle(orgId: string, cycleId: string) {
    const { data } = await api.post(`/organizations/${orgId}/cycles/${cycleId}/start`)
    return data
  },

  async completeCycle(orgId: string, cycleId: string) {
    const { data } = await api.post(`/organizations/${orgId}/cycles/${cycleId}/complete`)
    return data
  },

  async getBurndown(orgId: string, cycleId: string) {
    const { data } = await api.get(`/organizations/${orgId}/cycles/${cycleId}/burndown`)
    return data
  },
}
