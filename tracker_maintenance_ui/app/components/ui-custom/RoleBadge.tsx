import { FiShield, FiTool, FiUser } from 'react-icons/fi'

import type { UserRole } from '@/types/ui'
import { cn } from '@/lib/cn'

type RoleBadgeProps = {
  role: UserRole
  className?: string
}

const roleConfig: Record<UserRole, { icon: React.ComponentType<{ className?: string }>; className: string }> = {
  Manager: {
    icon: FiShield,
    className: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300'
  },
  Technician: {
    icon: FiTool,
    className: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300'
  },
  Reporter: {
    icon: FiUser,
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300'
  }
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        config.className,
        className
      )}
    >
      <Icon className='h-3.5 w-3.5' />
      {role}
    </span>
  )
}
