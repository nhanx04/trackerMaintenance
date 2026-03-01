import { cn } from '@/lib/cn'
import { formatDate, priorityLabel, priorityStyle, statusLabel, statusStyle } from '@/lib/ticketUtils'
import type { Ticket } from '@/types/ticket'

type TicketTableProps = {
  tickets: Ticket[]
  onView?: (ticket: Ticket) => void
  onCancel?: (ticket: Ticket) => void
  showAssignee?: boolean
}

export function TicketTable({ tickets, onView, onCancel, showAssignee = false }: TicketTableProps) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b border-slate-200 text-left dark:border-slate-700'>
            <th className='pb-3 pr-4 font-semibold text-slate-600 dark:text-slate-400'>Title</th>
            <th className='pb-3 pr-4 font-semibold text-slate-600 dark:text-slate-400'>Status</th>
            <th className='pb-3 pr-4 font-semibold text-slate-600 dark:text-slate-400'>Priority</th>
            <th className='pb-3 pr-4 font-semibold text-slate-600 dark:text-slate-400'>Device ID</th>
            {showAssignee && <th className='pb-3 pr-4 font-semibold text-slate-600 dark:text-slate-400'>Assignee</th>}
            <th className='pb-3 pr-4 font-semibold text-slate-600 dark:text-slate-400'>Created</th>
            <th className='pb-3 font-semibold text-slate-600 dark:text-slate-400'>Actions</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
          {tickets.map((ticket) => (
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

              <td className='py-3 pr-4 font-mono text-xs text-slate-500 dark:text-slate-400'>{ticket.deviceId}</td>

              {showAssignee && (
                <td className='py-3 pr-4 text-xs text-slate-500 dark:text-slate-400'>
                  {ticket.assignedTechnicianId ?? '—'}
                </td>
              )}

              <td className='py-3 pr-4 text-xs text-slate-500 dark:text-slate-400'>{formatDate(ticket.createdAt)}</td>

              <td className='py-3'>
                <div className='flex items-center gap-2'>
                  {onView && (
                    <button
                      onClick={() => onView(ticket)}
                      className='rounded-md px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10'
                    >
                      View
                    </button>
                  )}
                  {onCancel && ticket.status === 'PENDING' && (
                    <button
                      onClick={() => onCancel(ticket)}
                      className='rounded-md px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10'
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
