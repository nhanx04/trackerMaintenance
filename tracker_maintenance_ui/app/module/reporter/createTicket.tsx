import { AppLayout } from '@/layouts/AppLayout'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { InfoCard } from '@/components/ui-custom/InfoCard'

export default function ReporterCreateTicketPage() {
  return (
    <AppLayout>
      <PageHeader
        title='Create Ticket'
        subtitle='Submit a new maintenance or repair request.'
        breadcrumbs={[{ label: 'Reporter' }, { label: 'Create Ticket' }]}
      />

      <div className='grid gap-6 lg:grid-cols-[2fr_1fr]'>
        <section className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <h3 className='mb-4 text-base font-semibold'>Ticket Information</h3>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <input className='rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800' placeholder='Equipment ID' />
            <input className='rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800' placeholder='Location' />
            <select className='rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800'>
              <option>Priority</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <input className='rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800' placeholder='Contact Number' />
          </div>
          <textarea
            rows={5}
            className='mt-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800'
            placeholder='Describe the issue in detail...'
          />
          <div className='mt-4 flex justify-end'>
            <button className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700'>Submit Ticket</button>
          </div>
        </section>

        <InfoCard
          title='Guidelines'
          items={[
            { label: 'Response SLA', value: 'Within 4 business hours' },
            { label: 'Critical Issue', value: 'Call hotline + submit ticket' },
            { label: 'Attachment', value: 'Up to 10MB per file' },
            { label: 'Support Window', value: 'Mon - Sat, 08:00 - 18:00' }
          ]}
        />
      </div>
    </AppLayout>
  )
}

