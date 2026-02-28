import { Link } from 'react-router'
import { FiChevronRight } from 'react-icons/fi'

import type { BreadcrumbItem } from '@/types/ui'

type PageHeaderProps = {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, breadcrumbs = [], action }: PageHeaderProps) {
  return (
    <div className='mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between'>
      <div className='space-y-2'>
        {breadcrumbs.length > 0 && (
          <nav className='flex items-center text-sm text-slate-500 dark:text-slate-400'>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1
              const content = crumb.href && !isLast ? <Link to={crumb.href}>{crumb.label}</Link> : <span>{crumb.label}</span>

              return (
                <span key={`${crumb.label}-${index}`} className='inline-flex items-center'>
                  <span className={isLast ? 'font-medium text-slate-800 dark:text-slate-200' : 'hover:text-slate-700 dark:hover:text-slate-200'}>
                    {content}
                  </span>
                  {!isLast && <FiChevronRight className='mx-1.5 h-3.5 w-3.5' />}
                </span>
              )
            })}
          </nav>
        )}
        <div>
          <h1 className='text-2xl font-semibold tracking-tight text-slate-900 dark:text-white'>{title}</h1>
          {subtitle && <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>{subtitle}</p>}
        </div>
      </div>
      {action && <div className='shrink-0'>{action}</div>}
    </div>
  )
}

