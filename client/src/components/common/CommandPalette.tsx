import React, { useEffect } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'
import { useAppStore } from '@/store/useAppStore'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  CheckCircle2,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Settings,
  Users,
  Moon,
  Sun
} from 'lucide-react'

export const CommandPalette: React.FC<{
  onOpenCreateTask?: () => void
  onOpenCreateProject?: () => void
}> = ({ onOpenCreateTask, onOpenCreateProject }) => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    projects,
    tasks,
    members,
    setSelectedTaskId,
    setSelectedProjectId
  } = useAppStore()

  const navigate = useNavigate()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark')
    if (isDark) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput placeholder="Type a command or search projects, tasks, members..." />
      <CommandList className="max-h-[380px]">
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => {
              setCommandPaletteOpen(false)
              if (onOpenCreateTask) onOpenCreateTask()
            }}
          >
            <Plus className="mr-2 h-4 w-4 text-[#086F83]" />
            <span>Create New Task</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setCommandPaletteOpen(false)
              if (onOpenCreateProject) onOpenCreateProject()
            }}
          >
            <Plus className="mr-2 h-4 w-4 text-[#086F83]" />
            <span>Create New Project</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              toggleTheme()
              setCommandPaletteOpen(false)
            }}
          >
            <Moon className="mr-2 h-4 w-4" />
            <span>Toggle Light / Dark Mode</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => {
              navigate('/app/dashboard')
              setCommandPaletteOpen(false)
            }}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              navigate('/app/tasks')
              setCommandPaletteOpen(false)
            }}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            <span>My Tasks</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              navigate('/app/board')
              setCommandPaletteOpen(false)
            }}
          >
            <FolderKanban className="mr-2 h-4 w-4" />
            <span>Kanban Board</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              navigate('/app/calendar')
              setCommandPaletteOpen(false)
            }}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              navigate('/app/chat')
              setCommandPaletteOpen(false)
            }}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Team Chat</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              navigate('/app/team')
              setCommandPaletteOpen(false)
            }}
          >
            <Users className="mr-2 h-4 w-4" />
            <span>Team Members</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              navigate('/app/settings')
              setCommandPaletteOpen(false)
            }}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Projects */}
        <CommandGroup heading="Projects">
          {projects.slice(0, 6).map((p) => (
            <CommandItem
              key={p.id}
              onSelect={() => {
                setSelectedProjectId(p.id)
                navigate(`/app/projects/${p.id}`)
                setCommandPaletteOpen(false)
              }}
            >
              <span className="font-mono text-[11px] font-semibold mr-2 text-muted-foreground">
                [{p.identifier}]
              </span>
              <span>{p.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Tasks */}
        <CommandGroup heading="Recent Tasks">
          {tasks.slice(0, 6).map((t) => (
            <CommandItem
              key={t.id}
              onSelect={() => {
                setSelectedTaskId(t.id)
                setCommandPaletteOpen(false)
              }}
            >
              <span className="font-mono text-[11px] font-semibold mr-2 text-muted-foreground">
                {t.identifier}
              </span>
              <span className="truncate">{t.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Team Members */}
        <CommandGroup heading="Team Members">
          {members.slice(0, 5).map((m) => (
            <CommandItem
              key={m.id}
              onSelect={() => {
                navigate('/app/team')
                setCommandPaletteOpen(false)
              }}
            >
              <span className="font-medium mr-2">{m.name}</span>
              <span className="text-[11px] text-muted-foreground">({m.jobTitle})</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
