import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { DataTableWrapper } from '@/components/ui-custom/DataTableWrapper'
import { getTickets } from '@/lib/ticketApi'
import type { TicketPage } from '@/types/ticket'
import { getAuth } from '@/lib/auth'

export default function TicketList() {
  const [page, setPage] = useState<TicketPage | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const auth = getAuth()

        if (!auth) {
          window.location.href = '/login'
          return
        }

        const data = await getTickets(auth.token)
        setPage(data)
      } catch (e: any) {
        setError(e.message)
      }
    }

    load()
  }, [])

  if (error) {
    return <div className='p-6 text-red-500'>{error}</div>
  }

  if (!page) {
    return <div className='p-6'>Loading tickets...</div>
  }

  return (
    <DataTableWrapper>
      <PageHeader title='Ticket Management' />

      <div className='bg-white rounded-xl border'>
        <table className='w-full text-sm'>
          <thead className='border-b bg-gray-50'>
            <tr>
              <th className='p-3 text-left'>ID</th>
              <th className='p-3 text-left'>Title</th>
              <th className='p-3 text-left'>Priority</th>
              <th className='p-3 text-left'>Status</th>
            </tr>
          </thead>

          <tbody>
            {page.content?.map((t) => (
              <tr key={t.id} className='border-b hover:bg-gray-50'>
                <td className='p-3'>{t.id}</td>
                <td className='p-3'>{t.title}</td>
                <td className='p-3'>{t.priority}</td>
                <td className='p-3'>{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DataTableWrapper>
  )
}
