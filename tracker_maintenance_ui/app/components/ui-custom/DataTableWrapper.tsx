import { FiFilter, FiSearch } from 'react-icons/fi'

import { cn } from '@/lib/cn'

type DataTableWrapperProps = {
  title?: string
  children?: React.ReactNode
  loading?: boolean
  empty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}

export function DataTableWrapper({
  title,
  children,
  loading,
  empty,
  emptyTitle = 'No data found',
  emptyDescription = 'Try adjusting search or filters.',
  className
}: DataTableWrapperProps) {
  return (
    <section className={cn('rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>
      {title && <h3 className='mb-4 text-base font-semibold text-slate-900 dark:text-white'>{title}</h3>}

      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <label className='relative w-full sm:max-w-xs'>
          <FiSearch className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            placeholder='Search...'
            className='w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none ring-blue-500/20 placeholder:text-slate-400 focus:ring-4 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          />
        </label>
        <button
          type='button'
          className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
        >
          <FiFilter className='h-4 w-4' />
          Filters
        </button>
      </div>

      {loading && (
        <div className='space-y-3'>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className='h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800' />
          ))}
        </div>
      )}

      {!loading && empty && (
        <div className='rounded-lg border border-dashed border-slate-300 py-12 text-center dark:border-slate-700'>
          <p className='text-base font-semibold text-slate-700 dark:text-slate-200'>{emptyTitle}</p>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>{emptyDescription}</p>
        </div>
      )}

      {!loading && !empty && children}

      <div className='mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400'>
        <p>Showing 1–10 of 100 records</p>
        <div className='flex items-center gap-2'>
          <button className='rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'>Prev</button>
          <button className='rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'>Next</button>
        </div>
      </div>
    </section>
  )
}

