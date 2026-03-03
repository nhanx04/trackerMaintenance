import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import { AppLayout } from '@/layouts/AppLayout'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { ConfirmDialog } from '@/components/ui-custom/ConfirmDialog'
import { EquipmentDetail } from '@/components/equipment/EquipmentDetail'
import { EquipmentFormDialog } from '@/components/equipment/EquipmentFormDialog'
import { equipmentApi } from '@/lib/equipmentApi'
import type { Equipment } from '@/types/equipment'

export default function EquipmentDetailPage() {
  const params = useParams()
  const navigate = useNavigate()
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!params.id) return
    void loadDetail(params.id)
  }, [params.id])

  async function loadDetail(id: string) {
    setLoading(true)
    try {
      const data = await equipmentApi.getById(id)
      setEquipment(data)
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Failed to fetch equipment')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!equipment) return
    try {
      await equipmentApi.delete(equipment.id)
      navigate('/manager/equipment')
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Delete failed')
    } finally {
      setConfirmOpen(false)
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title='Equipment Detail'
        subtitle='View complete asset profile and metadata'
        breadcrumbs={[
          { label: 'Manager' },
          { label: 'Equipment', href: '/manager/equipment' },
          { label: equipment?.name || 'Detail' }
        ]}
      />

      {toast && (
        <div className='mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700'>{toast}</div>
      )}

      {loading && <div className='h-80 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800' />}

      {!loading && equipment && (
        <EquipmentDetail equipment={equipment} onEdit={() => setFormOpen(true)} onDelete={() => setConfirmOpen(true)} />
      )}

      <EquipmentFormDialog
        open={formOpen}
        initial={equipment}
        onClose={() => setFormOpen(false)}
        onSuccess={(message) => {
          setToast(message)
          if (equipment?.id) {
            void loadDetail(String(equipment.id))
          }
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        title='Delete equipment?'
        description='This action cannot be undone and all references will be removed.'
        confirmText='Delete'
        danger
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </AppLayout>
  )
}

