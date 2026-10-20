import { ImagePlus, PanelTop, Star, Trash2, Upload } from 'lucide-react'
import { useMemo, useRef, useState, type DragEvent } from 'react'
import { toast } from 'sonner'
import { gallerySrc } from '../../components/gallery/GalleryMosaic'
import { PageHeader } from '../../components/layout/AdminLayout'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select, Textarea, Toggle } from '../../components/ui/Field'
import { Alert, EmptyState, Spinner } from '../../components/ui/Feedback'
import { Modal } from '../../components/ui/Modal'
import { Segmented } from '../../components/ui/Tabs'
import { api, errorMessage } from '../../lib/api'
import { formatBytes, formatDateTime } from '../../lib/format'
import { albumMeta, GALLERY_ALBUMS, type GalleryAlbum, type GalleryImage } from '../../lib/types'
import { useApi } from '../../lib/useApi'

type AlbumFilter = 'all' | GalleryAlbum

interface MetaForm {
  title: string
  caption: string
  album: GalleryAlbum
  featured: boolean
  hero: boolean
  isPublished: boolean
  sortOrder: string
}

const emptyMeta = (): MetaForm => ({
  title: '',
  caption: '',
  album: 'club',
  featured: false,
  hero: false,
  isPublished: true,
  sortOrder: '0',
})

