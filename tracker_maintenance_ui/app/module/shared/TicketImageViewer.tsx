import { useEffect, useState } from 'react'
import { FiCamera, FiImage, FiZoomIn } from 'react-icons/fi'

import { ticketApi } from '@/lib/ticketApi'
import { formatDate } from '@/lib/ticketUtils'
import type { TicketImage } from '@/types/ticket'

type Props = {
  ticketId: string
}

export function TicketImageViewer({ ticketId }: Props) {
  const [images, setImages] = useState<TicketImage[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    async function fetchImages() {
      try {
        const data = await ticketApi.getImages(ticketId)
        setImages(data)
      } finally {
        setLoading(false)
      }
    }
    fetchImages()
  }, [ticketId])

  const beforeImages = images.filter((i) => i.imageType === 'BEFORE')
  const afterImages = images.filter((i) => i.imageType === 'AFTER')

  function Gallery({ title, images, icon: Icon }: { title: string; images: TicketImage[]; icon: any }) {
    return (
      <div>
        <div className='mb-2 flex items-center gap-2'>
          <Icon className='h-4 w-4 text-slate-500' />
          <p className='text-sm font-semibold'>{title}</p>
        </div>

        {images.length === 0 ? (
          <p className='rounded-xl border border-dashed py-6 text-center text-xs text-slate-400'>
            No {title.toLowerCase()} images yet
          </p>
        ) : (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            {images.map((img) => (
              <div key={img.id} className='group relative aspect-square overflow-hidden rounded-xl border'>
                <img src={img.imageUrl} className='h-full w-full object-cover' />

                <button
                  onClick={() => setLightbox(img.imageUrl)}
                  className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40'
                >
                  <FiZoomIn className='h-5 w-5 text-white' />
                </button>

                <p className='absolute bottom-0 left-0 right-0 bg-black/60 text-xs text-white text-center py-1'>
                  {formatDate(img.uploadedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (loading) return <p className='text-sm text-slate-400'>Loading images...</p>

  return (
    <div className='space-y-5'>
      <Gallery title='Before' images={beforeImages} icon={FiCamera} />
      <Gallery title='After' images={afterImages} icon={FiImage} />

      {lightbox && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/90'
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} className='max-h-[90vh] max-w-full' />
        </div>
      )}
    </div>
  )
}
