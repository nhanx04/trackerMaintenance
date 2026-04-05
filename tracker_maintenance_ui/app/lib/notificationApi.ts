import { authFetch } from '@/lib/api'
import type { Notification, NotificationPage } from '@/types/notification'

type ApiResponse<T> = { code?: number; message?: string; result: T }

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await authFetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    }
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }

  const text = await res.text()
  if (!text) return undefined as T

  const data = JSON.parse(text) as ApiResponse<T>
  return data.result
}

export const notificationApi = {
  getAll: async (page = 0, size = 10): Promise<NotificationPage> => {
    const data = await req<any>(`/api/notifications?page=${page}&size=${size}`)

    return {
      ...data,
      content: data.content.map((n: any) => ({
        ...n,
        isRead: n.read
      }))
    }
  },

  getUnreadCount: (): Promise<number> => req<number>('/api/notifications/unread-count'),

  markAsRead: async (id: string): Promise<Notification> => {
    const n = await req<any>(`/api/notifications/${id}/read`, { method: 'PUT' })

    return {
      ...n,
      isRead: n.read
    }
  },

  markAllAsRead: (): Promise<void> => req<void>('/api/notifications/read-all', { method: 'PUT' })
}
