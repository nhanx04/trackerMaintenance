import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { AppLayout } from '@/layouts/AppLayout'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { InfoCard } from '@/components/ui-custom/InfoCard'
import { TicketImageUpload } from '@/module/shared/TicketImageUpload'
import { ticketApi } from '@/lib/ticketApi'
import { equipmentApi } from '@/lib/equipmentApi'
import type { Equipment } from '@/types/equipment'
import type { TicketPriority } from '@/types/ticket'

type FormErrors = {
  title?: string
  deviceId?: string
  priority?: string
}

type FormState = {
  title: string
  deviceId: string
  priority: TicketPriority | ''
  description: string
  scheduledDate: string
}

const INITIAL: FormState = {
  title: '',
  deviceId: '',
  priority: '',
  description: '',
  scheduledDate: ''
}

export default function ManagerCreateTicketPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<Partial<FormErrors>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [devices, setDevices] = useState<Equipment[]>([])
  const [devicesLoading, setDevicesLoading] = useState(true)
  const [deviceQuery, setDeviceQuery] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null)

  useEffect(() => {
    equipmentApi
      .getAll({ page: 0, size: 200 })
      .then((res) => setDevices(res.content))
      .finally(() => setDevicesLoading(false))
  }, [])

  const selectedDevice = useMemo(() => devices.find((d) => String(d.id) === form.deviceId), [devices, form.deviceId])

  const filteredDevices = useMemo(() => {
    const q = deviceQuery.trim().toLowerCase()
    if (!q) return devices
    return devices.filter((d) => `${d.code} ${d.name} ${d.location ?? ''}`.toLowerCase().includes(q))
  }, [devices, deviceQuery])

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function validate(): boolean {
    const e: Partial<FormErrors> = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.deviceId.trim()) e.deviceId = 'Device ID is required'
    if (!form.priority) e.priority = 'Priority is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    setApiError(null)
    try {
      const ticket = await ticketApi.create({
        title: form.title.trim(),
        deviceId: form.deviceId.trim(),
        priority: form.priority as TicketPriority,
        description: form.description.trim() || undefined,
        scheduledDate: form.scheduledDate || undefined
      })
      // Move to upload step instead of navigating away
      setCreatedTicketId(ticket.id)
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Upload images ────────────────────────────────────────────────
  if (createdTicketId) {
    return (
      <AppLayout>
        <PageHeader
          title='Upload Images'
          subtitle='Optionally attach before/after photos to your ticket.'
          breadcrumbs={[
            { label: 'Manager' },
            { label: 'My Tickets', href: '/manager/tickets' },
            { label: 'Upload Images' }
          ]}
        />
        <div className='grid gap-6 lg:grid-cols-[2fr_1fr]'>
          <section className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
            <div className='mb-5 flex items-center justify-between'>
              <h3 className='text-base font-semibold text-slate-900 dark:text-white'>Before / After Photos</h3>
              <span className='rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'>
                ✓ Ticket created
              </span>
            </div>
            <TicketImageUpload ticketId={createdTicketId} allowedTypes={['before']} />
            <div className='mt-6 flex justify-end'>
              <button
                onClick={() => navigate('/manager/tickets')}
                className='rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700'
              >
                Done — View My Tickets
              </button>
            </div>
          </section>
          <InfoCard
            title='Photo Tips'
            items={[
              { label: 'Before', value: 'Take before starting any repair' },
              { label: 'After', value: 'Confirm issue is fully resolved' },
              { label: 'Max size', value: '10 MB per file' },
              { label: 'Formats', value: 'PNG, JPG, WEBP' }
            ]}
          />
        </div>
      </AppLayout>
    )
  }

  // ── Step 1: Create ticket form ───────────────────────────────────────────
  return (
    <AppLayout>
      <PageHeader
        title='Create Ticket'
        subtitle='Submit a new maintenance or repair request.'
        breadcrumbs={[
          { label: 'Manager' },
          { label: 'My Tickets', href: '/manager/tickets' },
          { label: 'Create Ticket' }
        ]}
      />

      <div className='grid gap-6 lg:grid-cols-[2fr_1fr]'>
        <section className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <h3 className='mb-4 text-base font-semibold text-slate-900 dark:text-white'>Ticket Information</h3>

          {apiError && (
            <div className='mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400'>
              {apiError}
            </div>
          )}

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='sm:col-span-2'>
              <label className='mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400'>
                Title <span className='text-rose-500'>*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder='e.g. AC unit not working in Room 302'
                className={fieldCls(!!errors.title)}
              />
              {errors.title && <p className='mt-1 text-xs text-rose-500'>{errors.title}</p>}
            </div>

            <div>
              <label className='mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400'>
                Device / Equipment <span className='text-rose-500'>*</span>
              </label>
              <button
                type='button'
                onClick={() => setPickerOpen(true)}
                className={fieldCls(!!errors.deviceId) + ' text-left'}
              >
                {selectedDevice ? `${selectedDevice.code} • ${selectedDevice.name}` : 'Select equipment'}
              </button>
              {selectedDevice && (
                <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
                  {selectedDevice.location ? `Location: ${selectedDevice.location}` : 'No location'}
                </p>
              )}
              {errors.deviceId && <p className='mt-1 text-xs text-rose-500'>{errors.deviceId}</p>}
            </div>

            <div>
              <label className='mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400'>
                Priority <span className='text-rose-500'>*</span>
              </label>
              <select
                value={form.priority}
                onChange={(e) => set('priority', e.target.value)}
                className={fieldCls(!!errors.priority)}
              >
                <option value=''>Select priority</option>
                <option value='LOW'>Low</option>
                <option value='MEDIUM'>Medium</option>
                <option value='HIGH'>High</option>
              </select>
              {errors.priority && <p className='mt-1 text-xs text-rose-500'>{errors.priority}</p>}
            </div>

            <div>
              <label className='mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400'>
                Preferred Date (optional)
              </label>
              <input
                type='date'
                value={form.scheduledDate}
                onChange={(e) => set('scheduledDate', e.target.value)}
                className={fieldCls(false)}
              />
            </div>
          </div>

          <div className='mt-4'>
            <label className='mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400'>Description</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder='Describe the issue in detail — symptoms, location, how long it has been occurring...'
              className={fieldCls(false) + ' resize-none'}
            />
          </div>

          <div className='mt-5 flex items-center justify-end gap-3'>
            <button
              onClick={() => navigate('/manager/tickets')}
              className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className='rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60'
            >
              {loading ? 'Submitting…' : 'Submit Ticket'}
            </button>
          </div>
        </section>

        <InfoCard
          title='Guidelines'
          items={[
            { label: 'Response SLA', value: 'Within 4 business hours' },
            { label: 'Critical Issue', value: 'Call hotline + submit ticket' },
            { label: 'Attachment', value: 'Up to 10 MB per file' },
            { label: 'Support Window', value: 'Mon – Sat, 08:00 – 18:00' }
          ]}
        />
      </div>

      {pickerOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm'>
          <div className='flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900'>
            <div className='border-b border-slate-200 p-4 dark:border-slate-700'>
              <h4 className='text-base font-semibold text-slate-900 dark:text-white'>Select Equipment</h4>
              <input
                value={deviceQuery}
                onChange={(e) => setDeviceQuery(e.target.value)}
                placeholder='Search by code, name, location...'
                className='mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white'
              />
            </div>

            <div className='grid flex-1 gap-3 overflow-y-auto p-4 sm:grid-cols-2 lg:grid-cols-3'>
              {devicesLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className='h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800' />
                ))}

              {!devicesLoading && filteredDevices.length === 0 && (
                <div className='col-span-full rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500 dark:border-slate-700'>
                  No equipment found
                </div>
              )}

              {!devicesLoading &&
                filteredDevices.map((d) => {
                  const active = form.deviceId === String(d.id)
                  return (
                    <button
                      key={d.id}
                      type='button'
                      onClick={() => set('deviceId', String(d.id))}
                      className={[
                        'rounded-xl border p-3 text-left transition',
                        active
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-500/30'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                      ].join(' ')}
                    >
                      <p className='text-xs text-slate-500 dark:text-slate-400'>{d.code}</p>
                      <p className='mt-1 font-semibold text-slate-900 dark:text-white'>{d.name}</p>
                      <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>{d.location || 'No location'}</p>
                    </button>
                  )
                })}
            </div>

            <div className='flex justify-end gap-2 border-t border-slate-200 p-4 dark:border-slate-700'>
              <button
                type='button'
                onClick={() => setPickerOpen(false)}
                className='rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={() => setPickerOpen(false)}
                disabled={!form.deviceId}
                className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60'
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

function fieldCls(hasError: boolean) {
  return [
    'w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-800 outline-none',
    'placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30',
    hasError ? 'border-rose-400 dark:border-rose-500' : 'border-slate-300 dark:border-slate-700'
  ].join(' ')
}
