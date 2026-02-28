import type { IconType } from 'react-icons'

export type UserRole = 'Manager' | 'Technician' | 'Reporter'

export type TicketStatus =
  | 'New'
  | 'Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Cannot Resolve'
  | 'Waiting Manager'

export type NavItem = {
  label: string
  path: string
  icon: IconType
}

export type BreadcrumbItem = {
  label: string
  href?: string
}

