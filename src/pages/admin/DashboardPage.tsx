import { ClipboardList, Images, Medal, Palette, Trophy, User, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/layout/AdminLayout'
import { Badge } from '../../components/ui/Badge'
import { Alert, EmptyState, Spinner } from '../../components/ui/Feedback'
import { formatDateTime, MODE_LABEL } from '../../lib/format'
import type { DashboardData } from '../../lib/types'
import { useApi } from '../../lib/useApi'

const STATS: { key: keyof DashboardData['stats']; label: string; icon: typeof Trophy; to?: string }[] = [
  { key: 'totalRegistrations', label: 'Total registrations', icon: ClipboardList, to: '/admin/registrations' },
  { key: 'individualRegistrations', label: 'Individual', icon: User },
  { key: 'groupRegistrations', label: 'Group', icon: Users },
  { key: 'artsRegistrations', label: 'Arts', icon: Palette },
  { key: 'sportsRegistrations', label: 'Sports', icon: Medal },
  { key: 'totalActiveEvents', label: 'Active events', icon: Trophy, to: '/admin/competitions' },
  { key: 'galleryPhotos', label: 'Gallery photos', icon: Images, to: '/admin/gallery' },
]

export function DashboardPage() {
  const { data, loading, error } = useApi<DashboardData>('/admin/dashboard')

  if (loading) return <Spinner label="Loading dashboard…" />
  if (error || !data) return <Alert tone="error" title={error ?? 'Could not load the dashboard'} />

  return (
    <>
      <PageHeader title="Dashboard" description="Live totals from MongoDB registration records." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {STATS.map(({ key, label, icon: Icon, to }) => {
          const inner = (
            <>
              <span className="grid size-11 place-items-center rounded-2xl bg-primary-50 text-primary-800">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-2xl font-bold text-primary-950">{data.stats[key]}</p>
                <p className="text-sm text-ink/55">{label}</p>
              </div>
            </>
          )
          return to ? (
            <Link key={key} to={to} className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
              {inner}
            </Link>
          ) : (
            <div key={key} className="card flex items-center gap-4 p-5">
              {inner}
            </div>
          )
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="font-semibold text-primary-900">Recent registrations</h2>
            <Link to="/admin/registrations" className="text-sm font-semibold text-primary-700 hover:underline">
              View all
            </Link>
          </div>
          {data.recentRegistrations.length === 0 ? (
            <EmptyState title="No registrations yet" />
          ) : (
            <ul className="divide-y divide-primary-900/8">
              {data.recentRegistrations.map((r) => (
                <li key={r._id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-ink">{r.participant?.fullName ?? r.team?.teamName}</p>
                    <p className="text-ink/50">{r.registrationId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={r.mode === 'group' ? 'gold' : 'green'}>{MODE_LABEL[r.mode]}</Badge>
                    <span className="text-ink/45">{formatDateTime(r.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card p-5">
          <h2 className="font-semibold text-primary-900">Most entered items</h2>
          {data.topEvents.length === 0 ? (
            <p className="mt-3 text-sm text-ink/50">No event entries yet.</p>
          ) : (
            <ol className="mt-3 space-y-2 text-sm">
              {data.topEvents.map((e, i) => (
                <li key={e._id} className="flex justify-between gap-3">
                  <span>
                    {i + 1}. {e.name} <span className="text-ink/40">#{e.displayEventId}</span>
                  </span>
                  <span className="font-semibold">{e.count}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  )
}
