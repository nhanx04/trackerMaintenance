import { useEffect, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import { Link } from 'react-router'

import { AppLayout } from '@/layouts/AppLayout'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { DataTableWrapper } from '@/components/ui-custom/DataTableWrapper'
import { TicketTable } from '@/module/shared/TicketTable'
import { ticketApi } from '@/lib/ticketApi'
import { getAuth } from '@/lib/auth'
import type { Ticket, TicketFilter, TicketPriority, TicketStatus } from '@/types/ticket'

const PAGE_SIZE = 10

export default function ReporterMyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TicketStatus | ''>('')
  const [priority, setPriority] = useState<TicketPriority | ''>('')
  const [error, setError] = useState<string | null>(null)

  const auth = getAuth()

  async function fetchTickets(p = page) {
    setLoading(true)
    setError(null)
    try {
      const filter: TicketFilter = {
        title: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
        page: p,
        size: PAGE_SIZE
      }
      const res = await ticketApi.getAll(filter)
      setTickets(res.content)
      setTotal(res.totalPages)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  // Fetch on filter/page change
  useEffect(() => {
    fetchTickets(page)
  }, [page])

  function handleSearch() {
    setPage(0)
    fetchTickets(0)
  }

  async function handleCancel(ticket: Ticket) {
    if (!confirm(`Cancel ticket "${ticket.title}"?`)) return
    try {
      await ticketApi.cancel(ticket.id)
      fetchTickets(page)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to cancel')
    }
  }

  const totalShown = Math.min((page + 1) * PAGE_SIZE, tickets.length + page * PAGE_SIZE)

  return (
    <AppLayout>
      <PageHeader
        title='My Tickets'
        subtitle='Track all maintenance requests you have submitted.'
        breadcrumbs={[{ label: 'Reporter' }, { label: 'My Tickets' }]}
        action={
          <Link
            to='/reporter/create-ticket'
            className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700'
          >
            <FiPlus className='h-4 w-4' />
            New Ticket
          </Link>
        }
      />

      {/* Filters */}
      <div className='mb-4 flex flex-wrap gap-3'>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder='Search by title...'
          className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800'
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as TicketStatus | '')
            setPage(0)
          }}
          className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800'
        >
          <option value=''>All Status</option>
          <option value='PENDING'>Pending</option>
          <option value='IN_PROGRESS'>In Progress</option>
          <option value='DONE'>Done</option>
          <option value='CANCELLED'>Cancelled</option>
        </select>
        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value as TicketPriority | '')
            setPage(0)
          }}
          className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800'
        >
          <option value=''>All Priority</option>
          <option value='LOW'>Low</option>
          <option value='MEDIUM'>Medium</option>
          <option value='HIGH'>High</option>
        </select>
        <button
          onClick={handleSearch}
          className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700'
        >
          Search
        </button>
      </div>

      {error && (
        <div className='mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400'>
          {error}
        </div>
      )}

      <section className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
        <h3 className='mb-4 text-base font-semibold text-slate-900 dark:text-white'>Your Tickets</h3>

        {loading && (
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800' />
            ))}
          </div>
        )}

        {!loading && tickets.length === 0 && (
          <div className='rounded-lg border border-dashed border-slate-300 py-12 text-center dark:border-slate-700'>
            <p className='text-base font-semibold text-slate-700 dark:text-slate-200'>No tickets found</p>
            <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
              Try adjusting your filters or{' '}
              <Link to='/reporter/create-ticket' className='text-blue-600 underline hover:text-blue-700'>
                create a new ticket
              </Link>
              .
            </p>
          </div>
        )}

        {!loading && tickets.length > 0 && <TicketTable tickets={tickets} onCancel={handleCancel} />}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400'>
            <p>
              Page {page + 1} of {totalPages}
            </p>
            <div className='flex items-center gap-2'>
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className='rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800'
              >
                Prev
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className='rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800'
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
