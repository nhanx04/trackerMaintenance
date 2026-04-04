import { apiRequest } from '@/lib/api'

export type DashboardSummary = {
  ticketsByStatus: Partial<Record<'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING_FOR_CONFIRMATION' | 'DONE' | 'CANCELLED' | 'UNRESOLVABLE', number>>
  devicesByStatus: Partial<Record<'AVAILABLE' | 'MAINTENANCE' | 'BROKEN', number>>
  topDefectiveDevices: Array<{
    deviceId: string
    failureCount: number
  }>
  averageProcessingTimeHours: number
}

const toIso = (value?: string) => {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}

export async function getDashboardSummary(params?: { startDate?: string; endDate?: string }) {
  const query = new URLSearchParams()
  const start = toIso(params?.startDate)
  const end = toIso(params?.endDate)

  if (start) query.set('startDate', start)
  if (end) query.set('endDate', end)

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiRequest<DashboardSummary>(`/api/dashboard/summary${suffix}`)
}

