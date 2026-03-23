import { useEffect, useState } from 'react'
import { FiAlertCircle, FiCheckCircle, FiChevronDown, FiX } from 'react-icons/fi'

import { AppLayout } from '@/layouts/AppLayout'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { TicketTable } from '@/module/shared/TicketTable'
import { TicketImageUpload } from '@/module/shared/TicketImageUpload'
import { TicketProgressPanel } from '@/module/shared/TicketProgressPanel'
import { ticketApi } from '@/lib/ticketApi'
import { getAuth } from '@/lib/auth'
import { cn } from '@/lib/cn'
import { formatDate, priorityLabel, priorityStyle, statusLabel, statusStyle } from '@/lib/ticketUtils'
import type { Ticket, TicketFilter, TicketPriority, TicketStatus, UpdateTicketRequest } from '@/types/ticket'

const PAGE_SIZE = 10

const NEXT_STATUSES: Partial<Record<TicketStatus, TicketStatus[]>> = {
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['WAITING_FOR_CONFIRMATION']
}

type ConfirmAcceptProps = {
  ticket: Ticket
  onConfirm: () => void
  onClose: () => void
  loading: boolean
}

function ConfirmAccept({ ticket, onConfirm, onClose, loading }: ConfirmAcceptProps) {
  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-900'>
        <div className='mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20'>
          <FiCheckCircle className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
        </div>
        <h3 className='mt-3 text-base font-semibold text-slate-900 dark:text-white'>Xác nhận nhận ticket?</h3>
        <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
          Bạn sẽ bắt đầu xử lý ticket "
          <span className='font-medium text-slate-700 dark:text-slate-300'>{ticket.title}</span>".
        </p>
        <div className='mt-6 flex justify-center gap-4'>
          <button
            onClick={onClose}
            className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
          >
            Đóng
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60'
          >
            {loading ? 'Đang nhận…' : 'Xác nhận nhận'}
          </button>
        </div>
      </div>
    </div>
  )
}

type ConfirmCompleteProps = {
  ticket: Ticket
  loading: boolean
  onClose: () => void
  onConfirm: (files: File[]) => void
}

