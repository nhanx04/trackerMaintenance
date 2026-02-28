import { cn } from '@/lib/cn'

type StatCardProps = {
  title: string
  value: string | number
  description?: string
  icon: React.ComponentType<{ className?: string }>
  className?: string
}

export function StatCard({ title, value, description, icon: Icon, className }: StatCardProps) {
  return (
    <article
      className={cn(
        'group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900/50',
        className
      )}
    >
      <div className='mb-4 inline-flex rounded-lg bg-slate-100 p-2.5 text-slate-700 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-blue-500/15 dark:group-hover:text-blue-300'>
        <Icon className='h-5 w-5' />
      </div>
      <p className='text-sm font-medium text-slate-500 dark:text-slate-400'>{title}</p>
      <p className='mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white'>{value}</p>
      {description && <p className='mt-2 text-xs text-slate-500 dark:text-slate-400'>{description}</p>}
    </article>
  )
}

