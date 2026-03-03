import { FiEdit2, FiEye, FiImage, FiMapPin, FiTrash2 } from 'react-icons/fi'
import { Link } from 'react-router'

import type { Equipment, EquipmentStatus } from '@/types/equipment'
import { cn } from '@/lib/cn'

type EquipmentCardProps = {
  equipment: Equipment
  onEdit: (equipment: Equipment) => void
  onDelete: (equipment: Equipment) => void
}

const statusStyles: Record<EquipmentStatus, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-700',
  MAINTENANCE: 'bg-amber-100 text-amber-700',
  BROKEN: 'bg-rose-100 text-rose-700'
}

export function EquipmentCard({ equipment, onEdit, onDelete }: EquipmentCardProps) {
  return (
    <article className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900'>
      <div className='aspect-[4/3] rounded-t-2xl bg-slate-100 p-4 dark:bg-slate-800'>
        {equipment.imageUrl ? (
          <div className='flex h-full w-full items-center justify-center'>
            <img src={equipment.imageUrl} alt={equipment.name} className='max-h-full max-w-full object-contain' />
          </div>
        ) : (
          <div className='flex h-full w-full items-center justify-center text-slate-400'>
            <FiImage className='h-10 w-10' />
          </div>
        )}
      </div>

      <div className='space-y-3 p-4'>
        <div>
          <h3 className='truncate text-base font-semibold text-slate-900 dark:text-white'>{equipment.name}</h3>
          <p className='text-sm text-slate-500'>{equipment.code}</p>
        </div>

        <div className='flex items-center justify-between'>
          <p className='flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300'>
            <FiMapPin className='h-4 w-4' />
            {equipment.location || '—'}
          </p>
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', statusStyles[equipment.status])}>
            {equipment.status.replace('_', ' ')}
          </span>
        </div>

        <div className='flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800'>
          <Link
            to={`/manager/equipment/${equipment.id}`}
            className='inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
          >
            <FiEye className='h-3.5 w-3.5' /> View
          </Link>
          <button
            onClick={() => onEdit(equipment)}
            className='inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50'
          >
            <FiEdit2 className='h-3.5 w-3.5' /> Edit
          </button>
          <button
            onClick={() => onDelete(equipment)}
            className='inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50'
          >
            <FiTrash2 className='h-3.5 w-3.5' /> Delete
          </button>
        </div>
      </div>
    </article>
  )
}
