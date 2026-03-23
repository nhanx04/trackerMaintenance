import { useEffect, useState } from 'react'
import { FiImage, FiLoader, FiSend } from 'react-icons/fi'

import { ticketApi } from '@/lib/ticketApi'
import { formatDate } from '@/lib/ticketUtils'
import type { TicketProgress, TicketStatus } from '@/types/ticket'

type Props = {
  ticketId: string
  ticketStatus?: TicketStatus
  allowCreate?: boolean
}

export function TicketProgressPanel({ ticketId, ticketStatus, allowCreate = false }: Props) {
  const [items, setItems] = useState<TicketProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [note, setNote] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

  const canPostProgress = allowCreate && ticketStatus === 'IN_PROGRESS'

  async function fetchProgress() {
    setLoading(true)
    setError(null)
    try {
      const data = await ticketApi.getProgressHistory(ticketId)
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load progress')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProgress()
  }, [ticketId])

  async function handleSubmit() {
    if (!canPostProgress) return
    if (!note.trim()) {
      setError('Please enter progress note')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await ticketApi.updateProgress(ticketId, note.trim(), files)
      setNote('')
      setFiles([])
      await fetchProgress()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit progress')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='space-y-4'>
      {canPostProgress && (
        <div className='rounded-xl border border-slate-200 p-4 dark:border-slate-700'>
          <p className='mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200'>Update Progress</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder='What has been done? What is next?'
            rows={4}
            className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white'
          />

          <label className='mt-3 block text-xs font-medium text-slate-500 dark:text-slate-400'>Attach images (optional)</label>
          <input
            type='file'
            multiple
            accept='image/*'
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className='mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          />

          {files.length > 0 && <p className='mt-2 text-xs text-slate-500 dark:text-slate-400'>{files.length} file(s) selected</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting || !note.trim()}
            className='mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60'
          >
            {submitting ? <FiLoader className='h-4 w-4 animate-spin' /> : <FiSend className='h-4 w-4' />}
            {submitting ? 'Submitting...' : 'Submit Progress'}
          </button>
        </div>
      )}

      {allowCreate && ticketStatus !== 'IN_PROGRESS' && (
        <p className='rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-400'>
          Progress updates are available when ticket is <strong>In Progress</strong>.
        </p>
      )}

      {error && (
        <div className='rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400'>
          {error}
        </div>
      )}

      {loading ? (
        <p className='text-sm text-slate-400'>Loading progress...</p>
      ) : items.length === 0 ? (
        <p className='rounded-lg border border-dashed py-8 text-center text-sm text-slate-400'>No progress updates yet</p>
      ) : (
        <div className='space-y-3'>
          {items.map((p) => (
            <div key={p.id} className='rounded-xl border border-slate-200 p-4 dark:border-slate-700'>
              <p className='text-xs text-slate-500 dark:text-slate-400'>{formatDate(p.createdAt)}</p>
              <p className='mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200'>{p.note}</p>

              {p.images.length > 0 && (
                <div className='mt-3'>
                  <p className='mb-2 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400'>
                    <FiImage className='h-3.5 w-3.5' />
                    {p.images.length} image(s)
                  </p>
                  <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
                    {p.images.map((img) => (
                      <a key={img.id} href={img.imageUrl} target='_blank' rel='noreferrer' className='overflow-hidden rounded-lg border'>
                        <img src={img.imageUrl} className='h-24 w-full object-cover' />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

