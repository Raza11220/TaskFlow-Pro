import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppLayout } from '@/layouts/AppLayout'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/common/ProtectedRoute'

// Pages
import { LandingPage } from '@/pages/landing/LandingPage'
import {
  LoginPage,
  SignupPage,
  ForgotPasswordPage,
  OnboardingPage
} from '@/pages/auth/AuthPages'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ProjectsPage } from '@/pages/projects/ProjectsPage'
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage'
import { MyTasksPage } from '@/pages/tasks/MyTasksPage'
import { KanbanBoardPage } from '@/pages/kanban/KanbanBoardPage'
import { CyclesPage } from '@/pages/cycles/CyclesPage'
import { TimelinePage } from '@/pages/timeline/TimelinePage'
import { CalendarPage } from '@/pages/calendar/CalendarPage'
import { TeamChatPage } from '@/pages/chat/TeamChatPage'
import { TeamMembersPage } from '@/pages/team/TeamMembersPage'
import { ReportsPage } from '@/pages/reports/ReportsPage'
import { InboxPage } from '@/pages/inbox/InboxPage'
import { FilesPage } from '@/pages/files/FilesPage'
import { ActivityPage } from '@/pages/activity/ActivityPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { UserProfilePage } from '@/pages/profile/UserProfilePage'
import { NotFoundPage, AccessDeniedPage } from '@/pages/errors/ErrorPages'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public Marketing */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth routes — redirect to dashboard if already logged in */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

        {/* Protected App Workspace Routes */}
        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="tasks" element={<MyTasksPage />} />
          <Route path="board" element={<KanbanBoardPage />} />
          <Route path="cycles" element={<CyclesPage />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="chat" element={<TeamChatPage />} />
          <Route path="team" element={<TeamMembersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="access-denied" element={<AccessDeniedPage />} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
