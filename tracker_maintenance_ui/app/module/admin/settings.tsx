import { RoleLanding } from '@/module/shared/RoleLanding'

export default function AdminSettingsPage() {
  return <RoleLanding title='System Settings' subtitle='Configure global parameters, policies, and maintenance preferences.' breadcrumbs={[{ label: 'Admin' }, { label: 'Settings' }]} />
}

