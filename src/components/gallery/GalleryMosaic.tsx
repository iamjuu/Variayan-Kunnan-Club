import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'
import { albumMeta, type GalleryAlbum, type GalleryImage } from '../../lib/types'

const FALLBACKS: { album: GalleryAlbum; malayalam: string; label: string }[] = [
  { album: 'club', malayalam: 'വരിയാൻ കുന്നൻ', label: 'Club life' },
  { album: 'keralotsavam', malayalam: 'കേരളോത്സവം', label: 'Season festival' },
  { album: 'arts', malayalam: 'കലാപരിപാടി', label: 'Arts' },
  { album: 'sports', malayalam: 'കായികം', label: 'Sports' },
  { album: 'club', malayalam: 'സമൂഹം', label: 'Community' },
  { album: 'keralotsavam', malayalam: 'ഉത്സവം', label: 'Celebration' },
]

export function gallerySrc(image: GalleryImage) {
  const stamp = encodeURIComponent(image.updatedAt ?? image.createdAt ?? '')
  return stamp ? `${image.imageUrl}?v=${stamp}` : image.imageUrl
}

export function pickGallery(featured?: GalleryImage[] | null, latest?: GalleryImage[] | null, limit = 8) {
  const lead = featured ?? []
  if (lead.length >= limit) return lead.slice(0, limit)
  const seen = new Set(lead.map((i) => i._id))
  return [...lead, ...(latest ?? []).filter((i) => !seen.has(i._id))].slice(0, limit)
}

export function GalleryMosaic({
  images,
  variant = 'page',
  emptyCount = 6,
  className,
}: {
  images: GalleryImage[]
  variant?: 'hero' | 'page'
  emptyCount?: number
  className?: string
}) {
  const [open, setOpen] = useState<number | null>(null)
  const tiles = images.length ? images : Array.from({ length: emptyCount }, () => null)

  return (
    <>
      <div className={cn('gallery-mosaic', className)} data-variant={variant}>
        {tiles.map((image, i) =>
          image ? (
            <button
              key={image._id}
              type="button"
              className="gallery-tile group relative overflow-hidden rounded-2xl text-left shadow-soft ring-1 ring-primary-900/8"
              onClick={() => setOpen(i)}
            >
              <img src={gallerySrc(image)} alt={image.title || albumMeta(image.album).label} className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-primary-950/70 via-transparent to-transparent opacity-80" />
              <span className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <span className="text-[11px] font-semibold tracking-[0.14em] text-accent-300 uppercase">{albumMeta(image.album).label}</span>
                {image.title && <span className="mt-0.5 block font-display text-sm font-semibold text-white sm:text-base">{image.title}</span>}
              </span>
            </button>
          ) : (
            <FallbackTile key={`empty-${i}`} index={i} />
          ),
        )}
      </div>
      {open != null && images.length > 0 && (
        <GalleryLightbox images={images} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
      )}
    </>
  )
}

function FallbackTile({ index }: { index: number }) {
  const tile = FALLBACKS[index % FALLBACKS.length]
  return (
    <div className="gallery-tile relative overflow-hidden rounded-2xl bg-primary-900 shadow-soft ring-1 ring-white/10">
      <div className="kasavu-pattern absolute inset-0 opacity-40" />
      <LampMotif className="absolute -right-6 -bottom-8 size-40 text-accent-400/25" />
      <div className="relative flex h-full flex-col justify-end p-4">
        <p className="font-display text-xl text-white/90" lang="ml">
          {tile.malayalam}
        </p>
        <p className="text-xs font-semibold tracking-[0.16em] text-accent-300 uppercase">{tile.label}</p>
      </div>
    </div>
  )
}

function LampMotif({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <path d="M40 8c10 12 16 22 16 32a16 16 0 1 1-32 0c0-10 6-20 16-32Z" fill="currentColor" />
      <path d="M18 62c8-5 15-7 22-7s14 2 22 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M14 70c10-6 18-8 26-8s16 2 26 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function GalleryLightbox({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: GalleryImage[]
  index: number
  onClose: () => void
  onIndex: (index: number) => void
}) {
  const image = images[index]
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onIndex((index + 1) % images.length)
      if (e.key === 'ArrowLeft') onIndex((index - 1 + images.length) % images.length)
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [index, images.length, onClose, onIndex])

  if (!image) return null
  const meta = albumMeta(image.album)

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-950/88 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={image.title || meta.label}>
      <button type="button" className="absolute inset-0 cursor-zoom-out" onClick={onClose} aria-label="Close photo" />
      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-primary-950 shadow-2xl ring-1 ring-white/10">
        <img src={gallerySrc(image)} alt={image.title || meta.label} className="max-h-[78dvh] w-full object-contain bg-black/40" />
        <div className="flex items-start justify-between gap-4 px-5 py-4 text-white">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-accent-300 uppercase">
              {meta.label} · <span lang="ml">{meta.malayalam}</span>
            </p>
            {image.title && <p className="mt-1 font-display text-xl">{image.title}</p>}
            {image.caption && <p className="mt-1 max-w-2xl text-sm text-white/65">{image.caption}</p>}
          </div>
          <p className="shrink-0 text-sm text-white/45">
            {index + 1} / {images.length}
          </p>
        </div>
      </div>
      <button type="button" onClick={onClose} className="absolute top-4 right-4 z-20 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Close">
        <X className="size-5" />
      </button>
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="absolute top-1/2 left-3 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => onIndex((index - 1 + images.length) % images.length)}
            aria-label="Previous photo"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            className="absolute top-1/2 right-3 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => onIndex((index + 1) % images.length)}
            aria-label="Next photo"
          >
            <ChevronRight className="size-6" />
          </button>
        </>
      )}
    </div>,
    document.body,
  )
}
