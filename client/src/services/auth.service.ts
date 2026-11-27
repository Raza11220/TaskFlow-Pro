// ─── Auth Service ──────────────────────────────────────────────────────────────
import api, { refreshAccessToken } from './api'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  role?: string
  jobTitle?: string
  department?: string
  phone?: string
  timezone?: string
  bio?: string
  emailVerified?: boolean
}

export interface AuthResponse {
  success: boolean
  data: {
    user: AuthUser
    organization?: {
      id: string
      name: string
      slug: string
      logo?: string
    }
    organizations?: Array<{
      organization: {
        id?: string
        _id?: string
        name: string
        slug: string
        logo?: string
      }
      role: string
    }>
  }
  message?: string
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    return data
  },

  async loginWithGoogle(credential: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/google', { credential })
    return data
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    return data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async refresh(): Promise<string> {
    return refreshAccessToken()
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data
  },

  async resetPassword(token: string, password: string): Promise<{ success: boolean }> {
    const { data } = await api.post('/auth/reset-password', { token, password })
    return data
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    const { data } = await api.post('/auth/change-password', { currentPassword, newPassword })
    return data
  },

  async me(): Promise<AuthResponse> {
    const { data } = await api.get<AuthResponse>('/auth/me')
    return data
  },

  async getSessions(): Promise<{ success: boolean; data: { sessions: unknown[] } }> {
    const { data } = await api.get('/auth/sessions')
    return data
  },

  async deleteSession(sessionId: string): Promise<void> {
    await api.delete(`/auth/sessions/${sessionId}`)
  },
}