function ConfirmComplete({ ticket, loading, onClose, onConfirm }: ConfirmCompleteProps) {
  const [files, setFiles] = useState<File[]>([])

  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900'>
        <h3 className='text-base font-semibold text-slate-900 dark:text-white'>Đánh dấu hoàn thành ticket?</h3>
        <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
          Ticket: <span className='font-medium text-slate-700 dark:text-slate-300'>{ticket.title}</span>
        </p>

        <label className='mt-4 block text-xs font-medium text-slate-500 dark:text-slate-400'>
          Upload ảnh AFTER (không bắt buộc)
        </label>
        <input
          type='file'
          multiple
          accept='image/*'
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className='mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
        />
        {files.length > 0 && (
          <p className='mt-2 text-xs text-slate-500 dark:text-slate-400'>{files.length} file(s) selected</p>
        )}

        <div className='mt-6 flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
          >
            Huỷ
          </button>
          <button
            onClick={() => onConfirm(files)}
            disabled={loading}
            className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60'
          >
            {loading ? 'Đang xử lý…' : 'Xác nhận hoàn thành'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ConfirmUnresolvable({ ticket, loading, onClose, onConfirm }: any) {
  const [reason, setReason] = useState('')

  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-lg rounded-2xl border bg-white p-6 dark:bg-slate-900'>
        <h3 className='text-base font-semibold'>Mark as Unresolvable?</h3>

        <div className='mt-4'>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder='Nhập lý do...'
            rows={3}
            className='mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-rose-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
          />
        </div>

        <div className='mt-4 flex justify-end gap-2'>
          <button onClick={onClose}>Hủy</button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || loading}
            className='bg-rose-600 px-4 py-2 text-white rounded'
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  )
}

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
  const [showCompletePopup, setShowCompletePopup] = useState(false)
  const [showUnresolvablePopup, setShowUnresolvablePopup] = useState(false)
  const [showAcceptPopup, setShowAcceptPopup] = useState(false)

  const availableNextStatuses = NEXT_STATUSES[ticket.status] ?? []

  async function handleAcceptTicket() {
    setStatusLoading(true)
    try {
      await ticketApi.accept(ticket.id)
      setShowAcceptPopup(false)
      onUpdated()
      onClose()
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleUnresolvable(reason: string) {
    setStatusLoading(true)
    setStatusError(null)

    try {
      await ticketApi.markAsUnresolvable(ticket.id, reason)

      setShowUnresolvablePopup(false)
      onUpdated()
      onClose()
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleUpdateStatus() {
    if (!nextStatus) return

    setStatusLoading(true)
    setStatusError(null)

    try {
      if (nextStatus === 'IN_PROGRESS') {
        await ticketApi.update(ticket.id, { status: 'IN_PROGRESS' })
      }

      if (nextStatus === 'WAITING_FOR_CONFIRMATION') {
        await ticketApi.markAsCompleted(ticket.id)
      }

      onUpdated()
      onClose()
    } catch (e) {
      console.error(e)
      setStatusError(e instanceof Error ? e.message : 'Failed to update status')
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleCompleteTicket(files: File[]) {
    setStatusLoading(true)
    setStatusError(null)
    try {
      if (files.length > 0) {
        await ticketApi.uploadImages(ticket.id, 'after', files)
      }
      await ticketApi.markAsCompleted(ticket.id)
      setShowCompletePopup(false)
      onUpdated()
      onClose()
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : 'Failed to complete ticket')
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

              {ticket.status === 'UNRESOLVABLE' && ticket.unresolvableReason && (
                <div>
                  <p className='mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400'>
                    Unresolvable reason
                  </p>

                  <div className='flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/10 dark:text-rose-300'>
                    <FiAlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
                    <span>{ticket.unresolvableReason}</span>
                  </div>
                </div>
              )}

              {statusError && (
                <div className='mb-3 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'>
                  <FiAlertCircle className='h-3.5 w-3.5 shrink-0' />
                  {statusError}
                </div>
              )}

              {ticket.status === 'ASSIGNED' && (
                <button
                  onClick={() => setShowAcceptPopup(true)}
                  disabled={statusLoading}
                  className='w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700'
                >
                  Get Ticket
                </button>
              )}

              {ticket.status === 'IN_PROGRESS' && (
                <div className='space-y-2'>
                  <button
                    onClick={() => setShowCompletePopup(true)}
                    disabled={statusLoading}
                    className='w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700'
                  >
                    {statusLoading ? 'Processing…' : 'Mark as Completed'}
                  </button>

                  <button
                    onClick={() => setShowUnresolvablePopup(true)}
                    disabled={statusLoading}
                    className='w-full rounded-lg bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700'
                  >
                    Mark as Unresolvable
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'progress' && <TicketProgressPanel ticketId={ticket.id} ticketStatus={ticket.status} allowCreate />}

          {/* ── Images tab — replaced with shared component ── */}
          {tab === 'images' && <TicketImageUpload ticketId={ticket.id} allowedTypes={['after']} />}
        </div>
      </aside>

      {showCompletePopup && (
        <ConfirmComplete
          ticket={ticket}
          loading={statusLoading}
          onClose={() => setShowCompletePopup(false)}
          onConfirm={handleCompleteTicket}
        />
      )}

      {showUnresolvablePopup && (
        <ConfirmUnresolvable
          ticket={ticket}
          loading={statusLoading}
          onClose={() => setShowUnresolvablePopup(false)}
          onConfirm={handleUnresolvable}
        />
      )}

      {showAcceptPopup && (
        <ConfirmAccept
          ticket={ticket}
          loading={statusLoading}
          onClose={() => setShowAcceptPopup(false)}
          onConfirm={handleAcceptTicket}
        />
      )}
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TechnicianMyTicketsPage() {
  const auth = getAuth()

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | ''>('')
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [toAccept, setToAccept] = useState<Ticket | null>(null)
  const [acceptLoading, setAcceptLoading] = useState(false)

  async function fetchTickets(p = page) {
    if (!auth?.id) return
    setLoading(true)
    setError(null)
    try {
      const filter: TicketFilter = {
        title: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        page: p,
        size: PAGE_SIZE
      }
      const res = await ticketApi.getAll(filter)
      const statusOrder: Record<TicketStatus, number> = {
        PENDING: 0,
        ASSIGNED: 1,
        IN_PROGRESS: 2,
        WAITING_FOR_CONFIRMATION: 3,
        DONE: 4,
        UNRESOLVABLE: 5,
        CANCELLED: 6
      }

      setTickets(
        res.content
          .filter((t) => t.assignedTechnicianId === auth.id)
          .sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
      )
      setTotalPages(res.totalPages)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets(page)
  }, [page, statusFilter, priorityFilter])

  async function confirmAcceptTicket() {
    if (!toAccept) return
    setAcceptLoading(true)
    setError(null)
    try {
      await ticketApi.accept(toAccept.id)
      setToAccept(null)
      fetchTickets(page)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to accept ticket')
    } finally {
      setAcceptLoading(false)
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title='My Tickets'
        subtitle='Tickets assigned to you.'
        breadcrumbs={[{ label: 'Technician' }, { label: 'My Tickets' }]}
      />

      <div className='mb-4 flex flex-wrap gap-3'>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchTickets(0)}
          placeholder='Search by title...'
          className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white'
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as TicketStatus | '')
            setPage(0)
          }}
          className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white'
        >
          <option value=''>All Status</option>
          <option value='ASSIGNED'>Assigned</option>
          <option value='IN_PROGRESS'>In Progress</option>
          <option value='WAITING_FOR_CONFIRMATION'>Waiting Confirmation</option>
          <option value='UNRESOLVABLE'>Unresolvable</option>
          <option value='DONE'>Done</option>
          <option value='CANCELLED'>Cancelled</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value as TicketPriority | '')
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
          <FiAlertCircle className='h-4 w-4 shrink-0' />
          {error}
        </div>
      )}

      <section className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
        <h3 className='mb-4 text-base font-semibold text-slate-900 dark:text-white'>Assigned to Me</h3>

        {loading && (
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800' />
            ))}
          </div>
        )}

        {!loading && tickets.length === 0 && (
          <div className='rounded-lg border border-dashed border-slate-300 py-12 text-center dark:border-slate-700'>
            <p className='text-base font-semibold text-slate-700 dark:text-slate-200'>No tickets assigned</p>
            <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
              Check the Available Tickets page to see open work.
            </p>
          </div>
        )}

        {!loading && tickets.length > 0 && (
          <TicketTable
            tickets={tickets}
            showAssignee={false}
            onView={(ticket) => setSelected(ticket)}
            currentUserRole='TECHNICIAN'
            actionLabel='View Details'
          />
        )}

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

      {toAccept && (
        <ConfirmAccept
          ticket={toAccept}
          onConfirm={confirmAcceptTicket}
          onClose={() => setToAccept(null)}
          loading={acceptLoading}
        />
      )}
    </AppLayout>
  )
}
