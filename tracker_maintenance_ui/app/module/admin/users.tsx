import { RoleLanding } from '@/module/shared/RoleLanding'

export default function AdminUsersPage() {
  return <RoleLanding title='User Management' subtitle='View, search, and administer all platform accounts.' breadcrumbs={[{ label: 'Admin' }, { label: 'Users' }]} />
}

