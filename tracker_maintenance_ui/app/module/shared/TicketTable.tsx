import { cn } from '@/lib/cn'
import { formatDate, priorityLabel, priorityStyle, statusLabel, statusStyle } from '@/lib/ticketUtils'
import type { Ticket } from '@/types/ticket'

type ActionStyle = 'blue' | 'emerald' | 'rose'

type TicketTableProps = {
  tickets: Ticket[]
  showAssignee?: boolean
  assigneeLabelById?: Record<string, string>
  deviceLabelById?: Record<string, string>
  onView?: (ticket: Ticket) => void
  actionLabel?: string
  actionStyle?: ActionStyle
  onCancel?: (ticket: Ticket) => void
  onDelete?: (ticket: Ticket) => void
  onConfirmComplete?: (ticket: Ticket) => void
  centerViewOnly?: boolean
}

const actionStyles: Record<ActionStyle, string> = {
  blue: 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10',
  emerald: 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10',
  rose: 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10'
}

export function TicketTable({
  tickets,
  showAssignee = false,
  assigneeLabelById,
  deviceLabelById,
  onView,
  actionLabel = 'View',
  actionStyle = 'blue',
  onCancel,
  onDelete,
  onConfirmComplete,
  centerViewOnly = false
}: TicketTableProps) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b border-slate-200 text-left dark:border-slate-700'>
            <th className='pb-3 pr-4 font-semibold text-slate-600 dark:text-slate-400'>Title</th>
            <th className='pb-3 pr-4 font-semibold text-slate-600 dark:text-slate-400'>Status</th>
            <th className='pb-3 pr-4 font-semibold text-slate-600 dark:text-slate-400'>Priority</th>
            <th className='pb-3 pr-4 font-semibold text-slate-600 dark:text-slate-400'>Device</th>
            {showAssignee && <th className='pb-3 pr-4 font-semibold text-slate-600 dark:text-slate-400'>Assignee</th>}
            <th className='pb-3 pr-4 font-semibold text-slate-600 dark:text-slate-400'>Created</th>
            {(onView || onCancel || onDelete || onConfirmComplete) && (
              <th className='pb-3 pr-4 text-center font-semibold text-slate-600 dark:text-slate-400'>Actions</th>
            )}
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
          {tickets.map((ticket) => {
            const assignee = ticket.assignedTechnicianId ? assigneeLabelById?.[ticket.assignedTechnicianId] : undefined
            const assigneeName = assignee || 'Unassigned'
            const initials =
              assigneeName
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase())
                .join('') || 'UN'

            return (
              <tr key={ticket.id} className='group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40'>
                <td className='py-3 pr-4'>
                  <p className='font-medium text-slate-900 dark:text-white'>{ticket.title}</p>
                  {ticket.description && (
                    <p className='mt-0.5 max-w-xs truncate text-xs text-slate-500 dark:text-slate-400'>
                      {ticket.description}
                    </p>
                  )}
                </td>

                <td className='py-3 pr-4'>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
                      statusStyle[ticket.status]
                    )}
                  >
                    {statusLabel[ticket.status]}
                  </span>
                </td>

                <td className='py-3 pr-4'>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                      priorityStyle[ticket.priority]
                    )}
                  >
                    {priorityLabel[ticket.priority]}
                  </span>
                </td>

                <td className='py-3 pr-4 text-xs text-slate-600 dark:text-slate-300'>
                  {deviceLabelById?.[ticket.deviceId] || ticket.deviceId}
                </td>

                {showAssignee && (
                  <td className='py-3 pr-4'>
                    <div className='flex items-center gap-2'>
                      <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200'>
                        {initials}
                      </span>
                      <span className='text-xs text-slate-600 dark:text-slate-300'>{assigneeName}</span>
                    </div>
                  </td>
                )}

                <td className='py-3 pr-4 text-xs text-slate-500 dark:text-slate-400'>{formatDate(ticket.createdAt)}</td>

                {(onView || onCancel || onDelete || onConfirmComplete) && (
                  <td className='py-3'>
                    <div className='flex items-center gap-2'>
                      {onView && (
                        <button
                          onClick={() => onView(ticket)}
                          className={cn(
                            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                            centerViewOnly && 'mx-auto block',
                            actionStyles[actionStyle]
                          )}
                        >
                          {actionLabel}
                        </button>
                      )}
                      {onCancel && ticket.status === 'PENDING' && (
                        <button
                          onClick={() => onCancel(ticket)}
                          className='rounded-md px-2.5 py-1 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10'
                        >
                          Cancel
                        </button>
                      )}
                      {onConfirmComplete &&
                        ticket.status === 'WAITING_FOR_CONFIRMATION' &&
                        ticket.assignedTechnicianId && (
                          <button
                            onClick={() => onConfirmComplete(ticket)}
                            className='rounded-md px-2.5 py-1 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10'
                          >
                            Confirm
                          </button>
                        )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(ticket)}
                          className='rounded-md px-2.5 py-1 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100 dark:text-rose-500 dark:hover:bg-rose-500/20'
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
