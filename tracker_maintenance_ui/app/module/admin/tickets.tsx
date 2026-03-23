import { useEffect, useState } from 'react'
import { FiAlertCircle, FiChevronDown, FiPlus, FiTrash2, FiUser, FiX } from 'react-icons/fi'
import { Link } from 'react-router'

import { AppLayout } from '@/layouts/AppLayout'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { TicketTable } from '@/module/shared/TicketTable'
import { TicketImageUpload } from '@/module/shared/TicketImageUpload'
import { TicketProgressPanel } from '@/module/shared/TicketProgressPanel'
import { ticketApi, getTechnicians } from '@/lib/ticketApi'
import { equipmentApi } from '@/lib/equipmentApi'
import { cn } from '@/lib/cn'
import { formatDate, priorityLabel, priorityStyle, statusLabel, statusStyle } from '@/lib/ticketUtils'
import type { TechnicianUser } from '@/lib/ticketApi'
import type { Equipment } from '@/types/equipment'
import type { Ticket, TicketFilter, TicketPriority, TicketStatus, UpdateTicketRequest } from '@/types/ticket'

const PAGE_SIZE = 10
const ALL_STATUSES: TicketStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED']

// ─── Confirm Delete Dialog ────────────────────────────────────────────────────

type ConfirmDeleteProps = {
  ticket: Ticket
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}

