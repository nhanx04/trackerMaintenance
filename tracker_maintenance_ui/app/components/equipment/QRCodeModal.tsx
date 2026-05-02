import { useEffect, useState } from 'react'
import { FiDownload, FiRefreshCw, FiX } from 'react-icons/fi'
import { API_BASE_URL } from '@/lib/api'
import { getAuth } from '@/lib/auth'
import type { Equipment } from '@/types/equipment'

type Props = {
  equipment: Equipment | null
  onClose: () => void
}

export function QRCodeModal({ equipment, onClose }: Props) {
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!equipment) return
    void loadQR(equipment.id)

    return () => {
      if (qrUrl) URL.revokeObjectURL(qrUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipment?.id])

  // Đóng khi bấm Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function loadQR(deviceId: number | string) {
    setLoading(true)
    setError(null)
    if (qrUrl) URL.revokeObjectURL(qrUrl)
    setQrUrl(null)

    try {
      const auth = getAuth()
      const res = await fetch(`${API_BASE_URL}/api/devices/${deviceId}/qr`, {
        headers: auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}
      })
      if (!res.ok) throw new Error(`Không thể tải QR code (${res.status})`)
      const blob = await res.blob()
      setQrUrl(URL.createObjectURL(blob))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải QR code thất bại')
    } finally {
      setLoading(false)
    }
  }

  function handleDownload() {
    if (!qrUrl || !equipment) return
    const a = document.createElement('a')
    a.href = qrUrl
    a.download = `qr-${equipment.code ?? equipment.id}.png`
    a.click()
  }

  if (!equipment) return null

  return (
    /* Backdrop */
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Modal */}
      <div className='relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900'>
        {/* Close button */}
        <button
          onClick={onClose}
          className='absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200'
        >
          <FiX className='h-4 w-4' />
        </button>

        {/* Header */}
        <div className='border-b border-slate-100 px-5 py-4 dark:border-slate-800'>
          <h2 className='pr-6 text-sm font-semibold text-slate-800 dark:text-white'>
            Quét QR Code để xem thông tin chi tiết của thiết bị
          </h2>
          <div className='mt-1.5 flex items-center gap-2'>
            <span className='text-xs font-medium text-slate-700 dark:text-slate-200'>{equipment.name}</span>
            <span className='rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-400'>
              {equipment.code}
            </span>
          </div>
        </div>

        {/* QR Area */}
        <div className='flex flex-col items-center px-5 py-6'>
          <div className='flex h-[220px] w-[220px] items-center justify-center rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950'>
            {loading ? (
              <div className='h-[180px] w-[180px] animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800' />
            ) : error ? (
              <div className='flex flex-col items-center gap-2 text-center'>
                <p className='text-xs text-rose-500'>{error}</p>
                <button
                  onClick={() => void loadQR(equipment.id)}
                  className='inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'
                >
                  <FiRefreshCw className='h-3.5 w-3.5' /> Thử lại
                </button>
              </div>
            ) : qrUrl ? (
              <img src={qrUrl} alt={`QR code - ${equipment.name}`} className='h-[200px] w-[200px] object-contain' />
            ) : null}
          </div>

          <p className='mt-3 text-center text-xs text-slate-400 dark:text-slate-500'>
            Dùng camera điện thoại để quét và mở trang chi tiết thiết bị
          </p>

          {/* Actions */}
          <div className='mt-4 flex w-full gap-2'>
            <button
              onClick={onClose}
              className='flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            >
              Đóng
            </button>
            <button
              onClick={handleDownload}
              disabled={!qrUrl || loading}
              className='inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <FiDownload className='h-4 w-4' />
              Tải xuống
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
