import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { FiBell, FiCheck, FiCheckCircle, FiInbox } from 'react-icons/fi'
import { cn } from '@/lib/cn'
import { notificationApi } from '@/lib/notificationApi'
import type { Notification } from '@/types/notification'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function NotificationDropdown() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void fetchInitialNotifications()
  }, [])

  async function fetchInitialNotifications() {
    try {
      const page = await notificationApi.getAll(0, 20)
      setNotifications(page.content)
      setUnreadCount(page.content.filter((n) => !n.isRead).length)
    } catch {
      // ignore
    }
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleOpen() {
    setOpen((v) => !v)

    if (!open) {
      setLoading(true)
      try {
        const page = await notificationApi.getAll(0, 20)
        setNotifications(page.content)
        setUnreadCount(page.content.filter((n) => !n.isRead).length)
      } finally {
        setLoading(false)
      }
    }
  }

  async function handleMarkAsRead(notification: Notification) {
    await notificationApi.markAsRead(notification.id)

    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)))

    setUnreadCount((c) => Math.max(0, c - 1))
  }

  async function handleMarkAllAsRead() {
    try {
      await notificationApi.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      // silent fail
    }
  }

  return (
    <div className='relative' ref={ref}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className='relative rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800'
        aria-label='Notifications'
      >
        <FiBell className='h-5 w-5' />
        {unreadCount > 0 && (
          <span className='absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className='absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:w-96'>
          {/* Header */}
          <div className='flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800'>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Notifications</h3>
              {unreadCount > 0 && (
                <span className='rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'>
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className='inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10'
              >
                <FiCheck className='h-3.5 w-3.5' />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className='max-h-96 overflow-y-auto'>
            {loading ? (
              <div className='space-y-3 p-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className='flex gap-3'>
                    <div className='h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800' />
                    <div className='flex-1 space-y-2'>
                      <div className='h-3 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800' />
                      <div className='h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800' />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-10 text-center'>
                <FiInbox className='mb-2 h-8 w-8 text-slate-300 dark:text-slate-600' />
                <p className='text-sm font-medium text-slate-500 dark:text-slate-400'>No notifications yet</p>
              </div>
            ) : (
              <ul className='divide-y divide-slate-50 dark:divide-slate-800'>
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => void handleMarkAsRead(n)}
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60',
                        !n.isRead && 'bg-blue-50/60 dark:bg-blue-500/5'
                      )}
                    >
                      {/* Unread dot */}
                      <div className='mt-1.5 flex-shrink-0'>
                        {n.isRead ? (
                          <FiCheckCircle className='h-4 w-4 text-slate-300 dark:text-slate-600' />
                        ) : (
                          <span className='block h-2.5 w-2.5 rounded-full bg-blue-500' />
                        )}
                      </div>

                      <div className='min-w-0 flex-1'>
                        <p
                          className={cn(
                            'truncate text-xs font-semibold',
                            n.isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'
                          )}
                        >
                          {n.title}
                        </p>
                        <p className='mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400'>{n.message}</p>
                        <p className='mt-1 text-[10px] text-slate-400 dark:text-slate-500'>{timeAgo(n.createdAt)}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