function ConfirmDelete({ ticket, onConfirm, onCancel, loading }: ConfirmDeleteProps) {
  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-900'>
        {' '}
        <div className='mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20'>
          <FiTrash2 className='h-5 w-5 text-rose-600 dark:text-rose-400' />
        </div>
        <h3 className='mt-3 text-base font-semibold text-slate-900 dark:text-white'>Delete Ticket?</h3>
        <p className='mt-1 text-sm text-slate-500 dark:text-slate-400 text-center'>
          {' '}
          "<span className='font-medium text-slate-700 dark:text-slate-300'>{ticket.title}</span>" will be permanently
          deleted. This cannot be undone.
        </p>
        <div className='mt-6 flex justify-center gap-4'>
          {' '}
          <button
            onClick={onCancel}
            className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className='rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60'
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

type ConfirmCancelProps = {
  ticket: Ticket
  onConfirm: () => void
  onClose: () => void
  loading: boolean
}

function ConfirmCancel({ ticket, onConfirm, onClose, loading }: ConfirmCancelProps) {
  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-900'>
        {' '}
        <div className='mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20'>
          {' '}
          <FiAlertCircle className='h-5 w-5 text-amber-600 dark:text-amber-400' />
        </div>
        <h3 className='mt-3 text-base font-semibold text-slate-900 dark:text-white'>Cancel Ticket?</h3>
        <p className='mt-1 text-sm text-slate-500 dark:text-slate-400 text-center'>
          {' '}
          Ticket "<span className='font-medium text-slate-700 dark:text-slate-300'>{ticket.title}</span>" will be marked
          as cancelled.
        </p>
        <div className='mt-6 flex justify-center gap-4'>
          {' '}
          <button
            onClick={onClose}
            className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
          >
            Close
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className='rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60'
          >
            {loading ? 'Cancelling…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

type DrawerProps = {
  ticket: Ticket
  technicians: TechnicianUser[]
  onClose: () => void
  onUpdated: () => void
  onDelete: (ticket: Ticket) => void
}

function TicketDrawer({ ticket, technicians, onClose, onUpdated, onDelete }: DrawerProps) {
  const [tab, setTab] = useState<'detail' | 'progress' | 'images'>('detail')

  // Status
  const [nextStatus, setNextStatus] = useState<TicketStatus | ''>('')
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)

  // Assign
  const [assignId, setAssignId] = useState<string>(ticket.assignedTechnicianId ?? '')
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)
  const [assignSuccess, setAssignSuccess] = useState(false)

  const currentTech = technicians.find((t) => t.id === ticket.assignedTechnicianId)
  const availableStatuses = ALL_STATUSES.filter((s) => s !== ticket.status)

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

  async function handleConfirmCompletion() {
    setStatusLoading(true)
    setStatusError(null)
    try {
      await ticketApi.confirmCompletion(ticket.id)
      onUpdated()
      onClose()
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : 'Failed to confirm completion')
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleAssign() {
    if (!assignId) {
      setAssignError('Please select a technician to assign')
      return
    }
    setAssignLoading(true)
    setAssignError(null)
    setAssignSuccess(false)
    try {
      await ticketApi.assign(ticket.id, assignId)
      setAssignSuccess(true)
      setTimeout(() => setAssignSuccess(false), 2500)
      onUpdated()
    } catch (e) {
      setAssignError(e instanceof Error ? e.message : 'Failed to assign')
    } finally {
      setAssignLoading(false)
    }
  }

  return (
    <>
      <div className='fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm' onClick={onClose} />

      <aside className='fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-700'>
          <div className='min-w-0'>
            <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>Ticket Management</p>
            <h2 className='mt-0.5 truncate text-base font-semibold text-slate-900 dark:text-white'>{ticket.title}</h2>
          </div>
          <div className='flex shrink-0 items-center gap-1'>
            <button
              onClick={() => onDelete(ticket)}
              className='rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400'
              title='Delete ticket'
            >
              <FiTrash2 className='h-4 w-4' />
            </button>
            <button onClick={onClose} className='rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800'>
              <FiX className='h-5 w-5' />
            </button>
          </div>
        </div>

        {/* ── Tabs (mới thêm) ── */}
        <div className='flex border-b border-slate-200 dark:border-slate-700'>
          {(['detail', 'progress', 'images'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium transition-colors',
                tab === t
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              {t === 'images' ? 'Before / After' : t === 'progress' ? 'Progress' : 'Details'}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className='flex-1 overflow-y-auto px-5 py-4'>
          {/* ── Details tab ── */}
          {tab === 'detail' && (
            <div className='space-y-5'>
              {/* Meta grid */}
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

              {/* Assign Technician */}
              <div className='rounded-xl border border-slate-200 p-4 dark:border-slate-700'>
                <div className='mb-3 flex items-center gap-2'>
                  <FiUser className='h-4 w-4 text-slate-500' />
                  <p className='text-sm font-semibold text-slate-800 dark:text-slate-200'>Assign Technician</p>
                </div>

                {currentTech && (
                  <div className='mb-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs dark:bg-blue-500/10'>
                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 text-blue-700 dark:bg-blue-500/30 dark:text-blue-300'>
                      {(currentTech.firstName?.[0] ?? currentTech.username[0]).toUpperCase()}
                    </div>
                    <span className='font-medium text-blue-700 dark:text-blue-300'>
                      Currently:{' '}
                      {currentTech.firstName
                        ? `${currentTech.firstName} ${currentTech.lastName ?? ''}`.trim()
                        : currentTech.username}
                    </span>
                  </div>
                )}

                {assignError && (
                  <div className='mb-3 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'>
                    <FiAlertCircle className='h-3.5 w-3.5 shrink-0' />
                    {assignError}
                  </div>
                )}

                {assignSuccess && (
                  <div className='mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'>
                    ✓ Technician assigned successfully
                  </div>
                )}

                <div className='flex gap-2'>
                  <div className='relative flex-1'>
                    <select
                      value={assignId}
                      onChange={(e) => setAssignId(e.target.value)}
                      className='w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-9 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    >
                      <option value=''>Select technician</option>
                      {technicians.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.firstName ? `${tech.firstName} ${tech.lastName ?? ''}`.trim() : tech.username}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                  </div>
                  <button
                    onClick={handleAssign}
                    disabled={assignLoading}
                    className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60'
                  >
                    {assignLoading ? 'Saving…' : 'Assign'}
                  </button>
                </div>
              </div>

              {/* Update Status */}
              <div className='rounded-xl border border-slate-200 p-4 dark:border-slate-700'>
                <p className='mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200'>Update Status</p>

                {statusError && (
                  <div className='mb-3 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'>
                    <FiAlertCircle className='h-3.5 w-3.5 shrink-0' />
                    {statusError}
                  </div>
                )}

                <div className='relative'>
                  <select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value as TicketStatus)}
                    className='w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-9 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                  >
                    <option value=''>Select new status…</option>
                    {availableStatuses.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel[s]}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                </div>

                <button
                  onClick={handleUpdateStatus}
                  disabled={!nextStatus || statusLoading}
                  className='mt-3 w-full rounded-lg bg-slate-800 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600'
                >
                  {statusLoading ? 'Saving…' : 'Save Status'}
                </button>

                {ticket.status === 'WAITING_FOR_CONFIRMATION' && (
                  <button
                    onClick={handleConfirmCompletion}
                    disabled={statusLoading}
                    className='mt-3 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60'
                  >
                    {statusLoading ? 'Confirming…' : 'Confirm completion (Done)'}
                  </button>
                )}
              </div>
            </div>
          )}

          {tab === 'progress' && <TicketProgressPanel ticketId={ticket.id} ticketStatus={ticket.status} />}

          {/* ── Images tab (mới thêm) ── */}
          {tab === 'images' && <TicketImageUpload ticketId={ticket.id} />}
        </div>
      </aside>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | ''>('')
  const [error, setError] = useState<string | null>(null)
  const [technicians, setTechnicians] = useState<TechnicianUser[]>([])
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [toDelete, setToDelete] = useState<Ticket | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toCancel, setToCancel] = useState<Ticket | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<{
    ticketId: string
    imageId: string
  } | null>(null)
  const [imageDeleting, setImageDeleting] = useState(false)

  useEffect(() => {
    getTechnicians(0, 100)
      .then((res) => setTechnicians(res.content))
      .catch((e) => console.error('Load technicians failed', e))
  }, [])

  useEffect(() => {
    equipmentApi
      .getAll({ page: 0, size: 200 })
      .then((res) => setEquipments(res.content))
      .catch((e) => console.error('Load equipments failed', e))
  }, [])

  async function fetchTickets(p = page) {
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
      setTickets(res.content)
      setTotalPages(res.totalPages)
      setTotalElements(res.totalElements)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, priorityFilter])

  async function handleDelete() {
    if (!toDelete) return
    setDeleteLoading(true)
    try {
      await ticketApi.delete(toDelete.id)
      setToDelete(null)
      setSelected(null)
      fetchTickets(page)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete')
    } finally {
      setDeleteLoading(false)
    }
  }

  function handleCancel(ticket: Ticket) {
    setToCancel(ticket)
  }

  async function confirmCancel() {
    if (!toCancel) return
    setCancelLoading(true)
    try {
      await ticketApi.cancel(toCancel.id)
      setToCancel(null)
      fetchTickets(page)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to cancel')
    } finally {
      setCancelLoading(false)
    }
  }

  async function confirmDeleteImage() {
    if (!imageToDelete) return

    setImageDeleting(true)

    try {
      await ticketApi.deleteImage(imageToDelete.ticketId, imageToDelete.imageId)
      setImageToDelete(null)
      fetchTickets(page)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete image')
    } finally {
      setImageDeleting(false)
    }
  }

  type ConfirmDeleteImageProps = {
    onConfirm: () => void
    onCancel: () => void
    loading: boolean
  }

  function ConfirmDeleteImage({ onConfirm, onCancel, loading }: ConfirmDeleteImageProps) {
    return (
      <div className='fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm'>
        <div className='w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-900'>
          <div className='mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20'>
            <FiTrash2 className='h-5 w-5 text-rose-600 dark:text-rose-400' />
          </div>

          <h3 className='mt-3 text-base font-semibold text-slate-900 dark:text-white'>Delete Image?</h3>

          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>This image will be permanently deleted.</p>

          <div className='mt-6 flex justify-center gap-4'>
            <button
              onClick={onCancel}
              className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className='rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60'
            >
              {loading ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const counts = {
    PENDING: tickets.filter((t) => t.status === 'PENDING').length,
    IN_PROGRESS: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    DONE: tickets.filter((t) => t.status === 'DONE').length,
    CANCELLED: tickets.filter((t) => t.status === 'CANCELLED').length
  }

  const technicianLabelById = Object.fromEntries(
    technicians.map((tech) => [
      tech.id,
      tech.firstName ? `${tech.firstName} ${tech.lastName ?? ''}`.trim() : tech.username
    ])
  )

  const deviceLabelById = Object.fromEntries(
    equipments.map((device) => [String(device.id), `${device.code} • ${device.name}`])
  )

  const from = page * PAGE_SIZE + 1
  const to = Math.min((page + 1) * PAGE_SIZE, totalElements)

  return (
    <AppLayout>
      <PageHeader
        title='Tickets'
        breadcrumbs={[{ label: 'Admin' }, { label: 'Tickets' }]}
        action={
          <Link
            to='/admin/create-ticket'
            className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700'
          >
            <FiPlus className='h-4 w-4' />
            New Ticket
          </Link>
        }
      />

      <div className='mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {(
          [
            ['PENDING', 'New', 'text-blue-600'],
            ['IN_PROGRESS', 'In Progress', 'text-amber-600'],
            ['DONE', 'Completed', 'text-emerald-600'],
            ['CANCELLED', 'Cannot Resolve', 'text-rose-600']
          ] as ['PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED', string, string][]
        ).map(([s, label, accent]) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter((prev) => (prev === s ? '' : s))
              setPage(0)
            }}
            className={cn(
              'rounded-xl border bg-white p-4 text-left shadow-sm transition hover:shadow dark:bg-slate-900',
              statusFilter === s
                ? 'border-blue-300 ring-2 ring-blue-200 dark:border-blue-500 dark:ring-blue-500/30'
                : 'border-slate-200 dark:border-slate-800'
            )}
          >
            <p className='text-xs text-slate-500 dark:text-slate-400'>{label}</p>
            <p className={cn('mt-1 text-2xl font-semibold', accent)}>{counts[s]}</p>
          </button>
        ))}
      </div>

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
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as TicketStatus | '')
            setPage(0)
          }}
          className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white'
        >
          <option value=''>All Status</option>
          <option value='PENDING'>Pending</option>
          <option value='IN_PROGRESS'>In Progress</option>
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
        {(search || statusFilter || priorityFilter) && (
          <button
            onClick={() => {
              setSearch('')
              setStatusFilter('')
              setPriorityFilter('')
              setPage(0)
            }}
            className='flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
          >
            <FiX className='h-3.5 w-3.5' /> Clear
          </button>
        )}
      </div>

      {error && (
        <div className='mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400'>
          <FiAlertCircle className='h-4 w-4 shrink-0' />
          {error}
        </div>
      )}

      <section className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-base font-semibold text-slate-900 dark:text-white'>All Tickets</h3>
          {!loading && totalElements > 0 && (
            <span className='text-xs text-slate-500 dark:text-slate-400'>{totalElements} total</span>
          )}
        </div>

        {loading && (
          <div className='space-y-3'>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className='h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800' />
            ))}
          </div>
        )}

        {!loading && tickets.length === 0 && (
          <div className='rounded-lg border border-dashed border-slate-300 py-12 text-center dark:border-slate-700'>
            <p className='text-base font-semibold text-slate-700 dark:text-slate-200'>No tickets found</p>
            <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>Try adjusting your filters.</p>
          </div>
        )}

        {!loading && tickets.length > 0 && (
          <TicketTable
            tickets={tickets}
            showAssignee
            assigneeLabelById={technicianLabelById}
            deviceLabelById={deviceLabelById}
            onView={(ticket) => setSelected(ticket)}
            onDelete={(t) => setToDelete(t)}
            onCancel={handleCancel}
            actionLabel='Manage'
            currentUserRole='ADMIN'
          />
        )}

        {totalPages > 1 && (
          <div className='mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400'>
            <p>
              Showing {from}–{to} of {totalElements}
            </p>
            <div className='flex items-center gap-1'>
              <button
                disabled={page === 0}
                onClick={() => setPage(0)}
                className='rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700'
              >
                «
              </button>
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className='rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700'
              >
                Prev
              </button>
              <span className='px-2 text-xs'>
                {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className='rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700'
              >
                Next
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(totalPages - 1)}
                className='rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700'
              >
                »
              </button>
            </div>
          </div>
        )}
      </section>

      {selected && (
        <TicketDrawer
          ticket={selected}
          technicians={technicians}
          onClose={() => setSelected(null)}
          onUpdated={() => fetchTickets(page)}
          onDelete={(t) => {
            setToDelete(t)
            setSelected(null)
          }}
        />
      )}

      {toDelete && (
        <ConfirmDelete
          ticket={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          loading={deleteLoading}
        />
      )}
      {toCancel && (
        <ConfirmCancel
          ticket={toCancel}
          onConfirm={confirmCancel}
          onClose={() => setToCancel(null)}
          loading={cancelLoading}
        />
      )}
      {imageToDelete && (
        <ConfirmDeleteImage
          onConfirm={confirmDeleteImage}
          onCancel={() => setImageToDelete(null)}
          loading={imageDeleting}
        />
      )}
    </AppLayout>
  )
}
