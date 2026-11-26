// ─── Protected Route Guard ─────────────────────────────────────────────────────
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, organizationId } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#086F83] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading TaskFlow Pro…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!organizationId && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" state={{ from: location }} replace />
  }

  if (organizationId && location.pathname === '/onboarding') {
    return <Navigate to="/app/dashboard" replace />
  }

  return <>{children}</>
}

export const PublicOnlyRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, organizationId } = useAuth()

  if (isLoading) return null

  if (isAuthenticated) {
    return <Navigate to={organizationId ? '/app/dashboard' : '/onboarding'} replace />
  }

  return <>{children}</>
}
