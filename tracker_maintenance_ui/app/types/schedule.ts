export type ScheduleStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'

export interface MaintenanceSchedule {
  id: string
  deviceId: string
  title: string
  description?: string
  scheduledDate: string
  assignedTechnicianId?: string
  createdByUserId?: string
  status: ScheduleStatus
  createdAt?: string
  updatedAt?: string
}

export interface CreateSchedulePayload {
  deviceId: string
  title: string
  description?: string
  scheduledDate: string
  assignedTechnicianId?: string
}

export interface UpdateSchedulePayload {
  title?: string
  description?: string
  scheduledDate?: string
  assignedTechnicianId?: string
  status?: ScheduleStatus
}

export interface SchedulePage {
  content: MaintenanceSchedule[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}

