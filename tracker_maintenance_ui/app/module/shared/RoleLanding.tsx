import { FiPlus } from 'react-icons/fi'

import { AppLayout } from '@/layouts/AppLayout'
import { DataTableWrapper } from '@/components/ui-custom/DataTableWrapper'
import { PageHeader } from '@/components/ui-custom/PageHeader'

type RoleLandingProps = {
  title: string
  subtitle: string
  breadcrumbs: { label: string; href?: string }[]
}

export function RoleLanding({ title, subtitle, breadcrumbs }: RoleLandingProps) {
  return (
    <AppLayout>
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        action={
          <button className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700'>
            <FiPlus className='h-4 w-4' />
            New Action
          </button>
        }
      />

      <DataTableWrapper title='Workspace' empty>
        <div />
      </DataTableWrapper>
    </AppLayout>
  )
}

