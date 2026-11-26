// ─── Analytics Service ─────────────────────────────────────────────────────────
import api from './api'

export const analyticsService = {
  async getOverview(orgId: string) {
    const { data } = await api.get(`/organizations/${orgId}/dashboard/overview`)
    return data
  },

  async getWorkload(orgId: string) {
    const { data } = await api.get(`/organizations/${orgId}/reports/workload`)
    return data
  },

  async getWeeklyActivity(orgId: string) {
    const { data } = await api.get(`/organizations/${orgId}/reports/weekly-activity`)
    return data
  },

  async getActivity(orgId: string, params?: { page?: number; limit?: number; projectId?: string }) {
    const { data } = await api.get(`/organizations/${orgId}/activity`, { params })
    return data
  },

  async getCalendarEvents(orgId: string) {
    const { data } = await api.get(`/organizations/${orgId}/calendar/events`)
    return data
  },

  async createCalendarEvent(orgId: string, payload: Record<string, unknown>) {
    const { data } = await api.post(`/organizations/${orgId}/calendar/events`, payload)
    return data
  },
}
