import React from 'react'
import { Logo } from '@/components/common/Logo'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Home, Lock } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-canvas text-foreground text-xs select-none">
      <div className="w-full max-w-md p-8 rounded-lg border border-border bg-surface shadow-xs text-center space-y-4">
        <Logo className="justify-center mb-2" />
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold font-heading">404 — Page Not Found</h1>
        <p className="text-muted-foreground leading-relaxed">
          The requested task, project workspace, or dashboard URL does not exist or has been archived.
        </p>

        <div className="pt-2 flex justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Go Back
          </Button>
          <Button size="sm" onClick={() => navigate('/app/dashboard')} className="bg-[#086F83] text-white">
            <Home className="w-3.5 h-3.5 mr-1" />
            Workspace Overview
          </Button>
        </div>
      </div>
    </div>
  )
}

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-canvas text-foreground text-xs select-none">
      <div className="w-full max-w-md p-8 rounded-lg border border-border bg-surface shadow-xs text-center space-y-4">
        <Logo className="justify-center mb-2" />
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 mx-auto flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold font-heading">Access Denied</h1>
        <p className="text-muted-foreground leading-relaxed">
          Your account does not have permission to view this section. Contact your organization administrator if you need access.
        </p>

        <div className="pt-2">
          <Button size="sm" onClick={() => navigate('/app/dashboard')} className="bg-[#086F83] text-white">
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
