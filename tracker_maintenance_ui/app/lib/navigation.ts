import {
  FiActivity,
  FiBarChart2,
  FiClipboard,
  FiGrid,
  FiHardDrive,
  FiPlusCircle,
  FiTool,
  FiUsers
} from 'react-icons/fi'

import type { NavItem, UserRole } from '@/types/ui'

export const roleMenu: Record<UserRole, NavItem[]> = {
  Manager: [
    { label: 'Dashboard', path: '/manager/dashboard', icon: FiGrid },
    { label: 'Equipment', path: '/manager/equipment', icon: FiHardDrive },
    { label: 'Tickets', path: '/manager/tickets', icon: FiClipboard },
    { label: 'Users', path: '/manager/users', icon: FiUsers },
    { label: 'Maintenance History', path: '/manager/history', icon: FiActivity },
    { label: 'Reports', path: '/manager/reports', icon: FiBarChart2 }
  ],
  Technician: [
    { label: 'My Tickets', path: '/technician/my-tickets', icon: FiTool },
    { label: 'Available Tickets', path: '/technician/available-tickets', icon: FiClipboard }
  ],
  Reporter: [
    { label: 'My Tickets', path: '/reporter/my-tickets', icon: FiClipboard },
    { label: 'Create Ticket', path: '/reporter/create-ticket', icon: FiPlusCircle }
  ]
}
