import type { TicketStatus as BackendStatus, TicketPriority } from '@/types/ticket'

// Map backend status → UI display label
export const statusLabel: Record<BackendStatus, string> = {
  PENDING: 'New',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  WAITING_FOR_CONFIRMATION: 'Waiting Confirmation',
  UNRESOLVABLE: 'Unresolvable',
  DONE: 'Completed',
  CANCELLED: 'Cannot Resolve'
}

// Map backend status → Tailwind badge style
export const statusStyle: Record<BackendStatus, string> = {
  PENDING: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/20 dark:text-blue-300',
  ASSIGNED: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/20 dark:text-violet-300',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-300',
  WAITING_FOR_CONFIRMATION: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/20 dark:text-sky-300',
  UNRESOLVABLE: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/20 dark:text-rose-300',
  DONE: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300',
  CANCELLED: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/20 dark:text-rose-300'
}

// Map backend priority → display label + style
export const priorityLabel: Record<TicketPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
}

export const priorityStyle: Record<TicketPriority, string> = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  MEDIUM: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  HIGH: 'bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
}

export function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
