import { authFetch } from '@/lib/api'
import type {
  CreateSchedulePayload,
  MaintenanceSchedule,
  SchedulePage,
  ScheduleStatus,
  UpdateSchedulePayload
} from '@/types/schedule'

type ApiResponse<T> = { code?: number; message?: string; result: T }

type ScheduleFilter = {
  deviceId?: string
  status?: ScheduleStatus
  from?: string
  to?: string
  page?: number
  size?: number
}

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

  const data = (await res.json()) as ApiResponse<T>
  return data.result
}

export const scheduleApi = {
  create: (payload: CreateSchedulePayload) =>
    req<MaintenanceSchedule>('/api/schedules', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getAll: (filter: ScheduleFilter = {}) => {
    const params = new URLSearchParams()
    if (filter.deviceId) params.set('deviceId', filter.deviceId)
    if (filter.status) params.set('status', filter.status)
    if (filter.from) params.set('from', filter.from)
    if (filter.to) params.set('to', filter.to)
    params.set('page', String(filter.page ?? 0))
    params.set('size', String(filter.size ?? 50))

    return req<SchedulePage>(`/api/schedules?${params.toString()}`)
  },

  getUpcoming: (withinDays = 7) => req<MaintenanceSchedule[]>(`/api/schedules/upcoming?withinDays=${withinDays}`),

  complete: (id: string) => req<MaintenanceSchedule>(`/api/schedules/${id}/complete`, { method: 'PATCH' }),

  update: (id: string, payload: UpdateSchedulePayload) =>
    req<MaintenanceSchedule>(`/api/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
}

