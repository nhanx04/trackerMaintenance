import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('welcome/welcome.tsx'),
  route('home', 'module/home/index.tsx'),
  route('login', 'module/auth/login.tsx'),
  route('manager/dashboard', 'module/manager/dashboard.tsx'),
  route('manager/equipment', 'module/manager/equipment.tsx'),
  route('manager/equipment/:id', 'module/manager/equipmentDetail.tsx'),
  route('manager/tickets', 'module/manager/tickets.tsx'),
  route('manager/history', 'module/manager/history.tsx'),
  route('manager/maintenance', 'module/manager/maintenance.tsx'),
  route('manager/reports', 'module/manager/reports.tsx'),
  route('manager/create-ticket', 'module/manager/createTicket.tsx'),
  route('admin/dashboard', 'module/admin/dashboard.tsx'),
  route('admin/users', 'module/admin/users.tsx'),
  route('admin/users/create', 'module/admin/createUser.tsx'),
  route('admin/tickets', 'module/admin/tickets.tsx'),
  route('admin/settings', 'module/admin/settings.tsx'),
  route('admin/create-ticket', 'module/admin/createTicket.tsx'),
  route('technician/my-tickets', 'module/technician/myTickets.tsx'),
  route('technician/available-tickets', 'module/technician/availableTickets.tsx'),
  route('reporter/my-tickets', 'module/reporter/myTickets.tsx'),
  route('reporter/create-ticket', 'module/reporter/createTicket.tsx')
] satisfies RouteConfig
