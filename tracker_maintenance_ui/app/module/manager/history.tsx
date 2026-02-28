import { RoleLanding } from '@/module/shared/RoleLanding'

export default function ManagerHistoryPage() {
  return <RoleLanding title='Maintenance History' subtitle='Audit completed maintenance and repair logs by equipment and date.' breadcrumbs={[{ label: 'Manager' }, { label: 'Maintenance History' }]} />
}

