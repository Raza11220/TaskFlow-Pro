import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { GlobalTopBar } from '@/components/layout/GlobalTopBar'
import { PrimaryRail } from '@/components/layout/PrimaryRail'
import { WorkspaceSidebar } from '@/components/layout/WorkspaceSidebar'
import { CommandPalette } from '@/components/common/CommandPalette'
import { TaskDetailDrawer } from '@/components/common/TaskDetailDrawer'
import { TaskCreateDialog, ProjectCreateDialog } from '@/components/common/AppModals'
import { WorkspaceSync } from '@/components/common/WorkspaceSync'

export const AppLayout: React.FC = () => {
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [createProjectOpen, setCreateProjectOpen] = useState(false)

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden fixed inset-0">
      <WorkspaceSync />
      {/* 52px Fixed Top Navigation Bar - Stays firmly locked at the top */}
      <GlobalTopBar onOpenCreateTask={() => setCreateTaskOpen(true)} />

      {/* Main Multi-level Viewport Area: fills exact remaining height */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Primary Icon Rail: locked on the left */}
        <PrimaryRail />

        {/* Collapsible Workspace Sidebar: independently scrollable, fixed position */}
        <WorkspaceSidebar
          onOpenCreateTask={() => setCreateTaskOpen(true)}
          onOpenCreateProject={() => setCreateProjectOpen(true)}
        />

        {/* Main Routed Content: independently scrollable viewport */}
        <main className="flex-1 overflow-y-auto bg-canvas relative focus:outline-none custom-scroll">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette (Ctrl/Cmd + K) */}
      <CommandPalette
        onOpenCreateTask={() => setCreateTaskOpen(true)}
        onOpenCreateProject={() => setCreateProjectOpen(true)}
      />

      {/* Reusable Contextual Task Detail Drawer */}
      <TaskDetailDrawer />

      {/* Creation Modals */}
      <TaskCreateDialog open={createTaskOpen} onOpenChange={setCreateTaskOpen} />
      <ProjectCreateDialog open={createProjectOpen} onOpenChange={setCreateProjectOpen} />
    </div>
  )
}
