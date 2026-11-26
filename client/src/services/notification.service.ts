// ─── Notification Service ──────────────────────────────────────────────────────
import api from './api'

export const notificationService = {
  async getNotifications(orgId: string, params?: { page?: number; limit?: number; unreadOnly?: boolean }) {
    const { data } = await api.get(`/organizations/${orgId}/notifications`, { params })
    return data
  },

  async markAsRead(orgId: string, notificationId: string) {
    const { data } = await api.patch(`/organizations/${orgId}/notifications/${notificationId}/read`)
    return data
  },

  async markAllAsRead(orgId: string) {
    const { data } = await api.patch(`/organizations/${orgId}/notifications/read-all`)
    return data
  },

  async deleteNotification(orgId: string, notificationId: string) {
    const { data } = await api.delete(`/organizations/${orgId}/notifications/${notificationId}`)
    return data
  },
}
