import { RoleLanding } from '@/module/shared/RoleLanding'

export default function TechnicianMyTicketsPage() {
  return <RoleLanding title='My Tickets' subtitle='View and update tickets currently assigned to you.' breadcrumbs={[{ label: 'Technician' }, { label: 'My Tickets' }]} />
}

