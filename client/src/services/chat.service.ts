// ─── Chat Service ──────────────────────────────────────────────────────────────
import api from './api'

export const chatService = {
  async getConversations(orgId: string) {
    const { data } = await api.get(`/organizations/${orgId}/conversations`)
    return data
  },

  async createConversation(orgId: string, payload: {
    type: 'direct' | 'group' | 'channel'
    memberIds: string[]
    name?: string
    description?: string
  }) {
    const { data } = await api.post(`/organizations/${orgId}/conversations`, payload)
    return data
  },

  async getMessages(orgId: string, conversationId: string, params?: { page?: number; limit?: number }) {
    const { data } = await api.get(`/organizations/${orgId}/conversations/${conversationId}/messages`, { params })
    return data
  },

  async sendMessage(orgId: string, conversationId: string, payload: {
    content: string
    messageType?: string
    replyToMessageId?: string
    audioUrl?: string
    audioDuration?: number
  }) {
    const { data } = await api.post(`/organizations/${orgId}/conversations/${conversationId}/messages`, payload)
    return data
  },

  async markAsRead(orgId: string, conversationId: string) {
    const { data } = await api.post(`/organizations/${orgId}/conversations/${conversationId}/read`)
    return data
  },

  async deleteMessage(orgId: string, conversationId: string, messageId: string) {
    const { data } = await api.delete(`/organizations/${orgId}/conversations/${conversationId}/messages/${messageId}`)
    return data
  },
}
