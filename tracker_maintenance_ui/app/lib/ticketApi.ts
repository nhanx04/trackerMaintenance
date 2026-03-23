import { authFetch } from '@/lib/api'
import type {
  Ticket,
  TicketPage,
  TicketFilter,
  TicketImage,
  ImageType,
  CreateTicketRequest,
  UpdateTicketRequest
} from '@/types/ticket'

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

  if (res.status === 204) {
    return undefined as T
  }

  const text = await res.text()
  if (!text) return undefined as T

  const data = JSON.parse(text) as ApiResponse<T>
  return data.result
}

async function reqForm<T>(path: string, form: FormData): Promise<T> {
  const res = await authFetch(path, {
    method: 'POST',
    body: form
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Upload failed: ${res.status}`)
  }
  const data = (await res.json()) as ApiResponse<T>
  return data.result
}

export const ticketApi = {
  getAll: (filter: TicketFilter): Promise<TicketPage> => {
    const p = new URLSearchParams()
    if (filter.title) p.set('title', filter.title)
    if (filter.status) p.set('status', filter.status)
    if (filter.priority) p.set('priority', filter.priority)
    if (filter.deviceId) p.set('deviceId', filter.deviceId)
    p.set('page', String(filter.page))
    p.set('size', String(filter.size))
    return req<TicketPage>(`/api/tickets?${p}`)
  },

  getById: (id: string): Promise<Ticket> => req<Ticket>(`/api/tickets/${id}`),

  create: (data: CreateTicketRequest): Promise<Ticket> =>
    req<Ticket>('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  update: (id: string, data: UpdateTicketRequest): Promise<Ticket> =>
    req<Ticket>(`/api/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  cancel: (id: string): Promise<Ticket> => req<Ticket>(`/api/tickets/${id}/cancel`, { method: 'PATCH' }),

  delete: (id: string): Promise<void> => req<void>(`/api/tickets/${id}`, { method: 'DELETE' }),

  uploadImages: (ticketId: string, type: 'before' | 'after', files: File[]): Promise<TicketImage[]> => {
    const form = new FormData()
    files.forEach((f) => form.append('files', f))
    return reqForm<TicketImage[]>(`/api/tickets/${ticketId}/images/${type}`, form)
  },

  getImages: (ticketId: string, type?: ImageType): Promise<TicketImage[]> => {
    const url = type ? `/api/tickets/${ticketId}/images?type=${type}` : `/api/tickets/${ticketId}/images`
    return req<TicketImage[]>(url)
  },

  deleteImage: (ticketId: string, imageId: string): Promise<void> =>
    req<void>(`/api/tickets/${ticketId}/images/${imageId}`, { method: 'DELETE' }),

  accept: (id: string): Promise<Ticket> => req<Ticket>(`/api/tickets/${id}/accept`, { method: 'POST' }),

  assign: (id: string, technicianId: string): Promise<Ticket> =>
    req<Ticket>(`/api/tickets/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ technicianId })
    })
}

export type TechnicianUser = {
  id: string
  username: string
  firstName?: string
  lastName?: string
  roles: string[]
}

export type UserPage = {
  content: TechnicianUser[]
  totalPages: number
  totalElements: number
}

export const getTechnicians = (page = 0, size = 100) =>
  req<UserPage>(`/api/users/by-role?role=TECHNICIAN&page=${page}&size=${size}`)
