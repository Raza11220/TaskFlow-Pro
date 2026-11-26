// ─── Organization Service ──────────────────────────────────────────────────────
import api from './api'

export const organizationService = {
  async getMyOrganizations() {
    const { data } = await api.get('/organizations')
    return data
  },

  async getOrganization(orgId: string) {
    const { data } = await api.get(`/organizations/${orgId}`)
    return data
  },

  async createOrganization(payload: {
    name: string
    slug?: string
    description?: string
    industry?: string
    teamSize?: string
    timezone?: string
  }) {
    const { data } = await api.post('/organizations', payload)
    return data
  },

  async updateOrganization(orgId: string, payload: Record<string, unknown>) {
    const { data } = await api.patch(`/organizations/${orgId}`, payload)
    return data
  },

  // Members
  async getMembers(orgId: string, params?: { page?: number; limit?: number }) {
    const { data } = await api.get(`/organizations/${orgId}/members`, { params })
    return data
  },

  async inviteMember(orgId: string, payload: { email: string; role: string }) {
    const { data } = await api.post(`/organizations/${orgId}/invitations`, payload)
    return data
  },

  async acceptInvitation(token: string) {
    const { data } = await api.post('/organizations/invitations/accept', { token })
    return data
  },

  async updateMemberRole(orgId: string, memberId: string, role: string) {
    const { data } = await api.patch(`/organizations/${orgId}/members/${memberId}/role`, { role })
    return data
  },

  async removeMember(orgId: string, memberId: string) {
    const { data } = await api.delete(`/organizations/${orgId}/members/${memberId}`)
    return data
  },

  async getInvitations(orgId: string) {
    const { data } = await api.get(`/organizations/${orgId}/invitations`)
    return data
  },

  async cancelInvitation(orgId: string, invitationId: string) {
    const { data } = await api.delete(`/organizations/${orgId}/invitations/${invitationId}`)
    return data
  },
}
