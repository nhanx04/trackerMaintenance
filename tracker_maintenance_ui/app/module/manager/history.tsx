import { useEffect, useState } from 'react'
import { FiClock, FiRefreshCw } from 'react-icons/fi'

import { TicketTable } from '@/module/shared/TicketTable'
import { ticketApi } from '@/lib/ticketApi'
import type { Ticket } from '@/types/ticket'

type Props = {
  deviceId: string | number
  onViewTicket?: (ticket: Ticket) => void
}

export function MaintenanceHistoryTab({ deviceId, onViewTicket }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId])

  async function loadHistory() {
    setLoading(true)
    setError(null)
    try {
      const data = await ticketApi.getMaintenanceHistory(String(deviceId))
      setTickets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load maintenance history')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='space-y-3 pt-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800' />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className='rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400'>
        {error}
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-14 dark:border-slate-700 dark:bg-slate-900'>
        <FiClock className='mb-3 h-8 w-8 text-slate-300 dark:text-slate-600' />
        <p className='text-sm font-medium text-slate-500 dark:text-slate-400'>No maintenance history found</p>
        <p className='mt-1 text-xs text-slate-400 dark:text-slate-500'>Tickets for this equipment will appear here</p>
      </div>
    )
  }

  return (
    <div>
      <div className='mb-3 flex items-center justify-between'>
        <p className='text-sm text-slate-500 dark:text-slate-400'>
          {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found
        </p>
        <button
          onClick={() => void loadHistory()}
          className='inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
        >
          <FiRefreshCw className='h-3.5 w-3.5' />
          Refresh
        </button>
      </div>

      <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
        <TicketTable
          tickets={tickets}
          showAssignee={false}
          onView={onViewTicket}
          actionLabel='View'
          actionStyle='blue'
          centerViewOnly
        />
      </div>
    </div>
  )
}
