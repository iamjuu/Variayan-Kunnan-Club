import { Button } from '../../components/ui/Button'
import { EVENT_GENDER_LABEL, MODE_LABEL, PERSON_GENDER_LABEL, formatDate } from '../../lib/format'
import type { Category, CompetitionItem, Mode } from '../../lib/types'
import type { GroupValues, IndividualValues } from './rules'
import { StepHeading } from './Stepper'

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-3 py-2 text-sm sm:grid-cols-[11rem_1fr]">
      <dt className="text-ink/50">{label}</dt>
      <dd className="font-medium text-ink">{value || '—'}</dd>
    </div>
  )
}

export function ReviewStep({
  mode,
  category,
  events,
  individual,
  group,
  consent,
  onConsent,
  onEdit,
  onBack,
  onSubmit,
  submitting,
  error,
}: {
  mode: Mode
  category: Category
  events: CompetitionItem[]
  individual?: IndividualValues
  group?: GroupValues
  consent: boolean
  onConsent: (v: boolean) => void
  onEdit: (step: number) => void
  onBack: () => void
  onSubmit: () => void
  submitting: boolean
  error?: string | null
}) {
  return (
    <div className="space-y-6">
      <StepHeading eyebrow="Step 5" title="Review and submit" description="Check every detail. You can go back and edit before sending." />

      <section className="card p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-primary-900">Entry</h3>
          <button type="button" onClick={() => onEdit(1)} className="text-sm font-semibold text-primary-700 hover:underline">
            Edit
          </button>
        </div>
        <dl>
          <Row label="Mode" value={MODE_LABEL[mode]} />
          <Row label="Category" value={category.name} />
        </dl>
      </section>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-primary-900">Competition items</h3>
          <button type="button" onClick={() => onEdit(3)} className="text-sm font-semibold text-primary-700 hover:underline">
            Edit
          </button>
        </div>
        <ul className="space-y-2 text-sm">
          {events.map((e) => (
            <li key={e._id} className="flex flex-wrap justify-between gap-2 rounded-xl bg-primary-50/70 px-3 py-2">
              <span className="font-medium">{e.name}</span>
              <span className="text-ink/50">
                #{e.displayEventId} · {EVENT_GENDER_LABEL[e.gender]}
                {e.ageDivision ? ` · ${e.ageDivision}` : ''}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {mode === 'individual' && individual && (
        <section className="card p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-primary-900">Participant</h3>
            <button type="button" onClick={() => onEdit(4)} className="text-sm font-semibold text-primary-700 hover:underline">
              Edit
            </button>
          </div>
          <dl>
            <Row label="Name" value={individual.fullName} />
            <Row label="Contact" value={individual.contactNumber} />
            <Row label="Gender" value={individual.gender === 'male' || individual.gender === 'female' || individual.gender === 'other' ? PERSON_GENDER_LABEL[individual.gender] : '—'} />
            <Row label="Date of birth" value={individual.dateOfBirth ? formatDate(individual.dateOfBirth) : '—'} />
            <Row label="Photo" value={individual.photo instanceof File ? individual.photo.name : 'Missing'} />
          </dl>
        </section>
      )}

      {mode === 'group' && group && (
        <section className="card p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-primary-900">Team</h3>
            <button type="button" onClick={() => onEdit(4)} className="text-sm font-semibold text-primary-700 hover:underline">
              Edit
            </button>
          </div>
          <dl>
            <Row label="Team name" value={group.teamName} />
            <Row label="Leader" value={group.teamLeaderName} />
            <Row label="Contact" value={group.contactNumber} />
          </dl>
          <ul className="mt-3 divide-y divide-primary-900/8 text-sm">
            {group.members.map((m, i) => (
              <li key={`${m.fullName}-${i}`} className="flex flex-wrap justify-between gap-2 py-2">
                <span>
                  {i + 1}. {m.fullName} · {m.gender === 'male' || m.gender === 'female' || m.gender === 'other' ? PERSON_GENDER_LABEL[m.gender] : '—'}
                </span>
                <span className="text-ink/50">{m.photo instanceof File ? m.photo.name : 'No photo'}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <label className="flex items-start gap-3 rounded-2xl border border-primary-900/10 bg-white p-4 text-sm">
        <input type="checkbox" className="mt-1 size-4 accent-primary-700" checked={consent} onChange={(e) => onConsent(e.target.checked)} />
        <span>
          I confirm that the details given are true, that passport photographs belong to the named participants, and I consent to Variayan Kunan Club storing this registration for conducting Keralotsavam. Sensitive identity numbers, if provided, will be stored only in hashed or masked form.
        </span>
      </label>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <div className="flex flex-wrap justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onSubmit} loading={submitting} disabled={!consent || submitting}>
          Submit registration
        </Button>
      </div>
    </div>
  )
}
