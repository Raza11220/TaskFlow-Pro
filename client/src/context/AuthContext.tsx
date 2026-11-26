// ─── Auth Context ──────────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { authService, AuthUser } from '@/services/auth.service'
import { organizationService } from '@/services/organization.service'
import { connectSocket, disconnectSocket } from '@/services/socket'
import { toast } from 'sonner'

interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
}

interface OrganizationRecord {
  id?: string
  _id?: string
  name?: string
  slug?: string
  logo?: string
}

const normalizeOrganization = (record?: OrganizationRecord | null): Organization | null => {
  const id = record?.id || record?._id
  if (!record || !id) return null

  return {
    id,
    name: record.name || '',
    slug: record.slug || '',
    ...(record.logo ? { logo: record.logo } : {}),
  }
}

interface AuthContextValue {
  user: AuthUser | null
  organization: Organization | null
  organizationId: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; hasOrganization: boolean }>
  logout: () => Promise<void>
  updateUser: (updates: Partial<AuthUser>) => void
  setOrganization: (org: Organization) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [organization, setOrganizationState] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const organizationId = organization?.id ?? null

  // ── Bootstrap: check if already logged in via cookie ────────────────────────
  const bootstrap = useCallback(async () => {
    try {
      // /auth/me returns the authenticated user if cookie session is valid
      const meRes = await authService.me()
      if (meRes.success && meRes.data?.user) {
        setUser(meRes.data.user)
        // Fetch first organization
        try {
          const orgRes = await organizationService.getMyOrganizations()
          const orgs = orgRes?.data?.organizations || []
          const firstOrganization = normalizeOrganization(orgs[0])
          if (firstOrganization) {
            setOrganizationState(firstOrganization)
            connectSocket(firstOrganization.id)
          }
        } catch {
          // No org yet — that's fine
        }
      }
    } catch {
      // No valid session — user needs to log in
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    bootstrap()
    return () => {
      disconnectSocket()
    }
  }, [bootstrap])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await authService.login({ email, password })
      if (res.success && res.data?.user) {
        setUser(res.data.user)
        if (res.data?.organization) {
          setOrganizationState(res.data.organization)
          connectSocket(res.data.organization.id)
        } else {
          // Try to fetch org
          try {
            const orgRes = await organizationService.getMyOrganizations()
            const orgs = orgRes?.data?.organizations || []
            const firstOrganization = normalizeOrganization(orgs[0])
            if (firstOrganization) {
              setOrganizationState(firstOrganization)
              connectSocket(firstOrganization.id)
            }
          } catch {
            // ignore
          }
        }
        return true
      }
      return false
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed. Check your credentials.'
      toast.error(msg)
      return false
    }
  }, [])

  const loginWithGoogle = useCallback(async (credential: string) => {
    try {
      const res = await authService.loginWithGoogle(credential)
      if (!res.success || !res.data?.user) {
        return { success: false, hasOrganization: false }
      }

      setUser(res.data.user)
      const firstOrganization = normalizeOrganization(
        res.data.organizations?.[0]?.organization
      )
      if (firstOrganization) {
        setOrganizationState(firstOrganization)
        connectSocket(firstOrganization.id)
        return { success: true, hasOrganization: true }
      }

      return { success: true, hasOrganization: false }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Google sign-in failed. Please try again.'
      toast.error(msg)
      return { success: false, hasOrganization: false }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // ignore
    }
    disconnectSocket()
    setUser(null)
    setOrganizationState(null)
  }, [])

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser(prev => (prev ? { ...prev, ...updates } : prev))
  }, [])

  const setOrganization = useCallback((org: Organization) => {
    setOrganizationState(org)
    connectSocket(org.id)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const res = await authService.me()
      if (res?.data?.user) setUser(res.data.user)
    } catch {
      // ignore
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        organizationId,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        logout,
        updateUser,
        setOrganization,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
