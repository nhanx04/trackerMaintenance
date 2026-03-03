import { FiArrowLeft, FiCalendar, FiClock, FiEdit2, FiImage, FiMapPin, FiTrash2 } from 'react-icons/fi'
import { Link } from 'react-router'

import type { Equipment } from '@/types/equipment'
import { cn } from '@/lib/cn'

type EquipmentDetailProps = {
  equipment: Equipment
  onEdit: () => void
  onDelete: () => void
}

const statusCls: Record<string, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-700',
  MAINTENANCE: 'bg-amber-100 text-amber-700',
  BROKEN: 'bg-rose-100 text-rose-700'
}

export function EquipmentDetail({ equipment, onEdit, onDelete }: EquipmentDetailProps) {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Link
          to='/manager/equipment'
          className='inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
        >
          <FiArrowLeft className='h-4 w-4' /> Back to list
        </Link>
        <div className='flex gap-2'>
          <button
            onClick={onEdit}
            className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700'
          >
            <FiEdit2 className='h-4 w-4' /> Edit
          </button>
          <button
            onClick={onDelete}
            className='inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700'
          >
            <FiTrash2 className='h-4 w-4' /> Delete
          </button>
        </div>
      </div>

      <section className='grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1.2fr_1fr]'>
        <div className='h-80 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800'>
          {equipment.imageUrl ? (
            <img src={equipment.imageUrl} alt={equipment.name} className='h-full w-full object-cover' />
          ) : (
            <div className='flex h-full items-center justify-center text-slate-400'>
              <FiImage className='h-12 w-12' />
            </div>
          )}
        </div>
        <div className='space-y-4'>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>{equipment.name}</h1>
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
