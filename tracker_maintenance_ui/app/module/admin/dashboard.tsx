import { RoleLanding } from '@/module/shared/RoleLanding'

export default function AdminDashboardPage() {
  return <RoleLanding title='Admin Dashboard' subtitle='Control users, roles, and overall system governance.' breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]} />
}

