import { useEffect, useMemo, useState } from 'react'
import { FiPlus, FiSearch } from 'react-icons/fi'

import { AppLayout } from '@/layouts/AppLayout'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { ConfirmDialog } from '@/components/ui-custom/ConfirmDialog'
import { EquipmentCard } from '@/components/equipment/EquipmentCard'
import { EquipmentFormDialog } from '@/components/equipment/EquipmentFormDialog'
import { equipmentApi } from '@/lib/equipmentApi'
import type { Equipment, EquipmentStatus } from '@/types/equipment'

const PAGE_SIZE = 12

export default function ManagerEquipmentPage() {
  const [items, setItems] = useState<Equipment[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<EquipmentStatus | ''>('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<Equipment | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Equipment | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadList()
    }, 250)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, location])

  async function loadList() {
    setLoading(true)
    try {
      const page = await equipmentApi.getAll({
        name: search.trim() || undefined,
        status,
        location: location.trim() || undefined,
        page: 0,
        size: PAGE_SIZE
      })
      setItems(page.content)
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Failed to fetch equipments')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await equipmentApi.delete(deleteTarget.id)
      setToast('Equipment deleted successfully.')
      await loadList()
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Delete failed')
    } finally {
      setDeleteTarget(null)
    }
  }

  const locationOptions = useMemo(() => {
    const unique = new Set(items.map((item) => item.location).filter(Boolean) as string[])
    return Array.from(unique)
  }, [items])

  return (
    <AppLayout>
      <PageHeader
        title='Equipment Management'
        breadcrumbs={[{ label: 'Manager' }, { label: 'Equipment' }]}
        action={
          <button
            onClick={() => {
              setEditItem(null)
              setFormOpen(true)
            }}
            className='inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700'
          >
            <FiPlus className='h-4 w-4' /> Add Equipment
          </button>
        }
      />

      {toast && (
        <div className='mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700'>{toast}</div>
      )}

      <section className='mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
        <div className='grid gap-3 md:grid-cols-4'>
          <label className='relative md:col-span-2'>
            <FiSearch className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search by name or code'
              className='w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-950'
            />
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as EquipmentStatus | '')}
            className='rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-950'
          >
            <option value=''>All status</option>
            <option value='AVAILABLE'>Available</option>
            <option value='MAINTENANCE'>Maintenance</option>
            <option value='BROKEN'>Broken</option>
          </select>

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className='rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-950'
          >
            <option value=''>All locations</option>
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className='h-72 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800' />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900'>
          <p className='text-sm text-slate-500'>No equipment found. Add your first asset to get started.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          {items.map((equipment) => (
            <EquipmentCard
              key={equipment.id}
              equipment={equipment}
              onEdit={(item) => {
                setEditItem(item)
                setFormOpen(true)
              }}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <EquipmentFormDialog
        open={formOpen}
        initial={editItem}
        onClose={() => setFormOpen(false)}
        onSuccess={(message) => {
          setToast(message)
          void loadList()
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title='Delete equipment?'
        description={`This action will permanently remove ${deleteTarget?.name ?? 'this equipment'}.`}
        confirmText='Delete'
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </AppLayout>
  )
}
