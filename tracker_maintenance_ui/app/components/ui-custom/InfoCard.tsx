import { cn } from '@/lib/cn'

type InfoItem = {
  label: string
  value: React.ReactNode
}

type InfoCardProps = {
  title?: string
  items: InfoItem[]
  className?: string
}

export function InfoCard({ title, items, className }: InfoCardProps) {
  return (
    <section className={cn('rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>
      {title && <h3 className='mb-4 text-base font-semibold text-slate-900 dark:text-white'>{title}</h3>}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`} className='rounded-lg bg-slate-50 p-3 dark:bg-slate-800/70'>
            <p className='text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400'>{item.label}</p>
            <p className='mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200'>{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

