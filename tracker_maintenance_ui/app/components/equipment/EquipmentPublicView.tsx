import { FiArrowLeft, FiCalendar, FiClock, FiImage, FiMapPin } from 'react-icons/fi'
import { Link } from 'react-router'

import type { Equipment } from '@/types/equipment'
import { cn } from '@/lib/cn'

type EquipmentPublicViewProps = {
  equipment: Equipment
}

const statusCls: Record<string, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-700',
  MAINTENANCE: 'bg-amber-100 text-amber-700',
  BROKEN: 'bg-rose-100 text-rose-700'
}

export function EquipmentPublicView({ equipment }: EquipmentPublicViewProps) {
  return (
    <div className='space-y-6'>
      <section className='grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 grid-cols-1 lg:grid-cols-[1.2fr_1fr]'>
        <div className='h-80 rounded-2xl bg-slate-100 p-3 dark:bg-slate-800'>
          {equipment.imageUrl ? (
            <img src={equipment.imageUrl} alt={equipment.name} className='h-full w-full rounded-xl object-contain' />
          ) : (
            <div className='flex h-full items-center justify-center text-slate-400'>
              <FiImage className='h-12 w-12' />
            </div>
          )}
        </div>
        <div className='space-y-4'>
          <h1 className='text-xl sm:text-2xl font-bold text-slate-900 dark:text-white'>{equipment.name}</h1>
          <p className='text-sm text-slate-500'>{equipment.code}</p>
          <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', statusCls[equipment.status])}>
            {equipment.status.replace('_', ' ')}
          </span>
          <p className='flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200'>
            <FiMapPin className='h-4 w-4' /> {equipment.location || '—'}
          </p>
          <p className='text-sm text-slate-600 dark:text-slate-300'>
            {equipment.description || 'No description provided.'}
          </p>
        </div>
      </section>

      <section className='grid gap-6 lg:grid-cols-2'>
        <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <h2 className='mb-4 text-lg font-semibold'>Metadata</h2>
          <div className='space-y-3 text-sm text-slate-600 dark:text-slate-300'>
            <p className='flex items-center gap-2'>
              <FiCalendar className='h-4 w-4' /> Created at: {equipment.createdAt || 'N/A'}
            </p>
            <p className='flex items-center gap-2'>
              <FiClock className='h-4 w-4' /> Updated at: {equipment.updatedAt || 'N/A'}
            </p>
          </div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <h2 className='mb-2 text-lg font-semibold'>Maintenance History</h2>
          <p className='text-sm text-slate-500'>History module will be available in upcoming release.</p>
        </div>
      </section>
    </div>
  )
}