export function AdminGalleryPage() {
  const [album, setAlbum] = useState<AlbumFilter>('all')
  const [meta, setMeta] = useState<MetaForm>(emptyMeta)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState<GalleryImage | null>(null)
  const [editForm, setEditForm] = useState<MetaForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<GalleryImage | null>(null)
  const [dragging, setDragging] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  const listUrl = album === 'all' ? '/admin/gallery' : `/admin/gallery?album=${album}`
  const { data, loading, error, reload } = useApi<GalleryImage[]>(listUrl)
  const items = data ?? []

  const options = useMemo(
    () => [{ value: 'all' as const, label: 'All' }, ...GALLERY_ALBUMS.map((a) => ({ value: a.value, label: a.label }))],
    [],
  )

  const addFiles = (list: FileList | File[]) => {
    const next = Array.from(list).filter((f) => /image\/(jpeg|png|webp)/.test(f.type))
    if (!next.length) {
      toast.error('Choose JPG, PNG or WebP photos.')
      return
    }
    setFiles((prev) => [...prev, ...next].slice(0, 12))
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }

  const upload = async () => {
    if (!files.length) {
      toast.error('Choose at least one photo.')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      for (const file of files) fd.append('images', file)
      fd.append('title', meta.title)
      fd.append('caption', meta.caption)
      fd.append('album', meta.album)
      fd.append('featured', String(meta.featured))
      fd.append('hero', String(meta.hero))
      fd.append('isPublished', String(meta.isPublished))
      fd.append('sortOrder', meta.sortOrder || '0')
      await api.post('/admin/gallery', fd)
      toast.success(files.length === 1 ? 'Photo published to the gallery' : `${files.length} photos added`)
      setFiles([])
      setMeta((m) => ({ ...m, title: '', caption: '' }))
      await reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const saveEdit = async () => {
    if (!editing || !editForm) return
    setSaving(true)
    try {
      await api.put(`/admin/gallery/${editing._id}`, {
        title: editForm.title,
        caption: editForm.caption,
        album: editForm.album,
        featured: editForm.featured,
        hero: editForm.hero,
        isPublished: editForm.isPublished,
        sortOrder: Number(editForm.sortOrder || 0),
      })
      toast.success('Photo updated')
      setEditing(null)
      await reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const replaceImage = async (file: File | undefined) => {
    if (!editing || !file) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await api.patch<GalleryImage>(`/admin/gallery/${editing._id}/image`, fd)
      setEditing(res.data)
      toast.success('Photo replaced')
      await reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!deleting) return
    setSaving(true)
    try {
      await api.delete(`/admin/gallery/${deleting._id}`)
      toast.success('Photo removed')
      setDeleting(null)
      if (editing?._id === deleting._id) setEditing(null)
      await reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const toggleFlag = async (item: GalleryImage, patch: Partial<Pick<GalleryImage, 'featured' | 'hero' | 'isPublished'>>) => {
    try {
      await api.put(`/admin/gallery/${item._id}`, {
        title: item.title,
        caption: item.caption,
        album: item.album,
        featured: patch.featured ?? item.featured,
        hero: patch.hero ?? item.hero,
        isPublished: patch.isPublished ?? item.isPublished,
        sortOrder: item.sortOrder,
      })
      await reload()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <>
      <PageHeader title="Gallery" description="Upload public photos for the club site. Featured images appear on the home page; unpublished photos stay hidden." />

      <section className="card p-5 sm:p-6">
        <h2 className="font-semibold text-primary-900">Add photos</h2>
        <p className="mt-1 text-sm text-ink/55">JPG, PNG or WebP · up to 8 MB each · 12 files at a time. These files are public, not encrypted.</p>
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mt-4 grid place-items-center rounded-2xl border-2 border-dashed px-4 py-10 text-center transition ${dragging ? 'border-primary-600 bg-primary-50' : 'border-primary-900/15 bg-primary-50/40'}`}
        >
          <Upload className="size-8 text-primary-700/70" />
          <p className="mt-3 text-sm font-semibold text-ink">Drop photos here, or browse</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => input.current?.click()}>
            Choose files
          </Button>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </div>
        {files.length > 0 && (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((file, i) => (
              <li key={`${file.name}-${i}`} className="flex items-center justify-between gap-3 rounded-xl bg-primary-50/70 px-3 py-2 text-sm">
                <span className="truncate font-medium">{file.name}</span>
                <span className="shrink-0 text-ink/45">{formatBytes(file.size)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Title" hint="Leave blank to use the file name">
            {(id) => <Input id={id} value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} />}
          </Field>
          <Field label="Album" required>
            {(id) => (
              <Select id={id} value={meta.album} onChange={(e) => setMeta({ ...meta, album: e.target.value as GalleryAlbum })}>
                {GALLERY_ALBUMS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Caption" className="md:col-span-2">
            {(id) => <Textarea id={id} rows={2} value={meta.caption} onChange={(e) => setMeta({ ...meta, caption: e.target.value })} />}
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Toggle checked={meta.hero} onChange={(v) => setMeta({ ...meta, hero: v })} label="Home hero image" description="Fills the large photo at the top of the public home page. Only one photo can be the hero." />
          <Toggle checked={meta.featured} onChange={(v) => setMeta({ ...meta, featured: v })} label="Featured on home" description="Shown in the home gallery mosaic." />
          <Toggle checked={meta.isPublished} onChange={(v) => setMeta({ ...meta, isPublished: v })} label="Published" description="Unpublished photos are only visible here." />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={upload} loading={uploading} icon={<ImagePlus className="size-4" />}>
            Upload to gallery
          </Button>
          {files.length > 0 && (
            <Button variant="ghost" onClick={() => setFiles([])}>
              Clear files
            </Button>
          )}
        </div>
      </section>

      <div className="mt-8 overflow-x-auto">
        <Segmented value={album} onChange={setAlbum} options={options} />
      </div>

      {loading && <Spinner label="Loading photos…" />}
      {error && <Alert tone="error" title={error} />}
      {!loading && items.length === 0 && (
        <EmptyState title="No photos in this album yet" description="Upload images above. Featured, published photos appear on Home and Gallery." />
      )}
      {!loading && items.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const metaLabel = albumMeta(item.album)
            return (
              <li key={item._id} className="card overflow-hidden">
                <button type="button" className="relative block aspect-[4/3] w-full overflow-hidden bg-primary-950" onClick={() => { setEditing(item); setEditForm(toForm(item)) }}>
                  <img src={gallerySrc(item)} alt={item.title || metaLabel.label} className="size-full object-cover" />
                  <span className="absolute top-3 left-3 flex flex-wrap gap-1">
                    <Badge tone="gold">{metaLabel.label}</Badge>
                    {item.hero && <Badge tone="gold">Hero</Badge>}
                    {item.featured && <Badge tone="green">Featured</Badge>}
                    {!item.isPublished && <Badge tone="gray">Hidden</Badge>}
                  </span>
                </button>
                <div className="space-y-2 p-4">
                  <p className="font-semibold text-primary-950">{item.title || 'Untitled'}</p>
                  <p className="text-xs text-ink/45">{formatDateTime(item.createdAt)}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" variant={item.hero ? 'accent' : 'secondary'} onClick={() => void toggleFlag(item, { hero: !item.hero })} icon={<PanelTop className="size-3.5" />}>
                      {item.hero ? 'Hero' : 'Set hero'}
                    </Button>
                    <Button size="sm" variant={item.featured ? 'accent' : 'outline'} onClick={() => void toggleFlag(item, { featured: !item.featured })} icon={<Star className="size-3.5" />}>
                      {item.featured ? 'Featured' : 'Feature'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void toggleFlag(item, { isPublished: !item.isPublished })}>
                      {item.isPublished ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setDeleting(item)} icon={<Trash2 className="size-3.5" />}>
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Modal
        open={Boolean(editing && editForm)}
        onClose={() => setEditing(null)}
        title="Edit photo"
        description="Changes go live on the public gallery immediately when published."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={() => void saveEdit()} loading={saving}>
              Save
            </Button>
          </>
        }
      >
        {editing && editForm && (
          <div className="space-y-4">
            <img src={gallerySrc(editing)} alt="" className="max-h-56 w-full rounded-2xl object-cover" />
            <Field label="Replace image">
              {(id) => (
                <Input
                  id={id}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => void replaceImage(e.target.files?.[0])}
                />
              )}
            </Field>
            <Field label="Title">
              {(id) => <Input id={id} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />}
            </Field>
            <Field label="Caption">
              {(id) => <Textarea id={id} rows={3} value={editForm.caption} onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })} />}
            </Field>
            <Field label="Album">
              {(id) => (
                <Select id={id} value={editForm.album} onChange={(e) => setEditForm({ ...editForm, album: e.target.value as GalleryAlbum })}>
                  {GALLERY_ALBUMS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Sort order" hint="Lower numbers appear first">
              {(id) => <Input id={id} type="number" min={0} max={9999} value={editForm.sortOrder} onChange={(e) => setEditForm({ ...editForm, sortOrder: e.target.value })} />}
            </Field>
            <Toggle checked={editForm.hero} onChange={(v) => setEditForm({ ...editForm, hero: v })} label="Home hero image" description="Replaces the large photo at the top of the home page." />
            <Toggle checked={editForm.featured} onChange={(v) => setEditForm({ ...editForm, featured: v })} label="Featured on home" />
            <Toggle checked={editForm.isPublished} onChange={(v) => setEditForm({ ...editForm, isPublished: v })} label="Published" />
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Remove this photo?"
        description="It will disappear from the public gallery. This cannot be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Keep
            </Button>
            <Button variant="danger" loading={saving} onClick={() => void remove()}>
              Delete photo
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink/70">{deleting?.title || 'Untitled photo'} will be removed from storage.</p>
      </Modal>
    </>
  )
}

function toForm(item: GalleryImage): MetaForm {
  return {
    title: item.title ?? '',
    caption: item.caption ?? '',
    album: item.album,
    featured: item.featured,
    hero: Boolean(item.hero),
    isPublished: item.isPublished,
    sortOrder: String(item.sortOrder ?? 0),
  }
}
