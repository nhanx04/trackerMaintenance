import { useEffect, useMemo, useState } from 'react'
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiHardDrive,
  FiRefreshCw,
  FiTool,
  FiXCircle
} from 'react-icons/fi'

import { DataTableWrapper } from '@/components/ui-custom/DataTableWrapper'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { StatCard } from '@/components/ui-custom/StatCard'
import { getDashboardSummary, type DashboardSummary } from '@/lib/dashboardApi'
import { AppLayout } from '@/layouts/AppLayout'

const today = new Date().toISOString().slice(0, 10)

function PieChartCard({
  title,
  data
}: {
  title: string
  data: Array<{ label: string; value: number; color: string }>
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const radius = 60
  const strokeWidth = 20
  const circumference = 2 * Math.PI * radius
  let cumulative = 0

  return (
    <article className='rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 sm:p-5'>
      <h3 className='text-sm font-semibold text-slate-700 dark:text-slate-200'>{title}</h3>
      <div className='mt-4 flex flex-col items-center gap-4 sm:flex-row'>
        {/* Chart — shrinks on mobile */}
        <div className='relative flex-shrink-0'>
          <svg width='148' height='148' viewBox='0 0 148 148' className='-rotate-90'>
            <circle cx='74' cy='74' r={radius} fill='transparent' stroke='#e2e8f0' strokeWidth={strokeWidth} />
            {total > 0 &&
              data.map((item) => {
                const segment = (item.value / total) * circumference
                const dasharray = `${segment} ${circumference - segment}`
                const dashoffset = -cumulative
                cumulative += segment
                return (
                  <circle
                    key={item.label}
                    cx='74'
                    cy='74'
                    r={radius}
                    fill='transparent'
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={dasharray}
                    strokeDashoffset={dashoffset}
                  />
                )
              })}
          </svg>
          <div className='pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-700 dark:text-slate-100'>
            {total}
          </div>
        </div>

        {/* Legend — full width on mobile, fills remaining space on sm+ */}
        <ul className='w-full space-y-2'>
          {data.map((item) => {
            const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'
            return (
              <li
                key={item.label}
                className='flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 dark:bg-slate-900/60'
              >
                <div className='flex items-center gap-2 text-xs text-slate-700 sm:text-sm dark:text-slate-200'>
                  <span className='h-2.5 w-2.5 flex-shrink-0 rounded-full' style={{ backgroundColor: item.color }} />
                  {item.label}
                </div>
                <span className='ml-2 whitespace-nowrap text-xs font-semibold text-slate-800 sm:text-sm dark:text-slate-100'>
                  {item.value} ({percent}%)
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </article>
  )
}

export function DashboardOverview({ roleLabel }: { roleLabel: string }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState(today)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardSummary | null>(null)

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const summary = await getDashboardSummary({ startDate, endDate })
      setData(summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ticketStats = useMemo(() => {
    const source = data?.ticketsByStatus ?? {}
    return {
      newTickets: source.PENDING ?? 0,
      inProgress: (source.ASSIGNED ?? 0) + (source.IN_PROGRESS ?? 0) + (source.WAITING_FOR_CONFIRMATION ?? 0),
      completed: source.DONE ?? 0,
      cancelled: (source.CANCELLED ?? 0) + (source.UNRESOLVABLE ?? 0)
    }
  }, [data])

  const deviceStats = useMemo(() => {
    const source = data?.devicesByStatus ?? {}
    return {
      available: source.AVAILABLE ?? 0,
      inMaintenance: source.MAINTENANCE ?? 0,
      broken: source.BROKEN ?? 0
    }
  }, [data])

  const ticketPieData = [
    { label: 'New', value: ticketStats.newTickets, color: '#3b82f6' },
    { label: 'In Progress', value: ticketStats.inProgress, color: '#f59e0b' },
    { label: 'Completed', value: ticketStats.completed, color: '#22c55e' },
    { label: 'Cancelled', value: ticketStats.cancelled, color: '#ef4444' }
  ]

  const devicePieData = [
    { label: 'Available', value: deviceStats.available, color: '#10b981' },
    { label: 'Maintenance', value: deviceStats.inMaintenance, color: '#f59e0b' },
    { label: 'Broken', value: deviceStats.broken, color: '#ef4444' }
  ]

  return (
    <AppLayout>
      {/* ── Header banner with filter ── */}
      <div className='rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 p-4 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950'>
        <PageHeader
          title={`${roleLabel} Dashboard`}
          subtitle='Track ticket flow, device health and maintenance performance.'
          breadcrumbs={[{ label: roleLabel }, { label: 'Dashboard' }]}
          action={
            // Stack vertically on mobile, row on sm+
            <div className='flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end'>
              <div className='flex flex-1 gap-2'>
                <div className='flex-1'>
                  <label
                    htmlFor='startDate'
                    className='mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300'
                  >
                    Start date
                  </label>
                  <input
                    id='startDate'
                    type='date'
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className='w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900'
                  />
                </div>
                <div className='flex-1'>
                  <label
                    htmlFor='endDate'
                    className='mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300'
                  >
                    End date
                  </label>
                  <input
                    id='endDate'
                    type='date'
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className='w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900'
                  />
                </div>
              </div>
              <button
                onClick={() => void fetchDashboard()}
                className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:from-blue-700 hover:to-indigo-700 sm:w-auto'
              >
                <FiRefreshCw className='h-4 w-4' />
                Apply
              </button>
            </div>
          }
        />
      </div>

      {error && (
        <div className='mb-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-300'>
          {error}
        </div>
      )}

      {/* ── Ticket stat cards: 2 cols on mobile, 4 on xl ── */}
      <section className='mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4'>
        <StatCard
          title='New Tickets'
          value={ticketStats.newTickets}
          icon={FiClipboard}
          className='border-blue-200 bg-blue-50/60 dark:border-blue-900/60 dark:bg-blue-900/10'
        />
        <StatCard
          title='In Progress'
          value={ticketStats.inProgress}
          icon={FiTool}
          className='border-amber-200 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-900/10'
        />
        <StatCard
          title='Completed'
          value={ticketStats.completed}
          icon={FiCheckCircle}
          className='border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-900/10'
        />
        <StatCard
          title='Cancelled'
          value={ticketStats.cancelled}
          icon={FiXCircle}
          className='border-rose-200 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-900/10'
        />
      </section>

      {/* ── Device stat cards: 1 col → 3 cols ── */}
      <section className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 xl:gap-4'>
        <StatCard
          title='Available Devices'
          value={deviceStats.available}
          icon={FiHardDrive}
          className='border-teal-200 bg-teal-50/60 dark:border-teal-900/60 dark:bg-teal-900/10'
        />
        <StatCard
          title='In Maintenance'
          value={deviceStats.inMaintenance}
          icon={FiTool}
          className='border-orange-200 bg-orange-50/60 dark:border-orange-900/60 dark:bg-orange-900/10'
        />
        <StatCard
          title='Broken Devices'
          value={deviceStats.broken}
          icon={FiAlertTriangle}
          className='border-red-200 bg-red-50/60 dark:border-red-900/60 dark:bg-red-900/10'
        />
      </section>

      {/* ── Pie charts: stacked on mobile, side-by-side on xl ── */}
      <section className='mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2 xl:gap-4'>
        <PieChartCard title='Ticket Distribution' data={ticketPieData} />
        <PieChartCard title='Device Status Distribution' data={devicePieData} />
      </section>

      {/* ── Bottom section: table + avg time ── */}
      <section className='mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3 xl:gap-4'>
        <div className='xl:col-span-2'>
          <DataTableWrapper title='Top Defective Devices'>
            <div className='overflow-x-auto'>
              <table className='min-w-full text-left text-sm'>
                <thead>
                  <tr className='border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400'>
                    <th className='px-3 py-3 font-medium'>Device ID</th>
                    <th className='px-3 py-3 font-medium'>Failure Count</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className='px-3 py-4 text-slate-500 dark:text-slate-400' colSpan={2}>
                        Loading data...
                      </td>
                    </tr>
                  ) : (data?.topDefectiveDevices?.length ?? 0) === 0 ? (
                    <tr>
                      <td className='px-3 py-4 text-slate-500 dark:text-slate-400' colSpan={2}>
                        No defective device data in this period.
                      </td>
                    </tr>
                  ) : (
                    data?.topDefectiveDevices.map((item) => (
                      <tr key={item.deviceId} className='border-b border-slate-100 dark:border-slate-800/80'>
                        <td className='px-3 py-3 font-medium text-slate-800 dark:text-slate-100'>{item.deviceId}</td>
                        <td className='px-3 py-3 text-slate-600 dark:text-slate-300'>{item.failureCount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </DataTableWrapper>
        </div>

        {/* Avg time — full width on mobile, 1 col on xl */}
        <StatCard
          title='Avg Processing Time'
          value={loading ? '...' : (data?.averageProcessingTimeHours ?? 0).toFixed(2)}
          description='Hours from assignment to completion'
          icon={FiClock}
          className='border-violet-200 bg-violet-50/70 dark:border-violet-900/60 dark:bg-violet-900/10'
        />
      </section>
    </AppLayout>
  )
}
