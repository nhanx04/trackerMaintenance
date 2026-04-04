import { useEffect, useMemo, useState } from 'react'
import { FiLoader, FiMessageCircle, FiSend } from 'react-icons/fi'

import { ticketApi } from '@/lib/ticketApi'
import { formatDate } from '@/lib/ticketUtils'
import type { TicketComment } from '@/types/ticket'

type Props = {
  ticketId: string
}

export function TicketCommentsPanel({ ticketId }: Props) {
  const [items, setItems] = useState<TicketComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [content, setContent] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [items]
  )

  async function fetchComments() {
    setLoading(true)
    setError(null)
    try {
      const data = await ticketApi.getComments(ticketId)
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [ticketId])

  async function handleSubmit() {
    const trimmed = content.trim()
    if (!trimmed) {
      setSubmitError('Comment cannot be empty')
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    setError(null)
    try {
      await ticketApi.addComment(ticketId, trimmed)
      setContent('')
      await fetchComments()
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='space-y-4'>
      <div className='rounded-xl border border-slate-200 p-4 dark:border-slate-700'>
        <p className='mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200'>Add Comment</p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder='Enter your comment...'
          className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white'
        />

        {submitError && (
          <p className='mt-2 text-xs text-rose-600 dark:text-rose-400'>
            {submitError}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || !content.trim()}
          className='mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60'
        >
          {submitting ? <FiLoader className='h-4 w-4 animate-spin' /> : <FiSend className='h-4 w-4' />}
          {submitting ? 'Sending...' : 'Add Comment'}
        </button>
      </div>

      {error && (
        <div className='rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400'>
          {error}
        </div>
      )}

      {loading ? (
        <p className='text-sm text-slate-400'>Loading comments...</p>
      ) : sortedItems.length === 0 ? (
        <p className='rounded-lg border border-dashed py-8 text-center text-sm text-slate-400'>No comments yet</p>
      ) : (
        <div className='space-y-3'>
          {sortedItems.map((comment) => (
            <div key={comment.id} className='rounded-xl border border-slate-200 p-4 dark:border-slate-700'>
              <div className='flex items-center justify-between gap-3'>
                <p className='text-sm font-semibold text-slate-800 dark:text-slate-200'>{comment.authorName || comment.authorId}</p>
                <p className='text-xs text-slate-500 dark:text-slate-400'>{formatDate(comment.createdAt)}</p>
              </div>
              <p className='mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300'>{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && sortedItems.length > 0 && (
        <p className='inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400'>
          <FiMessageCircle className='h-3.5 w-3.5' />
          {sortedItems.length} comment(s)
        </p>
      )}
    </div>
  )
}

