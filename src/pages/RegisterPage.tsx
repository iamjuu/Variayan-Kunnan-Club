import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../components/ui/Button'
import { Alert, Spinner } from '../components/ui/Feedback'
import { CategoryStep, ModeStep } from '../features/registration/ChoiceStep'
import { GroupDetails, IndividualDetails } from '../features/registration/DetailsStep'
import { EventsStep } from '../features/registration/EventsStep'
import { ReviewStep } from '../features/registration/ReviewStep'
import { selectionRules, teamSizeRange, type GroupValues, type IndividualValues } from '../features/registration/rules'
import { Stepper } from '../features/registration/Stepper'
import { api, errorIssues, errorMessage } from '../lib/api'
import { useApi } from '../lib/useApi'
import type { Category, CompetitionItem, Mode, PublicSettings, RegistrationSummary } from '../lib/types'

const emptyIndividual = (): IndividualValues => ({
  fullName: '',
  contactNumber: '',
  gender: '',
  dateOfBirth: '',
  aadhaarNumber: '',
  photo: null,
  aadhaarDocument: null,
})

const emptyMember = () => ({ fullName: '', gender: '', dateOfBirth: '', contactNumber: '', photo: null })

const emptyGroup = (min = 1): GroupValues => ({
  teamName: '',
  teamLeaderName: '',
  contactNumber: '',
  members: Array.from({ length: min }, emptyMember),
})

export function RegisterPage() {
  const navigate = useNavigate()
  const { data: settings, loading: settingsLoading } = useApi<PublicSettings>('/settings/public')
  const { data: categories, loading: catLoading } = useApi<Category[]>('/categories')

  const [step, setStep] = useState(1)
  const [mode, setMode] = useState<Mode>()
  const [category, setCategory] = useState<Category>()
  const [selected, setSelected] = useState<CompetitionItem[]>([])
  const [individual, setIndividual] = useState<IndividualValues>(emptyIndividual)
  const [group, setGroup] = useState<GroupValues>(emptyGroup())
  const [consent, setConsent] = useState(false)
  const [submissionKey] = useState(() => crypto.randomUUID())
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const competitionsUrl = category && mode ? `/competitions?categoryId=${category._id}&mode=${mode}` : null
  const { data: items, loading: itemsLoading, error: itemsError } = useApi<CompetitionItem[]>(competitionsUrl)

  useEffect(() => {
    setSelected([])
  }, [mode, category?._id])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  const rules = settings ? selectionRules(settings) : null

  const toggleItem = (item: CompetitionItem) => {
    setSelected((current) => {
      if (current.some((c) => c._id === item._id)) return current.filter((c) => c._id !== item._id)
      if (settings && !selectionRules(settings).canAdd(current, item)) return current
      return [...current, item]
    })
  }

  const go = (next: number) => setStep(next)

  const onMode = (value: Mode) => {
    setMode(value)
    setCategory(undefined)
    go(2)
  }
  const onCategory = (value: Category) => {
    setCategory(value)
    go(3)
  }

  const canProceedFromEvents = selected.length > 0 && !(selected.some((e) => e.gender === 'male') && selected.some((e) => e.gender === 'female'))

  const submit = async () => {
    if (!mode || !category || !settings) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const payload: Record<string, unknown> = {
        submissionKey,
        mode,
        categoryId: category._id,
        selectedEventIds: selected.map((e) => e._id),
        consent: true,
      }
      const fd = new FormData()
      if (mode === 'individual') {
        payload.participant = {
          fullName: individual.fullName,
          contactNumber: individual.contactNumber,
          gender: individual.gender,
          dateOfBirth: individual.dateOfBirth || undefined,
          aadhaarNumber: individual.aadhaarNumber || undefined,
        }
        if (individual.photo instanceof File) fd.append('participantPhoto', individual.photo)
        if (individual.aadhaarDocument instanceof File) fd.append('aadhaarDocument', individual.aadhaarDocument)
      } else {
        payload.team = {
          teamName: group.teamName,
          teamLeaderName: group.teamLeaderName,
          contactNumber: group.contactNumber,
          members: group.members.map((m) => ({
            fullName: m.fullName,
            gender: m.gender,
            dateOfBirth: m.dateOfBirth || undefined,
            contactNumber: m.contactNumber || undefined,
          })),
        }
        group.members.forEach((m, i) => {
          if (m.photo instanceof File) fd.append(`memberPhoto_${i}`, m.photo)
        })
      }
      fd.append('data', JSON.stringify(payload))
      const res = await api.post<{ duplicate: boolean; registration: RegistrationSummary }>('/registrations', fd, { timeout: 180_000 })
      if (res.data.duplicate) toast.message('This registration was already received.')
      navigate('/register/success', { replace: true, state: res.data.registration })
    } catch (error) {
      const extra = errorIssues(error)
      setSubmitError([errorMessage(error), ...extra].filter(Boolean).join(' '))
    } finally {
      setSubmitting(false)
    }
  }

  if (settingsLoading || catLoading) return <Spinner label="Loading registration…" />
  if (!settings || !categories) return <Alert tone="error" title="Could not load the registration form." />
  if (!settings.registrationOpen) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Alert tone="warning" title="Registrations are closed">
          Please check back later or contact the club office.
        </Alert>
      </div>
    )
  }

  const range = teamSizeRange(selected)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Stepper step={step} onJump={(n) => n < step && go(n)} />
      <div className="mt-8 card p-5 sm:p-8">
        {step === 1 && <ModeStep value={mode} onSelect={onMode} />}
        {step === 2 && <CategoryStep categories={categories} mode={mode ?? 'individual'} value={category?._id} onSelect={onCategory} />}
        {step === 3 && (
          <>
            {itemsLoading && <Spinner label="Loading competition items…" />}
            {itemsError && <Alert tone="error" title={itemsError} />}
            {items && settings && (
              <EventsStep items={items} selected={selected} onToggle={toggleItem} settings={settings} mode={mode ?? 'individual'} />
            )}
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => go(2)}>
                Back
              </Button>
              <Button disabled={!canProceedFromEvents} onClick={() => go(4)}>
                Continue
              </Button>
            </div>
          </>
        )}
        {step === 4 && mode === 'individual' && (
          <IndividualDetails
            events={selected}
            settings={settings}
            defaultValues={individual}
            onBack={() => go(3)}
            onSubmit={(values) => {
              setIndividual(values)
              go(5)
            }}
          />
        )}
        {step === 4 && mode === 'group' && (
          <GroupDetails
            events={selected}
            settings={settings}
            defaultValues={{
              ...group,
              members: group.members.length >= range.min ? group.members : [...group.members, ...Array.from({ length: range.min - group.members.length }, emptyMember)],
            }}
            onBack={() => go(3)}
            onSubmit={(values) => {
              setGroup(values)
              go(5)
            }}
          />
        )}
        {step === 5 && mode && category && (
          <ReviewStep
            mode={mode}
            category={category}
            events={selected}
            individual={individual}
            group={group}
            consent={consent}
            onConsent={setConsent}
            onEdit={go}
            onBack={() => go(4)}
            onSubmit={submit}
            submitting={submitting}
            error={submitError}
          />
        )}
      </div>
      {rules && step === 3 && selected.length > 0 && (
        <p className="mt-3 text-center text-sm text-ink/45">
          {selected.length} selected
          {mode === 'individual' ? ` · ${rules.summary(selected)}` : ''}
        </p>
      )}
      {step === 3 && !canProceedFromEvents && selected.length > 0 && (
        <p className="mt-2 text-center text-sm text-red-600">Select a compatible set of items before continuing.</p>
      )}
    </div>
  )
}
