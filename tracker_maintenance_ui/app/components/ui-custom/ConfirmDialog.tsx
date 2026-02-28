import { cn } from '@/lib/cn'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900'>
        <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>{title}</h3>
        <p className='mt-2 text-sm text-slate-600 dark:text-slate-400'>{description}</p>
        <div className='mt-6 flex justify-end gap-2'>
          <button
            type='button'
            onClick={onCancel}
            className='rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
          >
            {cancelText}
          </button>
          <button
            type='button'
            onClick={onConfirm}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium text-white',
              danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

