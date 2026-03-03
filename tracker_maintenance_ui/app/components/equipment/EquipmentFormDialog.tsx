import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiImage, FiLoader, FiUpload, FiX } from 'react-icons/fi'

import type { Equipment, EquipmentStatus } from '@/types/equipment'
import { equipmentApi } from '@/lib/equipmentApi'

const schema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  location: z.string().optional(),
  status: z.enum(['AVAILABLE', 'MAINTENANCE', 'BROKEN']),
  description: z.string().optional()
})

type FormValues = z.infer<typeof schema>

type EquipmentFormDialogProps = {
  open: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  initial?: Equipment | null
}

const defaultValues: FormValues = {
  code: '',
  name: '',
  location: '',
  status: 'AVAILABLE',
  description: ''
}

export function EquipmentFormDialog({ open, onClose, onSuccess, initial }: EquipmentFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const isEdit = !!initial

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues })

  useEffect(() => {
    if (initial) {
      reset({
        code: initial.code,
        name: initial.name,
        location: initial.location || '',
        status: initial.status,
        description: initial.description || ''
      })
      setPreview(initial.imageUrl || '')
      setFile(null)
      return
    }

    reset(defaultValues)
    setPreview('')
    setFile(null)
  }, [initial, reset, open])

  const title = useMemo(() => (isEdit ? 'Edit Equipment' : 'Add Equipment'), [isEdit])

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true)
    try {
      const payload = {
        ...values,
        location: values.location?.trim() || undefined,
        description: values.description?.trim() || undefined
      }

      const entity =
        isEdit && initial ? await equipmentApi.update(initial.id, payload) : await equipmentApi.create(payload)

      if (file) {
        await equipmentApi.uploadImage(entity.id, file)
      }

      onSuccess(isEdit ? 'Equipment updated successfully.' : 'Equipment created successfully.')
      onClose()
    } catch (error) {
      onSuccess(error instanceof Error ? error.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  })

  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4'>
      <div className='w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900'>
        <form onSubmit={onSubmit} className='flex max-h-[85vh] flex-col'>
          <div className='flex items-center justify-between border-b border-slate-200 px-6 py-4 shadow-sm dark:border-slate-800'>
            <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>{title}</h3>
            <button
              onClick={onClose}
              className='rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            >
              <FiX className='h-5 w-5' />
            </button>
          </div>

          <div className='flex-1 space-y-5 overflow-y-auto px-6 py-4 scroll-smooth'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <Field label='Code *' error={errors.code?.message}>
                <input {...register('code')} className={inputCls(!!errors.code)} placeholder='EQ-001' />
              </Field>
              <Field label='Name *' error={errors.name?.message}>
                <input {...register('name')} className={inputCls(!!errors.name)} placeholder='HVAC Unit' />
              </Field>
              <Field label='Location'>
                <input {...register('location')} className={inputCls(false)} placeholder='Building A - Floor 2' />
              </Field>
              <Field label='Status'>
                <select {...register('status')} className={inputCls(false)}>
                  {(['AVAILABLE', 'MAINTENANCE', 'BROKEN'] as EquipmentStatus[]).map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </Field>
              <div className='sm:col-span-2'>
                <Field label='Description'>
                  <textarea {...register('description')} rows={4} className={inputCls(false) + ' resize-none'} />
                </Field>
              </div>
            </div>

            <div className='space-y-3'>
              <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>Image Upload</p>
              <label className='flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition-colors hover:border-blue-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-blue-500 dark:hover:bg-slate-800'>
                <input
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={(event) => {
                    const selected = event.target.files?.[0]
                    if (!selected) return
                    setFile(selected)
                    setPreview(URL.createObjectURL(selected))
                  }}
                />
                <FiUpload className='mb-2 h-6 w-6 text-slate-500' />
                <span className='text-sm text-slate-600 dark:text-slate-300'>Click to upload or drag and drop</span>
              </label>

              <div className='relative aspect-[4/3] rounded-xl border border-slate-200 bg-slate-50 p-4 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800/70'>
                {preview ? (
                  <div className='flex h-full w-full items-center justify-center transition-opacity duration-300'>
                    <img src={preview} alt='Preview' className='max-h-full max-w-full object-contain' />
                  </div>
                ) : (
                  <div className='flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400'>
                    <FiImage className='h-7 w-7' />
                    <p className='text-sm'>No image selected</p>
                  </div>
                )}

                {preview && (
                  <button
                    type='button'
                    onClick={() => {
                      setFile(null)
                      setPreview('')
                    }}
                    className='absolute right-2 top-2 rounded-full bg-white/90 p-1 text-slate-700 shadow transition hover:bg-white dark:bg-slate-900/90 dark:text-slate-200'
                  >
                    <FiX className='h-4 w-4' />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] dark:border-slate-800 dark:bg-slate-900'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60'
            >
              {loading && <FiLoader className='h-4 w-4 animate-spin' />}
              {isEdit ? 'Save Changes' : 'Create Equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <label className='block'>
      <span className='mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300'>{label}</span>
      {children}
      {error && <p className='mt-1 text-xs text-rose-500'>{error}</p>}
    </label>
  )
}

function inputCls(hasError: boolean) {
  return [
    'w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none dark:bg-slate-950',
    'focus:ring-2 focus:ring-blue-500/30',
    hasError ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
  ].join(' ')
}
