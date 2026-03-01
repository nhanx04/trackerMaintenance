import { useEffect, useRef, useState } from 'react'
import { FiAlertCircle, FiCamera, FiChevronDown, FiImage, FiUpload, FiX } from 'react-icons/fi'

import { AppLayout } from '@/layouts/AppLayout'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { TicketTable } from '@/module/shared/TicketTable'
import { ticketApi } from '@/lib/ticketApi'
import { getAuth } from '@/lib/auth'
import { formatDate, priorityLabel, priorityStyle, statusLabel, statusStyle } from '@/lib/ticketUtils'
import { cn } from '@/lib/cn'
import type {
  Ticket,
  TicketFilter,
  TicketImage,
  TicketPriority,
  TicketStatus,
  UpdateTicketRequest
} from '@/types/ticket'

const PAGE_SIZE = 10

const NEXT_STATUSES: Partial<Record<TicketStatus, TicketStatus[]>> = {
  PENDING: ['IN_PROGRESS'],
  IN_PROGRESS: ['DONE']
}

// ─── Drawer ──────────────────────────────────────────────────────────────────

type DrawerProps = {
  ticket: Ticket
  onClose: () => void
  onUpdated: () => void
}

function TicketDrawer({ ticket, onClose, onUpdated }: DrawerProps) {
  const [tab, setTab] = useState<'detail' | 'images'>('detail')

  // Status update
  const [nextStatus, setNextStatus] = useState<TicketStatus | ''>('')
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)

  // Images
  const [images, setImages] = useState<TicketImage[]>([])
  const [imagesLoading, setImagesLoading] = useState(false)
  const [uploadType, setUploadType] = useState<'before' | 'after'>('before')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const availableNextStatuses = NEXT_STATUSES[ticket.status] ?? []

  async function fetchImages() {
    setImagesLoading(true)
    try {
      const imgs = await ticketApi.getImages(ticket.id)
      setImages(imgs)
    } catch {
      // non-critical
    } finally {
      setImagesLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'images') fetchImages()
  }, [tab])

  async function handleUpdateStatus() {
    if (!nextStatus) return
    setStatusLoading(true)
    setStatusError(null)
    try {
      const payload: UpdateTicketRequest = { status: nextStatus }
      await ticketApi.update(ticket.id, payload)
      onUpdated()
      onClose()
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : 'Failed to update status')
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setUploadError(null)
    try {
      await ticketApi.uploadImages(ticket.id, uploadType, Array.from(files))
      await fetchImages()
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!confirm('Delete this image?')) return
    try {
      await ticketApi.deleteImage(ticket.id, imageId)
      setImages((prev) => prev.filter((i) => i.id !== imageId))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete image')
    }
  }

  const beforeImages = images.filter((i) => i.imageType === 'BEFORE')
  const afterImages = images.filter((i) => i.imageType === 'AFTER')

  return (
    <>
      {/* Backdrop */}
      <div className='fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm' onClick={onClose} />

      {/* Drawer */}
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
          {(['detail', 'images'] as const).map((t) => (
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
              {t === 'images' ? 'Before / After' : 'Details'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto px-5 py-4'>
          {/* ── Detail Tab ── */}
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

              {/* Description */}
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

              {/* Update status */}
              {availableNextStatuses.length > 0 && (
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
                      {availableNextStatuses.map((s) => (
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
                    className='mt-3 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60'
                  >
                    {statusLoading ? 'Saving…' : 'Save Status'}
                  </button>
                </div>
              )}

              {availableNextStatuses.length === 0 && (
                <p className='rounded-lg bg-slate-50 px-4 py-3 text-center text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-400'>
                  This ticket is already <strong>{statusLabel[ticket.status]}</strong> and cannot be updated further.
                </p>
              )}
            </div>
          )}

          {/* ── Images Tab ── */}
          {tab === 'images' && (
            <div className='space-y-6'>
              {/* Upload control */}
              <div className='rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700'>
                <p className='mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200'>Upload Images</p>

                {uploadError && (
                  <div className='mb-3 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'>
                    <FiAlertCircle className='h-3.5 w-3.5 shrink-0' />
                    {uploadError}
                  </div>
                )}

                <div className='flex items-center gap-3'>
                  <div className='flex rounded-lg border border-slate-300 dark:border-slate-700'>
                    {(['before', 'after'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setUploadType(type)}
                        className={cn(
                          'px-4 py-2 text-xs font-semibold capitalize transition-colors first:rounded-l-lg last:rounded-r-lg',
                          uploadType === type
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <input
                    ref={fileRef}
                    type='file'
                    accept='image/*'
                    multiple
                    className='hidden'
                    onChange={(e) => handleUpload(e.target.files)}
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60'
                  >
                    {uploading ? (
                      <>Uploading…</>
                    ) : (
                      <>
                        <FiUpload className='h-3.5 w-3.5' /> Upload {uploadType}
                      </>
                    )}
                  </button>
                </div>
                <p className='mt-2 text-xs text-slate-400'>Max 10 MB per file. Multiple files allowed.</p>
              </div>

              {/* Image grids */}
              {imagesLoading ? (
                <div className='grid grid-cols-2 gap-3'>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className='aspect-square animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800' />
                  ))}
                </div>
              ) : (
                <>
                  <ImageSection title='Before' icon={FiCamera} images={beforeImages} onDelete={handleDeleteImage} />
                  <ImageSection title='After' icon={FiImage} images={afterImages} onDelete={handleDeleteImage} />
                </>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

// ─── Image section ────────────────────────────────────────────────────────────

type ImageSectionProps = {
  title: string
  icon: React.ComponentType<{ className?: string }>
  images: TicketImage[]
  onDelete: (id: string) => void
}

function ImageSection({ title, icon: Icon, images, onDelete }: ImageSectionProps) {
  return (
    <div>
      <div className='mb-2 flex items-center gap-2'>
        <Icon className='h-4 w-4 text-slate-500' />
        <p className='text-sm font-semibold text-slate-700 dark:text-slate-300'>{title}</p>
        <span className='rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400'>
          {images.length}
        </span>
      </div>

      {images.length === 0 ? (
        <p className='rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-700'>
          No {title.toLowerCase()} images yet
        </p>
      ) : (
        <div className='grid grid-cols-2 gap-3'>
          {images.map((img) => (
            <div
              key={img.id}
              className='group relative aspect-square overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700'
            >
              <img
                src={img.imageUrl}
                alt={`${title} image`}
                className='h-full w-full object-cover transition-transform group-hover:scale-105'
              />
              <button
                onClick={() => onDelete(img.id)}
                className='absolute right-1.5 top-1.5 rounded-full bg-slate-900/70 p-1 text-white opacity-0 transition-opacity hover:bg-rose-600 group-hover:opacity-100'
              >
                <FiX className='h-3 w-3' />
              </button>
              <p className='absolute bottom-0 left-0 right-0 bg-slate-900/50 px-2 py-1 text-center text-xs text-white'>
                {formatDate(img.uploadedAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
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
      setTickets(res.content.filter((t) => t.assignedTechnicianId === auth.id))
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

  return (
    <AppLayout>
      <PageHeader
        title='My Tickets'
        subtitle='Tickets assigned to you.'
        breadcrumbs={[{ label: 'Technician' }, { label: 'My Tickets' }]}
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

      {/* Detail Drawer */}
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
