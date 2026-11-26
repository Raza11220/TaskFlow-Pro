import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Calendar,
  CheckCircle2,
  FolderKanban,
  Home,
  MessageSquare,
  BarChart3,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PrimaryRailProps {
  className?: string
}

const railItems = [
  { to: '/app/dashboard', icon: Home, label: 'Home' },
  { to: '/app/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/app/tasks', icon: CheckCircle2, label: 'My work' },
  { to: '/app/chat', icon: MessageSquare, label: 'Messages' },
  { to: '/app/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/app/reports', icon: BarChart3, label: 'Reports' },
  { to: '/app/settings', icon: Settings, label: 'Settings' }
]

export const PrimaryRail: React.FC<PrimaryRailProps> = ({ className }) => {
  return (
    <aside
      className={cn(
        'w-[56px] bg-sidebar border-r border-border/80 flex flex-col items-center py-3 shrink-0 select-none z-20 shadow-2xs',
        className
      )}
    >
      <nav className="flex flex-col items-center space-y-2 w-full">
        {railItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) =>
                cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 group relative',
                  isActive
                    ? 'bg-[#0284C7] text-white shadow-sm shadow-[#0284C7]/30 font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                )
              }
            >
              <Icon className="w-4 h-4 stroke-[2]" />
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
