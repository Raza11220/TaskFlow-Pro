import React from 'react'
import { cn } from '@/lib/utils'
import logoImg from '@/assets/logo.png'

interface LogoProps {
  className?: string
  showTagline?: boolean
  collapsed?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  hideText?: boolean
}

export const Logo: React.FC<LogoProps> = ({
  className,
  showTagline = false,
  collapsed = false,
  size = 'md',
  hideText = false
}) => {
  const imageOnlySizeMap = {
    sm: 'h-8 max-w-[150px]',
    md: 'h-9 max-w-[150px]',
    lg: 'h-12 max-w-[200px]',
    xl: 'h-14 max-w-[240px]',
  }

  if (hideText) {
    return (
      <div className={cn('flex items-center select-none', className)}>
        <img
          src={logoImg}
          alt="TaskFlow Pro Logo"
          className={cn('w-auto object-contain drop-shadow-xs', imageOnlySizeMap[size])}
        />
      </div>
    )
  }

  const sizeMap = {
    sm: { img: 'h-6', text: 'text-[14px]', badge: 'text-[9px]' },
    md: { img: 'h-8', text: 'text-[16px]', badge: 'text-[10px]' },
    lg: { img: 'h-10', text: 'text-[18px]', badge: 'text-[11px]' },
    xl: { img: 'h-12', text: 'text-[22px]', badge: 'text-[12px]' }
  }

  const currentSize = sizeMap[size]

  return (
    <div className={cn('flex items-center gap-2 select-none', className)}>
      <img
        src={logoImg}
        alt="TaskFlow Pro Logo"
        className={cn('w-auto object-contain shrink-0', currentSize.img)}
      />

      {!collapsed && (
        <div className="flex flex-col">
          <span className={cn('font-heading font-extrabold tracking-tight text-foreground flex items-center gap-1.5 leading-none', currentSize.text)}>
            <span>TaskFlow</span>
            <span className={cn('text-[#0284C7] dark:text-[#38BDF8] font-bold px-1.5 py-0.5 rounded-full bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/20 leading-none uppercase tracking-wider', currentSize.badge)}>
              Pro
            </span>
          </span>
          {showTagline && (
            <span className="text-[10px] text-muted-foreground font-medium tracking-tight mt-0.5">
              Make work flow.
            </span>
          )}
        </div>
      )}
    </div>
  )
}
