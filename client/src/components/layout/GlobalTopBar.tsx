import React, { useState } from 'react'
import { Logo } from '@/components/common/Logo'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/context/AuthContext'
import {
  Bell,
  Check,
  ChevronDown,
  Command,
  HelpCircle,
  LogOut,
  Moon,
  Search,
  Sun,
  UserCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useNavigate } from 'react-router-dom'

export const GlobalTopBar: React.FC<{
  onOpenCreateTask: () => void
}> = ({ onOpenCreateTask }) => {
  const {
    organization,
    currentUser,
    notifications,
    markAllNotificationsRead,
    setCommandPaletteOpen,
    clearWorkspace
  } = useAppStore()
  const { logout: authLogout } = useAuth()

  const navigate = useNavigate()
  const unreadCount = notifications.filter(n => !n.read).length
  const [themeDark, setThemeDark] = useState(false)

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark')
    if (isDark) {
      document.documentElement.classList.remove('dark')
      setThemeDark(false)
    } else {
      document.documentElement.classList.add('dark')
      setThemeDark(true)
    }
  }

  return (
    <header className="h-[52px] border-b border-border/80 bg-surface/95 backdrop-blur-md text-foreground flex items-center justify-between px-4 shrink-0 select-none z-30 sticky top-0 shadow-2xs">
      {/* Left: Brand Logo & Organization Indicator */}
      <div className="flex items-center gap-3.5">
        <div
          className="flex items-center cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => navigate('/app/dashboard')}
          title="TaskFlow Pro Dashboard"
        >
          <Logo hideText className="h-8 py-0.5" />
        </div>

        <div className="h-4 w-[1px] bg-border mx-1 hidden sm:block" />

        {/* Organization / Workspace selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted/70 text-xs font-semibold text-foreground transition-all outline-none cursor-pointer border border-transparent hover:border-border/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-xs shadow-emerald-500/50" />
            <span className="truncate max-w-[150px] font-heading font-bold">{organization.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 text-xs p-1">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider px-2 py-1">
                Current workspace
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuItem className="font-semibold flex items-center justify-between cursor-pointer rounded-md">
              <span>{organization.name}</span>
              <Check className="w-3.5 h-3.5 text-[#0284C7]" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/onboarding')} className="cursor-pointer text-[#0284C7] font-semibold rounded-md">
              + Create New Workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Middle: Global Quick Search / Command shortcut */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full h-8.5 px-3.5 rounded-xl bg-muted/60 hover:bg-muted text-xs text-muted-foreground flex items-center justify-between border border-border/80 transition-all cursor-pointer group shadow-2xs"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#0284C7] transition-colors" />
            <span className="font-medium">Search tasks, projects, people...</span>
          </span>
          <kbd className="inline-flex items-center gap-0.5 font-mono text-[10px] bg-background px-2 py-0.5 rounded-md border border-border text-muted-foreground font-semibold shadow-2xs">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={toggleTheme}
          title="Toggle light / dark mode"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
        >
          {themeDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-sky-500" />}
        </Button>

        {/* Notification Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-background" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 text-xs p-0 overflow-hidden shadow-lg border-border">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border bg-muted/40">
              <span className="font-heading font-bold text-foreground text-xs">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[11px] text-[#0284C7] dark:text-[#38BDF8] font-semibold hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-[280px] overflow-y-auto divide-y divide-border">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No notifications</div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => navigate('/app/inbox')}
                    className={`p-3.5 hover:bg-muted/40 cursor-pointer transition-colors ${
                      !n.read ? 'bg-sky-500/5 dark:bg-sky-500/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-foreground text-[11px]">{n.title}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{n.createdAt}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 border-t border-border bg-muted/20 text-center">
              <button
                onClick={() => navigate('/app/inbox')}
                className="text-[11px] text-[#0284C7] dark:text-[#38BDF8] font-bold hover:underline"
              >
                View all notifications →
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Account Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-muted/70 transition-colors outline-none cursor-pointer border border-transparent hover:border-border/80">
            <UserAvatar user={currentUser} size="sm" showStatus />
            <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 text-xs p-1 shadow-lg border-border">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal py-2 px-3">
                <div className="flex flex-col space-y-0.5">
                  <span className="font-heading font-bold text-foreground text-sm">{currentUser.name}</span>
                  <span className="text-[11px] text-muted-foreground">{currentUser.email}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {organization.timezone}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/app/profile')} className="cursor-pointer rounded-md">
              <UserCheck className="w-3.5 h-3.5 mr-2 text-[#0284C7]" />
              <span className="font-medium">My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/app/settings')} className="cursor-pointer rounded-md">
              <HelpCircle className="w-3.5 h-3.5 mr-2 text-[#0284C7]" />
              <span className="font-medium">Workspace Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await authLogout()
                clearWorkspace()
                navigate('/login')
              }}
              className="text-rose-600 dark:text-rose-400 cursor-pointer rounded-md font-semibold"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
