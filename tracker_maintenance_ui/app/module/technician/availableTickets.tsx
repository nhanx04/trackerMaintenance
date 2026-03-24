import { useEffect, useState } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'

import { AppLayout } from '@/layouts/AppLayout'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { TicketTable } from '@/module/shared/TicketTable'
import { ticketApi } from '@/lib/ticketApi'
import type { Ticket, TicketFilter, TicketPriority } from '@/types/ticket'

const PAGE_SIZE = 10

export default function TechnicianAvailableTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriority] = useState<TicketPriority | ''>('')
  const [error, setError] = useState<string | null>(null)

  async function fetchTickets(p = page) {
    setLoading(true)
    setError(null)
    try {
      const filter: TicketFilter = {
        title: search || undefined,
        status: 'PENDING',
        priority: priorityFilter || undefined,
        page: p,
        size: PAGE_SIZE
      }
      const res = await ticketApi.getAll(filter)
      setTickets(res.content.filter((t) => !t.assignedTechnicianId))
      setTotalPages(res.totalPages)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets(page)
  }, [page, priorityFilter])

  return (
    <AppLayout>
      <PageHeader
        title='Available Tickets'
        subtitle='Pending tickets waiting to be assigned.'
        breadcrumbs={[{ label: 'Technician' }, { label: 'Available Tickets' }]}
      />

      {/* Filters */}
      <div className='mb-4 flex flex-wrap gap-3'>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchTickets(0)}
          placeholder='Search by title...'
          className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white'
        />
        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriority(e.target.value as TicketPriority | '')
            setPage(0)
          }}
          className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white'
        >
          <option value=''>All Priority</option>
          <option value='LOW'>Low</option>
          <option value='MEDIUM'>Medium</option>
          <option value='HIGH'>High</option>
        </select>
        <button
          onClick={() => {
            setPage(0)
            fetchTickets(0)
          }}
          className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700'
        >
          Search
        </button>
      </div>

      {error && (
        <div className='mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400'>
          <FiAlertTriangle className='h-4 w-4 shrink-0' />
          {error}
        </div>
      )}

      <section className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-base font-semibold text-slate-900 dark:text-white'>Open Tickets</h3>
          {!loading && (
            <span className='rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'>
              {tickets.length} available
            </span>
          )}
        </div>

        {loading && (
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800' />
            ))}
          </div>
        )}

        {!loading && tickets.length === 0 && (
          <div className='rounded-lg border border-dashed border-slate-300 py-12 text-center dark:border-slate-700'>
            <p className='text-base font-semibold text-slate-700 dark:text-slate-200'>No tickets available</p>
            <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
              All pending tickets have been assigned. Check back later.
            </p>
          </div>
        )}

        {!loading && tickets.length > 0 && <TicketTable tickets={tickets} showAssignee={false} />}

        {totalPages > 1 && (
          <div className='mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400'>
            <p>
              Page {page + 1} of {totalPages}
            </p>
            <div className='flex gap-2'>
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className='rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700'
              >
                Prev
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className='rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </AppLayout>
  )
}
