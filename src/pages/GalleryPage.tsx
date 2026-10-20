import { Images } from 'lucide-react'
import { useMemo, useState } from 'react'
import { GalleryMosaic } from '../components/gallery/GalleryMosaic'
import { ButtonLink } from '../components/ui/Button'
import { Alert, EmptyState, Spinner } from '../components/ui/Feedback'
import { Segmented } from '../components/ui/Tabs'
import { GALLERY_ALBUMS, type GalleryAlbum, type GalleryImage } from '../lib/types'
import { useApi } from '../lib/useApi'

type AlbumFilter = 'all' | GalleryAlbum

export function GalleryPage() {
  const [album, setAlbum] = useState<AlbumFilter>('all')
  const url = album === 'all' || album === 'club' ? '/gallery?limit=60' : `/gallery?album=${album}&limit=60`
  const { data, loading, error } = useApi<GalleryImage[]>(url)
  const images = useMemo(() => {
    const list = data ?? []
    if (album !== 'club') return list
    return list.filter((image) => image.album === 'club' || image.album === 'keralotsavam')
  }, [album, data])

  const options = useMemo(
    () => [
      { value: 'all' as const, label: 'All', count: undefined },
      ...GALLERY_ALBUMS.map((a) => ({ value: a.value, label: a.label })),
    ],
    [],
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-accent-600" lang="ml">
          ദൃശ്യങ്ങൾ
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-primary-950 sm:text-5xl">Club gallery</h1>
        <p className="mt-3 text-lg text-ink/65">
          Moments from Variayan Kunan Club — gatherings, arts, sports, and the seasonal Keralotsavam. Photos are published by the organisers from the dashboard.
        </p>
      </div>

      <div className="mt-8 overflow-x-auto">
        <Segmented value={album} onChange={setAlbum} options={options} />
      </div>

      {loading && <Spinner label="Loading gallery…" />}
      {error && <Alert tone="error" title={error} />}
      {!loading && !error && images.length === 0 && (
        <div className="mt-8">
          <EmptyState
            icon={<Images className="size-6" />}
            title="Gallery photos will appear here"
            description="Organisers can upload albums from the dashboard. Until then, the patterns below stand in for club colours — not placeholder photographs."
            action={
              <ButtonLink to="/" variant="outline">
                Back to home
              </ButtonLink>
            }
          />
          <GalleryMosaic images={[]} variant="page" emptyCount={6} className="mt-6" />
        </div>
      )}
      {!loading && images.length > 0 && <GalleryMosaic images={images} variant="page" className="mt-8" />}
    </div>
  )
}
