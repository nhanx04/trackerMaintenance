import { FiAlertTriangle, FiCheckCircle, FiClock, FiLoader, FiPauseCircle, FiUserCheck } from 'react-icons/fi'

import type { TicketStatus } from '@/types/ui'
import { cn } from '@/lib/cn'

type StatusBadgeProps = {
  status: TicketStatus
  className?: string
}

const statusConfig: Record<TicketStatus, { icon: React.ComponentType<{ className?: string }>; style: string }> = {
  New: {
    icon: FiClock,
    style: 'bg-slate-100 text-slate-700 ring-slate-300 dark:bg-slate-500/20 dark:text-slate-200'
  },
  Assigned: {
    icon: FiUserCheck,
    style: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/20 dark:text-blue-300'
  },
  'In Progress': {
    icon: FiLoader,
    style: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-300'
  },
  Completed: {
    icon: FiCheckCircle,
    style: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300'
  },
  'Cannot Resolve': {
    icon: FiAlertTriangle,
    style: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/20 dark:text-rose-300'
  },
  'Waiting Manager': {
    icon: FiPauseCircle,
    style: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/20 dark:text-violet-300'
  }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        config.style,
        className
      )}
    >
      <Icon className='h-3.5 w-3.5' />
      {status}
    </span>
  )
}

