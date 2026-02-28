import { RoleLanding } from '@/module/shared/RoleLanding'

export default function ManagerEquipmentPage() {
  return <RoleLanding title='Equipment' subtitle='Track asset health, preventive schedules, and equipment lifecycle.' breadcrumbs={[{ label: 'Manager' }, { label: 'Equipment' }]} />
}

