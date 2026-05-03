import { useLoaderData } from 'react-router'
import { EquipmentPublicView } from '@/components/equipment/EquipmentPublicView'
import { useState } from 'react'
import { MaintenanceHistoryTab } from '@/module/manager/history'
import { API_BASE_URL } from '@/lib/api'
import { cn } from '@/lib/cn'
import { FiInfo, FiClock } from 'react-icons/fi'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { AppLayout } from '@/layouts/AppLayout'

export async function loader({ params }: any) {
  const res = await fetch(`${API_BASE_URL}/api/devices/public/${params.id}`)

  const json = await res.json()
  return json.result
}

export default function PublicEquipmentDetailPage() {
  const equipment = useLoaderData()
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info')
  const tabs = [
    { id: 'info', label: 'Equipment Info', icon: FiInfo },
    { id: 'history', label: 'Maintenance History', icon: FiClock }
  ]

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      <main className='mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6'>
        <PageHeader
          title='Equipment Detail'
          subtitle='View complete asset profile and metadata'
          breadcrumbs={[{ label: 'Public' }, { label: equipment?.name || 'Detail' }]}
        />
        {/* TAB */}
        <div className='mb-6 flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800/60 w-full sm:w-fit'>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'info' | 'history')}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150',
                activeTab === id
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              <Icon className='h-4 w-4' />
              {label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        {activeTab === 'info' && <EquipmentPublicView equipment={equipment} />}

        {activeTab === 'history' && (
          <div className='p-6'>
            <MaintenanceHistoryTab deviceId={equipment.id} />
          </div>
        )}
      </main>
    </div>
  )
}
