import { FiClipboard, FiHardDrive, FiTool, FiTrendingUp } from 'react-icons/fi'

import { AppLayout } from '@/layouts/AppLayout'
import { DataTableWrapper } from '@/components/ui-custom/DataTableWrapper'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { StatCard } from '@/components/ui-custom/StatCard'
import { StatusBadge } from '@/components/ui-custom/StatusBadge'

export default function HomePage() {
  return (
    <AppLayout>
      <PageHeader
        title='Dashboard Overview'
        subtitle='Monitor maintenance performance, ticket status, and equipment health in one place.'
        breadcrumbs={[{ label: 'Manager' }, { label: 'Dashboard' }]}
        action={
          <button className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'>
            Export Report
          </button>
        }
      />

      <section className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <StatCard title='Open Tickets' value='128' description='12% higher than last week' icon={FiClipboard} />
        <StatCard title='In Progress' value='46' description='Average resolve time: 2.4 days' icon={FiTool} />
        <StatCard title='Equipment Monitored' value='1,204' description='Across 3 facilities' icon={FiHardDrive} />
        <StatCard title='Completion Rate' value='92.8%' description='Up by 3.2% this month' icon={FiTrendingUp} />
      </section>

      <section className='mt-6'>
        <DataTableWrapper title='Recent Tickets'>
          <div className='overflow-x-auto'>
            <table className='min-w-full text-left text-sm'>
              <thead>
                <tr className='border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400'>
                  <th className='px-3 py-3 font-medium'>Ticket ID</th>
                  <th className='px-3 py-3 font-medium'>Equipment</th>
                  <th className='px-3 py-3 font-medium'>Area</th>
                  <th className='px-3 py-3 font-medium'>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'TCK-3201', equipment: 'HVAC Pump A1', area: 'Tower B', status: 'In Progress' as const },
                  { id: 'TCK-3198', equipment: 'Generator G4', area: 'Factory 1', status: 'Waiting Manager' as const },
                  { id: 'TCK-3193', equipment: 'Elevator Motor', area: 'Block C', status: 'Assigned' as const }
                ].map((row) => (
                  <tr key={row.id} className='border-b border-slate-100 dark:border-slate-800/80'>
                    <td className='px-3 py-3 font-medium text-slate-800 dark:text-slate-100'>{row.id}</td>
                    <td className='px-3 py-3 text-slate-600 dark:text-slate-300'>{row.equipment}</td>
                    <td className='px-3 py-3 text-slate-600 dark:text-slate-300'>{row.area}</td>
                    <td className='px-3 py-3'>
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataTableWrapper>
      </section>
    </AppLayout>
  )
}

