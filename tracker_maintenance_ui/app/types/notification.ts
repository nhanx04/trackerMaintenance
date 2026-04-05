export type NotificationType =
  | 'TICKET_CREATED'
  | 'TICKET_ASSIGNED'
  | 'TICKET_ACCEPTED'
  | 'TICKET_PROGRESS_UPDATED'
  | 'TICKET_COMPLETED'
  | 'TICKET_CONFIRMED'
  | 'TICKET_CANCELLED'
  | 'TICKET_UNRESOLVABLE'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  referenceId?: string
  isRead: boolean
  createdAt: string
}

export interface NotificationPage {
  content: Notification[]
  totalPages: number
  totalElements: number
  number: number
  size: number
}
