import React from 'react'
import { User } from '@/types'
import { cn } from '@/lib/utils'

export const UserAvatar: React.FC<{
  user?: Partial<User>
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  showStatus?: boolean
}> = ({ user, size = 'sm', className, showStatus = false }) => {
  const sizeMap = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-[12px]',
    lg: 'w-10 h-10 text-[14px]'
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <div className="relative inline-block shrink-0" title={user?.name}>
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.name || 'User'}
          className={cn(
            'rounded-full object-cover border border-border/80 shadow-xs',
            sizeMap[size],
            className
          )}
          onError={(e) => {
            // fallback if remote image fails
            (e.target as HTMLElement).style.display = 'none'
          }}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-secondary text-secondary-foreground font-semibold flex items-center justify-center border border-border/80 shadow-xs',
            sizeMap[size],
            className
          )}
        >
          {initials}
        </div>
      )}

      {showStatus && user?.status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-background',
            size === 'xs' ? 'w-1.5 h-1.5' : 'w-2 h-2',
            user.status === 'Active' && 'bg-emerald-500',
            user.status === 'Away' && 'bg-amber-500',
            user.status === 'Offline' && 'bg-zinc-400'
          )}
        />
      )}
    </div>
  )
}

export const AvatarGroup: React.FC<{
  users: Partial<User>[]
  max?: number
  size?: 'xs' | 'sm' | 'md'
  className?: string
}> = ({ users, max = 3, size = 'xs', className }) => {
  const visible = users.slice(0, max)
  const remaining = users.length - max

  return (
    <div className={cn('flex items-center -space-x-1.5 overflow-hidden', className)}>
      {visible.map((u, i) => (
        <UserAvatar key={u.id || i} user={u} size={size} className="ring-2 ring-background" />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-secondary text-muted-foreground font-medium ring-2 ring-background text-[10px]',
            size === 'xs' && 'w-5 h-5',
            size === 'sm' && 'w-6 h-6',
            size === 'md' && 'w-8 h-8'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}
