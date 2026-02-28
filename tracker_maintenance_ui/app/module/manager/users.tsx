import { RoleLanding } from '@/module/shared/RoleLanding'

export default function ManagerUsersPage() {
  return <RoleLanding title='Users' subtitle='Manage user accounts, permissions, and team structure.' breadcrumbs={[{ label: 'Manager' }, { label: 'Users' }]} />
}

