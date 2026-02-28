import { RoleLanding } from '@/module/shared/RoleLanding'

export default function TechnicianAvailableTicketsPage() {
  return <RoleLanding title='Available Tickets' subtitle='Browse unassigned tasks and claim work orders by priority.' breadcrumbs={[{ label: 'Technician' }, { label: 'Available Tickets' }]} />
}

