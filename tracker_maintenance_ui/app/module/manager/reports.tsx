import { RoleLanding } from '@/module/shared/RoleLanding'

export default function ManagerReportsPage() {
  return <RoleLanding title='Reports' subtitle='Generate KPI reports for maintenance efficiency and SLA adherence.' breadcrumbs={[{ label: 'Manager' }, { label: 'Reports' }]} />
}

