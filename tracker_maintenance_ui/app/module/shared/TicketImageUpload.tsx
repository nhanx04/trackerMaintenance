import { useEffect, useRef, useState } from 'react'
import { FiCamera, FiImage, FiTrash2, FiUpload, FiX, FiZoomIn } from 'react-icons/fi'
import { getAuth } from '@/lib/auth'
import { ticketApi } from '@/lib/ticketApi'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/ticketUtils'
import type { TicketImage } from '@/types/ticket'
import type { BackendRole } from '@/types/auth'

export type UploadType = 'before' | 'after'

export type TicketImageUploadProps = {
  ticketId: string
  /**
   * Reporter / Manager → ['before']
   * Technician         → ['before', 'after']   (default)
   */
  allowedTypes?: UploadType[]
}

type PreviewFile = { id: string; file: File; previewUrl: string }

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className='absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20'
      >
        <FiX className='h-5 w-5' />
      </button>
      <img
        src={src}
        alt='Full size'
        className='max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

// ─── Image Gallery ─────────────────────────────────────────────────────────────

function ImageGallery({
  title,
  icon: Icon,
  images,
  onDelete,
  onZoom,
  allowDelete = true,
  isReporter = false
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  images: TicketImage[]
  onDelete: (id: string) => void
  onZoom: (url: string) => void
  allowDelete?: boolean
  isReporter?: boolean
}) {
  return (
    <div>
      <div className='mb-2 flex items-center gap-2'>
        <Icon className='h-4 w-4 text-slate-500' />
        <p className='text-sm font-semibold text-slate-700 dark:text-slate-200'>{title}</p>
        <span className='rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400'>
          {images.length}
        </span>
      </div>
      {images.length === 0 ? (
        <p className='rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-700'>
          No {title.toLowerCase()} images yet
        </p>
      ) : (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
          {images.map((img) => (
            <div
              key={img.id}
              className='group relative aspect-square overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700'
            >
              <img
                src={img.imageUrl}
                alt={title}
                className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
              />
              <div className='absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/0 opacity-0 transition-all group-hover:bg-slate-900/40 group-hover:opacity-100'>
                <button
                  onClick={() => onZoom(img.imageUrl)}
                  className='rounded-full bg-white/90 p-1.5 text-slate-700 hover:bg-white'
                >
                  <FiZoomIn className='h-3.5 w-3.5' />
                </button>
                {allowDelete && !isReporter && (
                  <button
                    onClick={() => onDelete(img.id)}
                    className='rounded-full bg-white/90 p-1.5 text-rose-600 hover:bg-white'
                  >
                    <FiTrash2 className='h-3.5 w-3.5' />
                  </button>
                )}
              </div>
              <p className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/70 to-transparent px-2 py-1.5 text-center text-xs text-white'>
                {formatDate(img.uploadedAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function hasRole(role: BackendRole) {
  const auth = getAuth()
  return auth?.roles?.includes(role)
}

export function TicketImageUpload({ ticketId, allowedTypes = ['before', 'after'] }: TicketImageUploadProps) {
  const [images, setImages] = useState<TicketImage[]>([])
  const [loadingImages, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<UploadType>(allowedTypes[0])
  const [previews, setPreviews] = useState<PreviewFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [lightboxSrc, setLightbox] = useState<string | null>(null)
  const [imageToDelete, setImageToDelete] = useState<string | null>(null)
  const [deletingImage, setDeletingImage] = useState(false)
  const isTechnician = hasRole('TECHNICIAN')
  const isReporter = hasRole('REPORTER')

  async function fetchImages() {
    setLoading(true)
    try {
      setImages(await ticketApi.getImages(ticketId))
    } catch {
      /* non-critical */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [ticketId])

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.previewUrl))
    }
  }, [])

  function stageFiles(files: FileList | File[]) {
    const arr = Array.from(files)
    if (!arr.length) return
    setUploadError(null)
    setPreviews((prev) => [
      ...prev,
      ...arr.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file)
      }))
    ])
  }

  function removePreview(id: string) {
    setPreviews((prev) => {
      const found = prev.find((p) => p.id === id)
      if (found) URL.revokeObjectURL(found.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
  }

  async function confirmUpload() {
    if (!previews.length || uploading) return
    setUploading(true)
    setUploadError(null)
    try {
      await ticketApi.uploadImages(
        ticketId,
        activeType,
        previews.map((p) => p.file)
      )
      previews.forEach((p) => URL.revokeObjectURL(p.previewUrl))
      setPreviews([])
      await fetchImages()
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function confirmDeleteImage() {
    if (!imageToDelete) return
    setDeletingImage(true)

    try {
      await ticketApi.deleteImage(ticketId, imageToDelete)
      setImages((prev) => prev.filter((i) => i.id !== imageToDelete))
      setImageToDelete(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete image')
    } finally {
      setDeletingImage(false)
    }
  }

  function deleteImage(imageId: string) {
    setImageToDelete(imageId)
  }

  const beforeImages = images.filter((i) => i.imageType === 'BEFORE')
  const afterImages = images.filter((i) => i.imageType === 'AFTER')

  return (
    <div className='space-y-5'>
      {/* Type toggle — only when both types allowed */}
      {/* Upload type display */}
      {allowedTypes.length > 1 ? (
        <div className='flex items-center gap-2'>
          <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>Upload as:</span>

          <div className='flex overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700'>
            {allowedTypes.map((t) => (
              <button
                key={t}
                type='button'
                onClick={() => setActiveType(t)}
                className={cn(
                  'px-4 py-1.5 text-xs font-semibold capitalize transition-colors',
                  activeType === t
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className='flex items-center gap-2'>
          <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>Upload as:</span>

          <span className='rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold capitalize text-white'>
            {allowedTypes[0]}
          </span>
        </div>
      )}

      {/* Drop zone */}
      {allowedTypes.length > 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDragging(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDragging(false)
            if (!uploading && e.dataTransfer.files.length) stageFiles(e.dataTransfer.files)
          }}
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 transition-all',
            dragging
              ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10'
              : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50',
            uploading && 'pointer-events-none opacity-60'
          )}
        >
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              dragging ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-slate-200 dark:bg-slate-700'
            )}
          >
            <FiUpload className={cn('h-5 w-5', dragging ? 'text-blue-600' : 'text-slate-500')} />
          </div>
          <div className='text-center'>
            <p className='text-sm font-semibold text-slate-700 dark:text-slate-200'>
              {dragging ? 'Drop files here' : 'Drag & drop images here'}
            </p>
            <p className='mt-0.5 text-xs text-slate-400'>PNG, JPG, WEBP — max 10 MB each</p>
          </div>

          {/* FIX: dùng <label> wrap <input> thay vì div onClick + ref.click() */}
          <label
            className={cn(
              'cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700',
              'transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
              uploading && 'pointer-events-none opacity-50'
            )}
          >
            Browse files
            <input
              type='file'
              accept='image/*'
              multiple
              className='sr-only'
              onChange={(e) => {
                if (e.target.files?.length) {
                  stageFiles(e.target.files)
                  e.target.value = '' // reset để chọn lại cùng file được
                }
              }}
            />
          </label>
        </div>
      )}

      {/* Upload error */}
      {uploadError && (
        <p className='flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400'>
          <FiX className='h-3.5 w-3.5 shrink-0' /> {uploadError}
        </p>
      )}

      {/* Preview queue */}
      {previews.length > 0 && (
        <div className='rounded-xl border border-blue-200 bg-blue-50/60 p-3 dark:border-blue-800 dark:bg-blue-900/10'>
          <div className='mb-2 flex items-center justify-between'>
            <p className='text-xs font-semibold text-blue-700 dark:text-blue-400'>
              {previews.length} file{previews.length > 1 ? 's' : ''} ready
              {allowedTypes.length > 1 && (
                <>
                  {' '}
                  — <span className='capitalize'>{activeType}</span>
                </>
              )}
            </p>
            <button
              type='button'
              onClick={confirmUpload}
              disabled={uploading}
              className='rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60'
            >
              {uploading ? 'Uploading…' : `Upload ${previews.length} file${previews.length > 1 ? 's' : ''}`}
            </button>
          </div>
          <div className='flex flex-wrap gap-2'>
            {previews.map((item) => (
              <div key={item.id} className='group relative'>
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className='h-16 w-16 rounded-lg object-cover ring-2 ring-blue-300 dark:ring-blue-700'
                />
                <button
                  type='button'
                  onClick={() => removePreview(item.id)}
                  disabled={uploading}
                  className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white opacity-0 transition-opacity hover:bg-rose-600 group-hover:opacity-100 disabled:pointer-events-none'
                >
                  <FiX className='h-3 w-3' />
                </button>
                <p className='mt-0.5 max-w-[4rem] truncate text-center text-xs text-slate-400'>{item.file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery */}
      {!loadingImages && (beforeImages.length > 0 || afterImages.length > 0) && (
        <div className='border-t border-slate-200 dark:border-slate-700' />
      )}
      {loadingImages ? (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='aspect-square animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800' />
          ))}
        </div>
      ) : (
        <div className='space-y-5'>
          {allowedTypes.includes('before') && (
            <ImageGallery
              title='Before'
              icon={FiCamera}
              images={beforeImages}
              onDelete={deleteImage}
              onZoom={setLightbox}
              allowDelete={!isTechnician && !isReporter}
            />
          )}

          {allowedTypes.includes('after') && (
            <ImageGallery
              title='After'
              icon={FiImage}
              images={afterImages}
              onDelete={deleteImage}
              onZoom={setLightbox}
              allowDelete={!isReporter}
            />
          )}
        </div>
      )}
      {imageToDelete && (
        <div className='fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm'>
          <div className='w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-900'>
            <div className='mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20'>
              <FiTrash2 className='h-5 w-5 text-rose-600 dark:text-rose-400' />
            </div>

            <h3 className='mt-3 text-base font-semibold text-slate-900 dark:text-white'>Delete Image?</h3>

            <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
              This image will be permanently deleted. This cannot be undone.
            </p>

            <div className='mt-6 flex justify-center gap-4'>
              <button
                onClick={() => setImageToDelete(null)}
                className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteImage}
                disabled={deletingImage}
                className='rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60'
              >
                {deletingImage ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightbox(null)} />}
    </div>
  )
}
