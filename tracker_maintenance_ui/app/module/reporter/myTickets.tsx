import { useEffect, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import { Link } from 'react-router'
import { FiAlertTriangle, FiChevronDown, FiX } from 'react-icons/fi'

import { cn } from '@/lib/cn'
import { formatDate, priorityLabel, priorityStyle, statusLabel, statusStyle } from '@/lib/ticketUtils'

import type { Ticket, TicketFilter, TicketPriority, TicketStatus, UpdateTicketRequest } from '@/types/ticket'

import { AppLayout } from '@/layouts/AppLayout'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { DataTableWrapper } from '@/components/ui-custom/DataTableWrapper'
import { TicketTable } from '@/module/shared/TicketTable'

import { ticketApi } from '@/lib/ticketApi'
import { getAuth } from '@/lib/auth'
import { TicketImageViewer } from '../shared/TicketImageViewer'
import { TicketProgressPanel } from '../shared/TicketProgressPanel'

const NEXT_STATUSES: Partial<Record<TicketStatus, TicketStatus[]>> = {
  PENDING: ['IN_PROGRESS'],
  IN_PROGRESS: ['DONE']
}
const PAGE_SIZE = 10

// ─── Drawer ───────────────────────────────────────────────────────────────────

type DrawerProps = {
  ticket: Ticket
  onClose: () => void
  onUpdated: () => void
}

function TicketDrawer({ ticket, onClose, onUpdated }: DrawerProps) {
  const [tab, setTab] = useState<'detail' | 'progress' | 'images'>('detail')

  const [nextStatus, setNextStatus] = useState<TicketStatus | ''>('')
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)

  const availableNextStatuses = NEXT_STATUSES[ticket.status] ?? []

  async function handleUpdateStatus() {
    if (!nextStatus) return
    setStatusLoading(true)
    setStatusError(null)
    try {
      await ticketApi.update(ticket.id, { status: nextStatus } as UpdateTicketRequest)
      onUpdated()
      onClose()
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : 'Failed to update status')
    } finally {
      setStatusLoading(false)
    }
  }

  return (
    <>
      <div className='fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm' onClick={onClose} />

      <aside className='fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-700'>
          <div className='min-w-0'>
            <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>Ticket Detail</p>
            <h2 className='mt-0.5 truncate text-base font-semibold text-slate-900 dark:text-white'>{ticket.title}</h2>
          </div>
          <button onClick={onClose} className='shrink-0 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800'>
            <FiX className='h-5 w-5' />
          </button>
        </div>

        {/* Tabs */}
        <div className='flex border-b border-slate-200 dark:border-slate-700'>
          {(['detail', 'progress', 'images'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium capitalize transition-colors',
                tab === t
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              {t === 'images' ? 'Before / After' : t === 'progress' ? 'Progress' : 'Details'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto px-5 py-4'>
          {/* ── Details tab ── */}
          {tab === 'detail' && (
            <div className='space-y-5'>
              <div className='grid grid-cols-2 gap-3'>
                {[
                  {
                    label: 'Status',
                    value: (
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
                          statusStyle[ticket.status]
                        )}
                      >
                        {statusLabel[ticket.status]}
                      </span>
                    )
                  },
                  {
                    label: 'Priority',
                    value: (
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                          priorityStyle[ticket.priority]
                        )}
                      >
                        {priorityLabel[ticket.priority]}
                      </span>
                    )
                  },
                  { label: 'Device ID', value: <span className='font-mono text-xs'>{ticket.deviceId}</span> },
                  { label: 'Created', value: formatDate(ticket.createdAt) },
                  { label: 'Scheduled', value: formatDate(ticket.scheduledDate) },
                  { label: 'Updated', value: formatDate(ticket.updatedAt) }
                ].map(({ label, value }) => (
                  <div key={label} className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800/70'>
                    <p className='text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400'>
                      {label}
                    </p>
                    <div className='mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200'>{value}</div>
                  </div>
                ))}
              </div>

              {ticket.description && (
                <div>
                  <p className='mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400'>
                    Description
                  </p>
                  <p className='rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 dark:bg-slate-800/70 dark:text-slate-300'>
                    {ticket.description}
                  </p>
                </div>
              )}

              {availableNextStatuses.length === 0 && (
                <p className='rounded-lg bg-slate-50 px-4 py-3 text-center text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-400'>
                  This ticket is already <strong>{statusLabel[ticket.status]}</strong> and cannot be updated further.
                </p>
              )}
            </div>
          )}

          {tab === 'progress' && <TicketProgressPanel ticketId={ticket.id} ticketStatus={ticket.status} />}

          {/* ── Images tab — replaced with shared component ── */}
          {tab === 'images' && <TicketImageViewer ticketId={ticket.id} />}
        </div>
      </aside>
    </>
  )
}

export default function ReporterMyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TicketStatus | ''>('')
  const [priority, setPriority] = useState<TicketPriority | ''>('')
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Ticket | null>(null)

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

        {!loading && tickets.length > 0 && (
          <TicketTable
            tickets={tickets}
            showAssignee={false}
            onView={(ticket) => setSelected(ticket)}
            actionLabel='View Details'
            centerViewOnly
          />
        )}

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
      {selected && (
        <TicketDrawer
          ticket={selected}
          onClose={() => setSelected(null)}
          onUpdated={() => {
            setSelected(null)
            fetchTickets(page)
          }}
        />
      )}
    </AppLayout>
  )
}
