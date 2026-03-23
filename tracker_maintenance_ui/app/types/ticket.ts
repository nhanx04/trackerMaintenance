import type { PageResult } from './auth'

export type TicketStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_CONFIRMATION'
  | 'UNRESOLVABLE'
  | 'DONE'
  | 'CANCELLED'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type ImageType = 'BEFORE' | 'AFTER'

export interface TicketImage {
  id: string
  ticketId: string
  imageUrl: string
  imageType: ImageType
  uploadedByUserId: string
  uploadedAt: string
}

export interface Ticket {
  id: string
  title: string
  description?: string
  status: TicketStatus
  priority: TicketPriority
  deviceId: string
  assignedTechnicianId?: string
  createdByUserId: string
  scheduledDate?: string
  createdAt: string
  updatedAt: string
}

export type TicketPage = PageResult<Ticket>

export interface CreateTicketRequest {
  title: string
  description?: string
  priority: TicketPriority
  deviceId: string
  assignedTechnicianId?: string
  scheduledDate?: string
}

export interface UpdateTicketRequest {
  title?: string
  description?: string
  priority?: TicketPriority
  status?: TicketStatus
  assignedTechnicianId?: string | null
  scheduledDate?: string
}

export interface TicketFilter {
  title?: string
  status?: TicketStatus | ''
  priority?: TicketPriority | ''
  deviceId?: string
  page: number
  size: number
}

// export type CreateTicketForm = {
//   title: string
//   deviceId: string
//   priority?: TicketPriority
//   description?: string
//   scheduledDate?: string
// }

// export type CreateTicketErrors = Partial<Record<keyof CreateTicketForm, string>>
