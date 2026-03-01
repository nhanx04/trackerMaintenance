import { API_BASE_URL } from '@/lib/api'
import { getAuth } from '@/lib/auth'
import type {
  Ticket, TicketPage, TicketFilter,
  TicketImage, ImageType,
  CreateTicketRequest, UpdateTicketRequest
} from '@/types/ticket'

function token(): string {
  const auth = getAuth()
  if (!auth?.token) throw new Error('Unauthenticated')
  return auth.token
}

type ApiResponse<T> = { code?: number; message?: string; result: T }

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`,
      ...(init?.headers ?? {})
    }
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }
  const data = (await res.json()) as ApiResponse<T>
  return data.result
}

async function reqForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}` },
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
    if (filter.title)    p.set('title',    filter.title)
    if (filter.status)   p.set('status',   filter.status)
    if (filter.priority) p.set('priority', filter.priority)
    if (filter.deviceId) p.set('deviceId', filter.deviceId)
    p.set('page', String(filter.page))
    p.set('size', String(filter.size))
    return req<TicketPage>(`/api/tickets?${p}`)
  },

  getById: (id: string): Promise<Ticket> =>
    req<Ticket>(`/api/tickets/${id}`),

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

  cancel: (id: string): Promise<Ticket> =>
    req<Ticket>(`/api/tickets/${id}/cancel`, { method: 'PATCH' }),

  delete: (id: string): Promise<void> =>
    req<void>(`/api/tickets/${id}`, { method: 'DELETE' }),

  uploadImages: (ticketId: string, type: 'before' | 'after', files: File[]): Promise<TicketImage[]> => {
    const form = new FormData()
    files.forEach(f => form.append('files', f))
    return reqForm<TicketImage[]>(`/api/tickets/${ticketId}/images/${type}`, form)
  },

  getImages: (ticketId: string, type?: ImageType): Promise<TicketImage[]> => {
    const url = type
      ? `/api/tickets/${ticketId}/images?type=${type}`
      : `/api/tickets/${ticketId}/images`
    return req<TicketImage[]>(url)
  },

  deleteImage: (ticketId: string, imageId: string): Promise<void> =>
    req<void>(`/api/tickets/${ticketId}/images/${imageId}`, { method: 'DELETE' })
}