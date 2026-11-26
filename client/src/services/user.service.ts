// ─── User Service ──────────────────────────────────────────────────────────────
import api from './api'

export const userService = {
  async getProfile() {
    const { data } = await api.get('/users/me')
    return data
  },

  async updateProfile(payload: {
    firstName?: string
    lastName?: string
    phone?: string
    jobTitle?: string
    department?: string
    bio?: string
    timezone?: string
  }) {
    const { data } = await api.patch('/users/me', payload)
    return data
  },

  async updatePreferences(preferences: Record<string, unknown>) {
    const { data } = await api.patch('/users/me/preferences', preferences)
    return data
  },

  async uploadAvatar(file: File) {
    const form = new FormData()
    form.append('avatar', file)
    const { data } = await api.post('/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async globalSearch(orgId: string, query: string) {
    const { data } = await api.get(`/organizations/${orgId}/search`, { params: { q: query } })
    return data
  },
}
