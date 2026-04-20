import { apiRequest } from '@/lib/api'

export type DashboardSummary = {
  ticketsByStatus: Partial<
    Record<
      'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING_FOR_CONFIRMATION' | 'DONE' | 'CANCELLED' | 'UNRESOLVABLE',
      number
    >
  >
  devicesByStatus: Partial<Record<'AVAILABLE' | 'MAINTENANCE' | 'BROKEN', number>>
  topDefectiveDevices: Array<{
    deviceId: string
    failureCount: number
  }>
  averageProcessingTimeHours: number
}

const pad2 = (n: number) => String(n).padStart(2, '0')

const toBackendDateTime = (value?: string) => {
  if (!value) return undefined

  const raw = value.trim()
  if (!raw) return undefined

  // Already in backend format: yyyy-MM-ddTHH:mm:ss
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}$/.test(raw)) return raw

  // From <input type='date'>: yyyy-MM-dd => append midnight
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(raw)) return `${raw}T00:00:00`

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return undefined

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
}

export async function getDashboardSummary(params?: { startDate?: string; endDate?: string }) {
  const query = new URLSearchParams()
  const start = toBackendDateTime(params?.startDate)
  const end = toBackendDateTime(params?.endDate)

  if (start) query.set('startDate', start)
  if (end) query.set('endDate', end)

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiRequest<DashboardSummary>(`/api/dashboard/summary${suffix}`)
}
