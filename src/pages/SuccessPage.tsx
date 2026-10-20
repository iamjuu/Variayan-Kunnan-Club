import { CheckCircle2, Printer } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, ButtonLink } from '../components/ui/Button'
import { formatDateTime, MODE_LABEL } from '../lib/format'
import type { RegistrationSummary } from '../lib/types'

export function SuccessPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const registration = state as RegistrationSummary | null

  if (!registration?.registrationId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-primary-900">No registration to show</h1>
        <p className="mt-2 text-ink/60">Start a new entry from the registration form.</p>
        <ButtonLink to="/register" className="mt-6">
          Register
        </ButtonLink>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:py-16">
      <div className="card p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="size-10 text-primary-700" />
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-accent-600 uppercase">Registration received</p>
            <h1 className="font-display text-3xl font-semibold text-primary-950">Thank you</h1>
            <p className="mt-1 text-ink/60">Keep this ID. The club will use it for lists, certificates and reporting.</p>
          </div>
        </div>
        <p className="mt-6 rounded-2xl bg-primary-900 px-4 py-4 text-center font-display text-2xl tracking-wide text-white">{registration.registrationId}</p>
        <dl className="mt-6 space-y-2 text-sm">
          <Row label="Mode" value={MODE_LABEL[registration.mode]} />
          <Row label="Category" value={registration.category} />
          <Row label={registration.mode === 'group' ? 'Team' : 'Participant'} value={registration.teamName ?? registration.participantName} />
          {registration.teamLeaderName && <Row label="Leader" value={registration.teamLeaderName} />}
          {registration.memberCount != null && <Row label="Members" value={String(registration.memberCount)} />}
          <Row label="Submitted" value={formatDateTime(registration.createdAt)} />
        </dl>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ink/70">
          {registration.events.map((e) => (
            <li key={e.displayEventId}>
              {e.name} <span className="text-ink/40">#{e.displayEventId}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="outline" icon={<Printer className="size-4" />} onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="secondary" onClick={() => navigate('/register')}>
            New registration
          </Button>
          <ButtonLink to="/" variant="ghost">
            Home
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink/50">{label}</dt>
      <dd className="font-medium">{value || '—'}</dd>
    </div>
  )
}
