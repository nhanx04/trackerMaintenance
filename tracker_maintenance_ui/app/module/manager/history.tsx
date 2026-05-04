import { useEffect, useMemo, useState } from 'react'

import { PageHeader } from '@/components/ui-custom/PageHeader'
import { AppLayout } from '@/layouts/AppLayout'
import { equipmentApi } from '@/lib/equipmentApi'
import { scheduleApi } from '@/lib/scheduleApi'
import type { Equipment } from '@/types/equipment'
import type { MaintenanceSchedule } from '@/types/schedule'

type ScheduleHistoryProps = {
  history: MaintenanceSchedule[]
  equipmentMap: Record<string, string>
}

export default function ManagerHistoryPage() {
  const [history, setHistory] = useState<MaintenanceSchedule[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const equipmentMap = useMemo(
    () => Object.fromEntries(equipment.map((item) => [String(item.id), item.name])),
    [equipment]
  )

  useEffect(() => {
    void loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [historyPage, equipmentPage] = await Promise.all([
        scheduleApi.getHistory(0, 200),
        equipmentApi.getAll({ page: 0, size: 200 })
      ])
      setHistory(historyPage.content)
      setEquipment(equipmentPage.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load maintenance history')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title='Maintenance History'
        subtitle='Completed maintenance records across all equipment.'
        breadcrumbs={[{ label: 'Manager' }, { label: 'Maintenance History' }]}
      />

      {error && (
        <div className='mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>{error}</div>
      )}

      {loading ? (
        <div className='h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800' />
      ) : (
        <MaintenanceScheduleHistoryTable history={history} equipmentMap={equipmentMap} />
      )}
    </AppLayout>
  )
}

export function MaintenanceScheduleHistoryTable({ history, equipmentMap }: ScheduleHistoryProps) {
  return (
    <section className='mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
      <div className='mb-3 flex items-center justify-between'>
        <h2 className='text-base font-semibold'>Maintenance History</h2>
        <p className='text-sm text-slate-500'>Completed records: {history.length}</p>
      </div>
      <div className='overflow-x-auto'>
        <table className='min-w-full text-left text-sm'>
          <thead>
            <tr className='border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700'>
              <th className='px-3 py-2'>Equipment</th>
              <th className='px-3 py-2'>Title</th>
              <th className='px-3 py-2'>Cycle (days)</th>
              <th className='px-3 py-2'>Scheduled Date</th>
              <th className='px-3 py-2'>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} className='border-b border-slate-100 dark:border-slate-800'>
                <td className='px-3 py-2'>{equipmentMap[item.deviceId] ?? item.deviceId}</td>
                <td className='px-3 py-2'>{item.title}</td>
                <td className='px-3 py-2'>{item.cycleDays}</td>
                <td className='px-3 py-2'>{item.scheduledDate}</td>
                <td className='px-3 py-2'>{item.status}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={5} className='px-3 py-6 text-center text-slate-500'>
                  No maintenance history yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
