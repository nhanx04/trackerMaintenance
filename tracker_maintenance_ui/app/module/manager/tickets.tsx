import { RoleLanding } from '@/module/shared/RoleLanding'

export default function ManagerTicketsPage() {
  return <RoleLanding title='Tickets' subtitle='Review and assign maintenance tickets across all facilities.' breadcrumbs={[{ label: 'Manager' }, { label: 'Tickets' }]} />
}

