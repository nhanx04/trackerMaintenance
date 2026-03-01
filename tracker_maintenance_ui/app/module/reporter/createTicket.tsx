import { useState } from 'react'
import { useNavigate } from 'react-router'

import { AppLayout } from '@/layouts/AppLayout'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { InfoCard } from '@/components/ui-custom/InfoCard'
import { ticketApi } from '@/lib/ticketApi'
import type { TicketPriority } from '@/types/ticket'

type FormErrors = {
  title?: string
  deviceId?: string
  priority?: string
  description?: string
  scheduledDate?: string
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

export default function ReporterCreateTicketPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<Partial<FormErrors>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Clear error on change
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
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
      await ticketApi.create({
        title: form.title.trim(),
        deviceId: form.deviceId.trim(),
        priority: form.priority as TicketPriority,
        description: form.description.trim() || undefined,
        scheduledDate: form.scheduledDate || undefined
      })
      navigate('/reporter/my-tickets')
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title='Create Ticket'
        subtitle='Submit a new maintenance or repair request.'
        breadcrumbs={[
          { label: 'Reporter' },
          { label: 'My Tickets', href: '/reporter/my-tickets' },
          { label: 'Create Ticket' }
        ]}
      />

      <div className='grid gap-6 lg:grid-cols-[2fr_1fr]'>
        {/* Form */}
        <section className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <h3 className='mb-4 text-base font-semibold text-slate-900 dark:text-white'>Ticket Information</h3>

          {apiError && (
            <div className='mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400'>
              {apiError}
            </div>
          )}

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            {/* Title */}
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

            {/* Device ID */}
            <div>
              <label className='mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400'>
                Device / Equipment ID <span className='text-rose-500'>*</span>
              </label>
              <input
                value={form.deviceId}
                onChange={(e) => set('deviceId', e.target.value)}
                placeholder='e.g. DEV-0042'
                className={fieldCls(!!errors.deviceId)}
              />
              {errors.deviceId && <p className='mt-1 text-xs text-rose-500'>{errors.deviceId}</p>}
            </div>

            {/* Priority */}
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

            {/* Scheduled Date */}
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

          {/* Description */}
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
              onClick={() => navigate('/reporter/my-tickets')}
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

        {/* Guidelines */}
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
