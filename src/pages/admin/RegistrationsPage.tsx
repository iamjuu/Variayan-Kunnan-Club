import { Download, Eye, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../../components/layout/AdminLayout'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Alert, EmptyState, Spinner } from '../../components/ui/Feedback'
import { Input, Select } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { Pagination, Segmented } from '../../components/ui/Tabs'
import { api, downloadFile, errorMessage } from '../../lib/api'
import { formatDateTime, MODE_LABEL, PERSON_GENDER_LABEL } from '../../lib/format'
import type { Category, CompetitionItem, Mode, Paginated, RegistrationDetail, RegistrationListItem } from '../../lib/types'
import { useApi } from '../../lib/useApi'
import { toast } from 'sonner'

function PrivateImage({ url, alt }: { url: string; alt: string }) {
  const [src, setSrc] = useState<string>()
  useEffect(() => {
    let objectUrl: string | undefined
    let alive = true
    api
      .get<Blob>(url, { responseType: 'blob' })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data)
        if (alive) setSrc(objectUrl)
      })
      .catch(() => undefined)
    return () => {
      alive = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [url])
  if (!src) return <div className="size-24 animate-pulse rounded-xl bg-primary-50" />
  return <img src={src} alt={alt} className="size-24 rounded-xl object-cover" />
}

