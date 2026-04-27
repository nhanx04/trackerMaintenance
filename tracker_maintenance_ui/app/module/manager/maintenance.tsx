import { useEffect, useMemo, useState } from 'react'
import { FiAlertCircle, FiCheckCircle, FiPlus, FiRefreshCw, FiSearch, FiX } from 'react-icons/fi'

import { AppLayout } from '@/layouts/AppLayout'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { getAuth, getUsers } from '@/lib/auth'
import { equipmentApi } from '@/lib/equipmentApi'
import { scheduleApi } from '@/lib/scheduleApi'
import type { BackendUser } from '@/types/auth'
import type { Equipment } from '@/types/equipment'
import type { MaintenanceSchedule } from '@/types/schedule'

type ScheduleFormState = {
  deviceId: string
  title: string
  description: string
  scheduledDate: string
  assignedTechnicianId: string
  cycleDays: string
}

const todayIso = () => new Date().toISOString().slice(0, 10)

export default function ManagerMaintenancePage() {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([])
  const [reminders, setReminders] = useState<MaintenanceSchedule[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [technicians, setTechnicians] = useState<BackendUser[]>([])
  const [history, setHistory] = useState<MaintenanceSchedule[]>([])
  const [techQuery, setTechQuery] = useState('')
  const [techPickerOpen, setTechPickerOpen] = useState(false)
  const [equipmentQuery, setEquipmentQuery] = useState('')
  const [equipmentPickerOpen, setEquipmentPickerOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  const [form, setForm] = useState<ScheduleFormState>({
    deviceId: '',
    title: '',
    description: '',
    scheduledDate: todayIso(),
    assignedTechnicianId: '',
    cycleDays: '30'
  })

  const equipmentMap = useMemo(
    () => Object.fromEntries(equipment.map((item) => [String(item.id), item.name])),
    [equipment]
  )

  const activeSchedules = useMemo(
    () => schedules.filter((s) => s.status === 'PENDING' || s.status === 'IN_PROGRESS'),
    [schedules]
  )

  const overdueSchedules = useMemo(() => {
    const today = todayIso()
    return activeSchedules.filter((s) => s.scheduledDate < today)
  }, [activeSchedules])

  const selectedTechnician = useMemo(
    () => technicians.find((tech) => tech.id === form.assignedTechnicianId),
    [technicians, form.assignedTechnicianId]
  )

  const selectedEquipment = useMemo(
    () => equipment.find((item) => String(item.id) === form.deviceId),
    [equipment, form.deviceId]
  )

  const technicianNameMap = useMemo(() => {
    return Object.fromEntries(
      technicians.map((tech) => {
        const fullName = [tech.firstName, tech.lastName].filter(Boolean).join(' ').trim()
        return [tech.id, fullName || tech.username]
      })
    )
  }, [technicians])

  const filteredTechnicians = useMemo(() => {
    const query = techQuery.trim().toLowerCase()
    if (!query) return technicians
    return technicians.filter((tech) => {
      const fullName = [tech.firstName, tech.lastName].filter(Boolean).join(' ')
      return `${tech.username} ${fullName}`.toLowerCase().includes(query)
    })
  }, [technicians, techQuery])

  const filteredEquipment = useMemo(() => {
    const query = equipmentQuery.trim().toLowerCase()
    if (!query) return equipment
    return equipment.filter((item) => `${item.name} ${item.code} ${item.location ?? ''}`.toLowerCase().includes(query))
  }, [equipment, equipmentQuery])

  useEffect(() => {
    void loadData()
    void loadTechnicians()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [schedulePage, upcoming, equipmentPage, historyPage] = await Promise.all([
        scheduleApi.getAll({ page: 0, size: 200 }),
        scheduleApi.getUpcoming(3),
        equipmentApi.getAll({ page: 0, size: 200 }),
        scheduleApi.getHistory(0, 100)
      ])
      setSchedules(schedulePage.content)
      setReminders(upcoming)
      setEquipment(equipmentPage.content)
      setHistory(historyPage.content)
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Failed to load maintenance data')
    } finally {
      setLoading(false)
    }
  }

  async function loadTechnicians() {
    try {
      const auth = getAuth()
      const response = await getUsers(0, 200, auth?.token)
      setTechnicians(response.content.filter((user) => user.roles.includes('TECHNICIAN') && user.active))
    } catch {
      setToast('Failed to load technicians list')
    }
  }

  async function handleCreateSchedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.deviceId || !form.title || !form.scheduledDate) {
      setToast('Please fill device, title and scheduled date.')
      return
    }

    setSubmitting(true)
    try {
      const cycle = Number(form.cycleDays)
      await scheduleApi.create({
        deviceId: form.deviceId,
        title: form.title,
        description: form.description || undefined,
        scheduledDate: form.scheduledDate,
        assignedTechnicianId: form.assignedTechnicianId || undefined,
        cycleDays: Number.isFinite(cycle) && cycle > 0 ? cycle : 30
      })
      setToast('Maintenance schedule created successfully.')
      setForm((prev) => ({ ...prev, title: '', description: '' }))
      await loadData()
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Failed to create schedule')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleMarkDone(schedule: MaintenanceSchedule) {
    try {
      await scheduleApi.update(schedule.id, { status: 'DONE' })
      setToast('Marked as maintained. Next cycle schedule has been reset.')
      await loadData()
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Failed to mark as maintained')
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title='Periodic Maintenance Scheduling'
        subtitle='Plan proactive maintenance, monitor reminders, and highlight overdue equipment.'
        breadcrumbs={[{ label: 'Manager' }, { label: 'Maintenance Scheduling' }]}
      />

      {toast && (
        <div className='mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700'>{toast}</div>
      )}

      <div className='grid gap-6 xl:grid-cols-3'>
        <section className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='text-base font-semibold'>Maintenance Schedule</h2>
            <button
              type='button'
              onClick={() => setFormOpen((prev) => !prev)}
              className='inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700'
            >
              <FiPlus className='h-3.5 w-3.5' /> {formOpen ? 'Close Form' : 'New Schedule'}
            </button>
          </div>

          {formOpen && (
            <form onSubmit={handleCreateSchedule} className='space-y-3'>
              <div>
                <label className='mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400'>
                  Select Equipment
                </label>
                <button
                  type='button'
                  onClick={() => setEquipmentPickerOpen(true)}
                  className='inline-flex w-full items-center justify-between rounded-xl border border-slate-300 px-3 py-2.5 text-left text-sm dark:border-slate-700 dark:bg-slate-950'
                >
                  <span className='truncate'>
                    {selectedEquipment ? `${selectedEquipment.name} (${selectedEquipment.code})` : 'Select equipment'}
                  </span>
                  <FiSearch className='h-4 w-4 text-slate-500' />
                </button>
              </div>

              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder='Schedule title'
                className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950'
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder='Description (optional)'
                className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950'
              />
              <input
                type='date'
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950'
              />
              <div>
                <label className='mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400'>
                  Assignee (Technician)
                </label>
                <button
                  type='button'
                  onClick={() => setTechPickerOpen(true)}
                  className='inline-flex w-full items-center justify-between rounded-xl border border-slate-300 px-3 py-2.5 text-left text-sm dark:border-slate-700 dark:bg-slate-950'
                >
                  <span className='truncate'>
                    {selectedTechnician
                      ? `${selectedTechnician.firstName ?? ''} ${selectedTechnician.lastName ?? ''}`.trim() ||
                        selectedTechnician.username
                      : 'Select technician'}
                  </span>
                  <FiSearch className='h-4 w-4 text-slate-500' />
                </button>
              </div>
              <input
                type='number'
                min={1}
                value={form.cycleDays}
                onChange={(e) => setForm({ ...form, cycleDays: e.target.value })}
                placeholder='Cycle days (for auto reset)'
                className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950'
              />
              <button
                disabled={submitting}
                className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70'
              >
                <FiPlus className='h-4 w-4' /> {submitting ? 'Saving...' : 'Create Schedule'}
              </button>
            </form>
          )}
        </section>

        <section className='xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='text-base font-semibold'>Reminder List (within 3 days)</h2>
            <button
              onClick={() => void loadData()}
              className='inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            >
              <FiRefreshCw className='h-3.5 w-3.5' /> Refresh
            </button>
          </div>
          <div className='grid gap-3 md:grid-cols-2'>
            {reminders.map((item) => (
              <article
                key={item.id}
                className='rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-600/30 dark:bg-amber-500/10'
              >
                <p className='font-medium text-slate-800 dark:text-slate-100'>{item.title}</p>
                <p className='mt-1 text-xs text-slate-600 dark:text-slate-300'>
                  Device: {equipmentMap[item.deviceId] ?? item.deviceId} · Date: {item.scheduledDate}
                </p>
                <p className='mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-300'>
                  <FiAlertCircle className='h-3.5 w-3.5' /> Reminder: maintenance is due soon
                </p>
              </article>
            ))}
            {reminders.length === 0 && <p className='text-sm text-slate-500'>No reminders in the next 3 days.</p>}
          </div>
        </section>
      </div>

      <section className='mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
        <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
          <h2 className='text-base font-semibold'>Due / Overdue Equipment</h2>
          <p className='text-sm text-rose-600 dark:text-rose-300'>Overdue: {overdueSchedules.length}</p>
        </div>

        {loading ? (
          <div className='h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800' />
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full text-left text-sm'>
              <thead>
                <tr className='border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700'>
                  <th className='px-3 py-2'>Equipment</th>
                  <th className='px-3 py-2'>Title</th>
                  <th className='px-3 py-2'>Description</th>
                  <th className='px-3 py-2'>Technician</th>
                  <th className='px-3 py-2'>Cycle Days</th>
                  <th className='px-3 py-2'>Scheduled Date</th>
                  <th className='px-3 py-2'>Status</th>
                  <th className='px-3 py-2 text-right'>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeSchedules.map((item) => {
                  const isOverdue = item.scheduledDate < todayIso()
                  const description = item.description?.trim() ?? ''
                  const shortDescription =
                    description.length > 40 ? `${description.slice(0, 40)}...` : description || '-'
                  return (
                    <tr
                      key={item.id}
                      className={
                        isOverdue
                          ? 'border-b border-rose-200 bg-rose-50 dark:border-rose-600/30 dark:bg-rose-500/10'
                          : 'border-b border-slate-100 dark:border-slate-800'
                      }
                    >
                      <td className='px-3 py-2'>{equipmentMap[item.deviceId] ?? item.deviceId}</td>
                      <td className='px-3 py-2'>{item.title}</td>
                      <td className='px-3 py-2' title={description || '-'}>
                        {shortDescription}
                      </td>
                      <td className='px-3 py-2'>
                        {item.assignedTechnicianId
                          ? (technicianNameMap[item.assignedTechnicianId] ?? item.assignedTechnicianId)
                          : '-'}
                      </td>
                      <td className='px-3 py-2'>{item.cycleDays}</td>
                      <td className='px-3 py-2'>{item.scheduledDate}</td>
                      <td className='px-3 py-2'>{item.status}</td>
                      <td className='px-3 py-2 text-right'>
                        <button
                          onClick={() => void handleMarkDone(item)}
                          className='inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700'
                        >
                          <FiCheckCircle className='h-3.5 w-3.5' /> Mark maintained
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {activeSchedules.length === 0 && (
                  <tr>
                    <td colSpan={8} className='px-3 py-6 text-center text-slate-500'>
                      No active schedules.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
                <th className='px-3 py-2'>Completed At</th>
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
                  <td className='px-3 py-2'>{item.completedAt ? new Date(item.completedAt).toLocaleString() : '-'}</td>
                  <td className='px-3 py-2'>{item.status}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className='px-3 py-6 text-center text-slate-500'>
                    No maintenance history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {equipmentPickerOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm'>
          <div className='flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900'>
            <div className='flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700'>
              <h4 className='text-base font-semibold text-slate-900 dark:text-white'>Select Equipment</h4>
              <button
                type='button'
                onClick={() => setEquipmentPickerOpen(false)}
                className='rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              >
                <FiX className='h-4 w-4' />
              </button>
            </div>

            <div className='border-b border-slate-200 p-4 dark:border-slate-700'>
              <input
                value={equipmentQuery}
                onChange={(e) => setEquipmentQuery(e.target.value)}
                placeholder='Search by equipment name, code, location...'
                className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white'
              />
            </div>

            <div className='grid flex-1 gap-3 overflow-y-auto p-4 md:grid-cols-2 lg:grid-cols-3'>
              {filteredEquipment.map((item) => {
                const active = String(item.id) === form.deviceId
                return (
                  <article
                    key={item.id}
                    onClick={() => setForm((prev) => ({ ...prev, deviceId: String(item.id) }))}
                    className={[
                      'cursor-pointer overflow-hidden rounded-xl border transition',
                      active
                        ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-500/30'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                    ].join(' ')}
                  >
                    <div className='aspect-video bg-slate-100 dark:bg-slate-800'>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className='h-full w-full object-cover' />
                      ) : (
                        <div className='flex h-full items-center justify-center text-xs text-slate-500'>No image</div>
                      )}
                    </div>
                    <div className='p-3'>
                      <p className='font-semibold text-slate-900 dark:text-slate-100'>{item.name}</p>
                      <p className='mt-1 text-xs text-slate-500'>Code: {item.code}</p>
                      {item.location && <p className='mt-1 text-xs text-slate-500'>Location: {item.location}</p>}
                    </div>
                  </article>
                )
              })}
              {filteredEquipment.length === 0 && (
                <div className='col-span-full rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500 dark:border-slate-700'>
                  No equipment found
                </div>
              )}
            </div>

            <div className='flex justify-end gap-2 border-t border-slate-200 p-4 dark:border-slate-700'>
              <button
                type='button'
                onClick={() => {
                  setForm((prev) => ({ ...prev, deviceId: '' }))
                  setEquipmentPickerOpen(false)
                }}
                className='rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700'
              >
                Clear
              </button>
              <button
                type='button'
                onClick={() => setEquipmentPickerOpen(false)}
                className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white'
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {techPickerOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm'>
          <div className='flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900'>
            <div className='flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700'>
              <h4 className='text-base font-semibold text-slate-900 dark:text-white'>Select Technician</h4>
              <button
                type='button'
                onClick={() => setTechPickerOpen(false)}
                className='rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              >
                <FiX className='h-4 w-4' />
              </button>
            </div>

            <div className='border-b border-slate-200 p-4 dark:border-slate-700'>
              <input
                value={techQuery}
                onChange={(e) => setTechQuery(e.target.value)}
                placeholder='Search by username or full name...'
                className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white'
              />
            </div>

            <div className='flex-1 overflow-auto p-4'>
              {filteredTechnicians.length === 0 ? (
                <div className='rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500 dark:border-slate-700'>
                  No technician found
                </div>
              ) : (
                <table className='min-w-full text-left text-sm'>
                  <thead>
                    <tr className='border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700'>
                      <th className='px-3 py-2'>Full Name</th>
                      <th className='px-3 py-2'>Username</th>
                      <th className='px-3 py-2'>User ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTechnicians.map((tech) => {
                      const active = form.assignedTechnicianId === tech.id
                      const fullName = [tech.firstName, tech.lastName].filter(Boolean).join(' ')

                      return (
                        <tr
                          key={tech.id}
                          onClick={() => setForm((prev) => ({ ...prev, assignedTechnicianId: tech.id }))}
                          className={[
                            'cursor-pointer border-b dark:border-slate-800',
                            active
                              ? 'border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10'
                              : 'border-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                          ].join(' ')}
                        >
                          <td className='px-3 py-2 font-medium text-slate-900 dark:text-slate-100'>
                            {fullName || '-'}
                          </td>
                          <td className='px-3 py-2 text-slate-600 dark:text-slate-300'>@{tech.username}</td>
                          <td className='px-3 py-2 text-xs text-slate-500 dark:text-slate-400'>{tech.id}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className='flex justify-end gap-2 border-t border-slate-200 p-4 dark:border-slate-700'>
              <button
                type='button'
                onClick={() => {
                  setForm((prev) => ({ ...prev, assignedTechnicianId: '' }))
                  setTechPickerOpen(false)
                }}
                className='rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700'
              >
                Clear
              </button>
              <button
                type='button'
                onClick={() => setTechPickerOpen(false)}
                className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white'
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
