import { RoleLanding } from '@/module/shared/RoleLanding'

export default function ReporterMyTicketsPage() {
  return <RoleLanding title='My Tickets' subtitle='Track all maintenance requests you have submitted.' breadcrumbs={[{ label: 'Reporter' }, { label: 'My Tickets' }]} />
}