export function RegistrationsPage() {
  const { data: categories } = useApi<Category[]>('/admin/categories')
  const [mode, setMode] = useState<Mode>('individual')
  const [q, setQ] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [eventId, setEventId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const eventsUrl = useMemo(() => {
    const params = new URLSearchParams({ mode, status: 'all' })
    if (categoryId) params.set('categoryId', categoryId)
    return `/admin/competitions?${params}`
  }, [mode, categoryId])
  const { data: events } = useApi<CompetitionItem[]>(eventsUrl)

  const listUrl = useMemo(() => {
    const params = new URLSearchParams({ mode, page: String(page), limit: '15' })
    if (q) params.set('q', q)
    if (categoryId) params.set('categoryId', categoryId)
    if (eventId) params.set('eventId', eventId)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    return `/admin/registrations?${params}`
  }, [mode, q, categoryId, eventId, from, to, page])

  const { data, loading, error } = useApi<Paginated<RegistrationListItem>>(listUrl)
  const { data: detail, loading: detailLoading } = useApi<RegistrationDetail>(detailId ? `/admin/registrations/${detailId}` : null)

  useEffect(() => {
    setPage(1)
    setEventId('')
  }, [mode, categoryId])

  const query: Record<string, string | undefined> = {
    mode,
    categoryId: categoryId || undefined,
    eventId: eventId || undefined,
    from: from || undefined,
    to: to || undefined,
    q: q || undefined,
  }

  const exportNow = async (format: 'xlsx' | 'pdf', extra: Record<string, string> = {}) => {
    setExporting(true)
    try {
      await downloadFile('/admin/registrations/export', { format, ...query, ...extra })
      toast.success(`${format.toUpperCase()} export started`)
    } catch (err) {
      toast.error(errorMessage(err, 'Export failed'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Registrations"
        description="Search, filter and export actual MongoDB records."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" loading={exporting} onClick={() => exportNow('xlsx')} icon={<Download className="size-4" />}>
              Excel
            </Button>
            <Button size="sm" variant="outline" loading={exporting} onClick={() => exportNow('pdf')} icon={<Download className="size-4" />}>
              PDF
            </Button>
            <Button size="sm" variant="secondary" loading={exporting} onClick={() => exportNow('pdf', { view: 'events' })}>
              Event-wise PDF
            </Button>
          </div>
        }
      />

      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: 'individual', label: 'Individual' },
          { value: 'group', label: 'Group' },
        ]}
      />

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/35" />
          <Input className="pl-9" placeholder="Search name, team or ID" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
        </div>
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={eventId} onChange={(e) => { setEventId(e.target.value); setPage(1) }}>
          <option value="">All competitions</option>
          {events?.map((e) => (
            <option key={e._id} value={e._id}>
              {e.name} ({e.displayEventId})
            </option>
          ))}
        </Select>
        <div className="flex gap-2">
          <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1) }} aria-label="From date" />
          <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1) }} aria-label="To date" />
        </div>
      </div>

      <div className="mt-4 card overflow-x-auto">
        {loading && <Spinner />}
        {error && <Alert tone="error" title={error} />}
        {data && data.items.length === 0 && <EmptyState title="No registrations match these filters" />}
        {data && data.items.length > 0 && (
          <table className="min-w-full text-sm">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Registration ID</th>
                <th className="px-4 py-3">{mode === 'group' ? 'Team' : 'Participant'}</th>
                {mode === 'group' && <th className="px-4 py-3">Leader</th>}
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Events</th>
                {mode === 'group' && <th className="px-4 py-3">Members</th>}
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((r) => (
                <tr key={r._id} className="border-t border-primary-900/8">
                  <td className="px-4 py-3 font-semibold">{r.registrationId}</td>
                  <td className="px-4 py-3">{r.participant?.fullName ?? r.team?.teamName}</td>
                  {mode === 'group' && <td className="px-4 py-3">{r.team?.teamLeaderName}</td>}
                  <td className="px-4 py-3">{r.participant?.contactNumber ?? r.team?.contactNumber}</td>
                  <td className="px-4 py-3">{r.category?.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.events.map((e) => (
                        <Badge key={e.eventId} tone="gray">
                          {e.name}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  {mode === 'group' && <td className="px-4 py-3">{r.team?.memberCount}</td>}
                  <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost" icon={<Eye className="size-4" />} onClick={() => setDetailId(r.registrationId)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {data && (
        <div className="mt-4">
          <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} />
        </div>
      )}

      <Modal
        open={Boolean(detailId)}
        onClose={() => setDetailId(null)}
        title={detail?.registrationId ?? 'Registration'}
        description={detail ? `${MODE_LABEL[detail.mode]} · ${detail.category?.name}` : undefined}
        size="lg"
      >
        {detailLoading && <Spinner />}
        {detail && (
          <div className="space-y-5 text-sm">
            <p className="text-ink/55">Submitted {formatDateTime(detail.createdAt)}</p>
            <div>
              <h3 className="mb-2 font-semibold">Competition items</h3>
              <ul className="space-y-1">
                {detail.events.map((e) => (
                  <li key={e.eventId}>
                    {e.name} <span className="text-ink/40">#{e.displayEventId}</span>
                  </li>
                ))}
              </ul>
            </div>
            {detail.participant && (
              <div className="flex flex-wrap gap-4">
                {detail.participant.photo && <PrivateImage url={`/admin/registrations/${detail._id}/files/photo`} alt={detail.participant.fullName} />}
                <dl className="space-y-1">
                  <dt className="text-ink/50">Participant</dt>
                  <dd className="font-semibold">{detail.participant.fullName}</dd>
                  <dd>{detail.participant.contactNumber}</dd>
                  <dd>{PERSON_GENDER_LABEL[detail.participant.gender]}</dd>
                  {detail.participant.aadhaarLast4 && <dd>Aadhaar ending {detail.participant.aadhaarLast4}</dd>}
                </dl>
              </div>
            )}
            {detail.team && (
              <div>
                <h3 className="mb-2 font-semibold">
                  {detail.team.teamName} · leader {detail.team.teamLeaderName}
                </h3>
                <p className="mb-3 text-ink/55">{detail.team.contactNumber}</p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {detail.team.members.map((m) => (
                    <li key={m.memberNumber} className="flex gap-3 rounded-xl bg-primary-50/60 p-3">
                      {m.photo && <PrivateImage url={`/admin/registrations/${detail._id}/files/member-${m.memberNumber}`} alt={m.fullName} />}
                      <div>
                        <p className="font-semibold">
                          {m.memberNumber}. {m.fullName}
                        </p>
                        <p className="text-ink/55">{PERSON_GENDER_LABEL[m.gender]}</p>
                        {m.contactNumber && <p>{m.contactNumber}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
