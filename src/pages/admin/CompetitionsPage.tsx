import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '../../components/layout/AdminLayout'
import { GenderBadge, StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import { Alert, EmptyState, Spinner } from '../../components/ui/Feedback'
import { Modal } from '../../components/ui/Modal'
import { Segmented } from '../../components/ui/Tabs'
import { api, errorMessage } from '../../lib/api'
import { participantRange } from '../../lib/format'
import type { Category, CompetitionItem, ItemStatus, Mode } from '../../lib/types'
import { useApi } from '../../lib/useApi'

interface FormState {
  name: string
  categoryId: string
  participationMode: Mode
  description: string
  gender: 'male' | 'female' | 'any'
  ageDivision: string
  minAge: string
  maxAge: string
  minParticipants: string
  maxParticipants: string
  isRelay: boolean
  rules: string
  status: 'active' | 'inactive'
}

const emptyForm = (categories: Category[], mode: Mode, categoryId: string): FormState => ({
  name: '',
  categoryId: categoryId || categories[0]?._id || '',
  participationMode: mode,
  description: '',
  gender: 'any',
  ageDivision: '',
  minAge: '',
  maxAge: '',
  minParticipants: mode === 'individual' ? '1' : '2',
  maxParticipants: mode === 'individual' ? '1' : '8',
  isRelay: false,
  rules: '',
  status: 'active',
})

function fromItem(item: CompetitionItem): FormState {
  const categoryId = typeof item.categoryId === 'string' ? item.categoryId : item.categoryId._id
  return {
    name: item.name,
    categoryId,
    participationMode: item.participationMode,
    description: item.description ?? '',
    gender: item.gender,
    ageDivision: item.ageDivision ?? '',
    minAge: item.minAge == null ? '' : String(item.minAge),
    maxAge: item.maxAge == null ? '' : String(item.maxAge),
    minParticipants: String(item.minParticipants),
    maxParticipants: String(item.maxParticipants),
    isRelay: item.isRelay,
    rules: item.rules ?? '',
    status: item.status === 'archived' ? 'inactive' : item.status,
  }
}

function toPayload(form: FormState) {
  return {
    name: form.name,
    categoryId: form.categoryId,
    participationMode: form.participationMode,
    description: form.description,
    gender: form.gender,
    ageDivision: form.ageDivision,
    minAge: form.minAge === '' ? null : Number(form.minAge),
    maxAge: form.maxAge === '' ? null : Number(form.maxAge),
    minParticipants: form.participationMode === 'individual' ? 1 : Number(form.minParticipants),
    maxParticipants: form.participationMode === 'individual' ? 1 : Number(form.maxParticipants),
    isRelay: form.isRelay,
    rules: form.rules,
    status: form.status,
  }
}

export function CompetitionsPage() {
  const { data: categories } = useApi<Category[]>('/admin/categories')
  const [mode, setMode] = useState<Mode>('individual')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState<'all' | ItemStatus | 'active'>('all')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<CompetitionItem | 'new' | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)

  const listUrl = useMemo(() => {
    const params = new URLSearchParams({ mode })
    if (categoryId) params.set('categoryId', categoryId)
    if (status !== 'all') params.set('status', status)
    if (q) params.set('q', q)
    return `/admin/competitions?${params}`
  }, [mode, categoryId, status, q])

  const { data: items, loading, error, reload } = useApi<CompetitionItem[]>(listUrl)

  const openNew = () => {
    if (!categories) return
    setEditing('new')
    setForm(emptyForm(categories, mode, categoryId))
  }
  const openEdit = (item: CompetitionItem) => {
    setEditing(item)
    setForm(fromItem(item))
  }

  const save = async () => {
    if (!form) return
    setSaving(true)
    try {
      if (editing === 'new') await api.post('/admin/competitions', toPayload(form))
      else if (editing) await api.put(`/admin/competitions/${editing._id}`, toPayload(form))
      toast.success(editing === 'new' ? 'Competition item added' : 'Competition item updated')
      setEditing(null)
      await reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const patchStatus = async (item: CompetitionItem, action: 'activate' | 'deactivate' | 'archive' | 'restore') => {
    try {
      await api.patch(`/admin/competitions/${item._id}/status`, { action })
      toast.success(`Item ${action}d`)
      await reload()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <>
      <PageHeader
        title="Competition items"
        description="Changes appear on the public registration form immediately."
        actions={
          <Button size="sm" onClick={openNew} icon={<Plus className="size-4" />}>
            Add competition
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'individual', label: 'Individual' },
            { value: 'group', label: 'Group' },
          ]}
        />
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-40">
          <option value="">Arts & Sports</option>
          {categories?.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="w-36">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </Select>
        <Input placeholder="Search items" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>

      <div className="mt-4 card overflow-x-auto">
        {loading && <Spinner />}
        {error && <Alert tone="error" title={error} />}
        {items && items.length === 0 && <EmptyState title="No competition items" action={<Button onClick={openNew}>Add one</Button>} />}
        {items && items.length > 0 && (
          <table className="min-w-full text-sm">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Division</th>
                <th className="px-4 py-3">Team size</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Regs</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-t border-primary-900/8">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-ink/45">#{item.displayEventId}</p>
                  </td>
                  <td className="px-4 py-3">{typeof item.categoryId === 'object' ? item.categoryId.name : ''}</td>
                  <td className="px-4 py-3">
                    <GenderBadge gender={item.gender} />
                  </td>
                  <td className="px-4 py-3">{item.ageDivision || '—'}</td>
                  <td className="px-4 py-3">{participantRange(item)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3">{item.registrationCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.status !== 'archived' && (
                        <Button size="sm" variant="ghost" onClick={() => openEdit(item)}>
                          Edit
                        </Button>
                      )}
                      {item.status === 'active' && (
                        <Button size="sm" variant="ghost" onClick={() => patchStatus(item, 'deactivate')}>
                          Deactivate
                        </Button>
                      )}
                      {item.status === 'inactive' && (
                        <Button size="sm" variant="ghost" onClick={() => patchStatus(item, 'activate')}>
                          Activate
                        </Button>
                      )}
                      {item.status !== 'archived' ? (
                        <Button size="sm" variant="ghost" onClick={() => patchStatus(item, 'archive')}>
                          Archive
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => patchStatus(item, 'restore')}>
                          Restore
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={Boolean(editing && form)}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add competition' : 'Edit competition'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={save}>
              Save
            </Button>
          </>
        }
      >
        {form && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Event name" required className="sm:col-span-2">
              {(id) => <Input id={id} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
            </Field>
            <Field label="Category">
              {(id) => (
                <Select id={id} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  {categories?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Participation mode">
              {(id) => (
                <Select
                  id={id}
                  value={form.participationMode}
                  onChange={(e) => {
                    const participationMode = e.target.value as Mode
                    setForm({
                      ...form,
                      participationMode,
                      minParticipants: participationMode === 'individual' ? '1' : form.minParticipants,
                      maxParticipants: participationMode === 'individual' ? '1' : form.maxParticipants,
                    })
                  }}
                >
                  <option value="individual">Individual</option>
                  <option value="group">Group</option>
                </Select>
              )}
            </Field>
            <Field label="Gender">
              {(id) => (
                <Select id={id} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as FormState['gender'] })}>
                  <option value="any">Open to all</option>
                  <option value="male">Male only</option>
                  <option value="female">Female only</option>
                </Select>
              )}
            </Field>
            <Field label="Age division">
              {(id) => <Input id={id} value={form.ageDivision} onChange={(e) => setForm({ ...form, ageDivision: e.target.value })} />}
            </Field>
            <Field label="Minimum age">
              {(id) => <Input id={id} type="number" value={form.minAge} onChange={(e) => setForm({ ...form, minAge: e.target.value })} />}
            </Field>
            <Field label="Maximum age">
              {(id) => <Input id={id} type="number" value={form.maxAge} onChange={(e) => setForm({ ...form, maxAge: e.target.value })} />}
            </Field>
            {form.participationMode === 'group' && (
              <>
                <Field label="Minimum members">
                  {(id) => <Input id={id} type="number" value={form.minParticipants} onChange={(e) => setForm({ ...form, minParticipants: e.target.value })} />}
                </Field>
                <Field label="Maximum members">
                  {(id) => <Input id={id} type="number" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} />}
                </Field>
              </>
            )}
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" className="accent-primary-700" checked={form.isRelay} onChange={(e) => setForm({ ...form, isRelay: e.target.checked })} />
              Count as a relay (uses the extra relay allowance when confirmed in Settings)
            </label>
            <Field label="Status">
              {(id) => (
                <Select id={id} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              )}
            </Field>
            <Field label="Description" className="sm:col-span-2">
              {(id) => <Textarea id={id} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />}
            </Field>
            <Field label="Rules" className="sm:col-span-2">
              {(id) => <Textarea id={id} value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} />}
            </Field>
            <p className="text-xs text-ink/45 sm:col-span-2">Imported Keralotsavam items cannot be deleted. Archive them to hide them while keeping registration history.</p>
          </div>
        )}
      </Modal>
    </>
  )
}
