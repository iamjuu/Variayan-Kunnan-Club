import { Plus, Trash2 } from 'lucide-react'
import { Controller, useFieldArray, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select } from '../../components/ui/Field'
import { Alert } from '../../components/ui/Feedback'
import { PhotoUpload } from '../../components/ui/PhotoUpload'
import type { CompetitionItem, PublicSettings } from '../../lib/types'
import {
  groupSchema,
  individualSchema,
  teamSizeRange,
  type GroupValues,
  type IndividualValues,
} from './rules'
import { StepHeading } from './Stepper'

const GENDERS = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other / Prefer to describe later' },
]

export function IndividualDetails({
  events,
  settings,
  defaultValues,
  onBack,
  onSubmit,
}: {
  events: CompetitionItem[]
  settings: PublicSettings
  defaultValues: IndividualValues
  onBack: () => void
  onSubmit: (values: IndividualValues) => void
}) {
  const needsDob = events.some((e) => e.minAge != null || e.maxAge != null)
  const form = useForm<IndividualValues>({
    resolver: zodResolver(individualSchema(events, settings)) as Resolver<IndividualValues>,
    defaultValues,
    mode: 'onBlur',
  })
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <StepHeading eyebrow="Step 4" title="Participant details" description="Use the name as it should appear on certificates." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required error={errors.fullName?.message}>
          {(id) => <Input id={id} autoComplete="name" invalid={Boolean(errors.fullName)} {...register('fullName')} />}
        </Field>
        <Field label="Contact number" required hint="10 digit Indian mobile number" error={errors.contactNumber?.message}>
          {(id) => <Input id={id} inputMode="numeric" autoComplete="tel" invalid={Boolean(errors.contactNumber)} {...register('contactNumber')} />}
        </Field>
        <Field label="Gender" required error={errors.gender?.message}>
          {(id) => (
            <Select id={id} invalid={Boolean(errors.gender)} {...register('gender')}>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value} disabled={!g.value}>
                  {g.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Date of birth" required={needsDob} hint={needsDob ? 'Required for the age-restricted items you selected.' : 'Optional unless an item has an age limit.'} error={errors.dateOfBirth?.message}>
          {(id) => <Input id={id} type="date" invalid={Boolean(errors.dateOfBirth)} {...register('dateOfBirth')} />}
        </Field>
      </div>
      <Controller
        control={control}
        name="photo"
        render={({ field, fieldState }) => (
          <PhotoUpload value={field.value} onChange={field.onChange} error={fieldState.error?.message} label="Upload passport photo" />
        )}
      />
      {settings.collectAadhaar && (
        <div className="space-y-4 rounded-2xl border border-primary-900/10 bg-primary-50/40 p-4">
          <p className="text-sm font-semibold text-primary-900">Optional identity verification</p>
          <p className="text-xs text-ink/55">Aadhaar is collected only when the organiser enables it. The full number is never stored.</p>
          <Field label="Aadhaar number" error={errors.aadhaarNumber?.message}>
            {(id) => <Input id={id} inputMode="numeric" autoComplete="off" invalid={Boolean(errors.aadhaarNumber)} {...register('aadhaarNumber')} />}
          </Field>
          <Controller
            control={control}
            name="aadhaarDocument"
            render={({ field, fieldState }) => (
              <PhotoUpload value={field.value} onChange={field.onChange} error={fieldState.error?.message} allowPdf accept="image/jpeg,image/png,application/pdf" label="Optional supporting document" />
            )}
          />
        </div>
      )}
      <div className="flex flex-wrap justify-between gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue to review</Button>
      </div>
    </form>
  )
}

export function GroupDetails({
  events,
  settings,
  defaultValues,
  onBack,
  onSubmit,
}: {
  events: CompetitionItem[]
  settings: PublicSettings
  defaultValues: GroupValues
  onBack: () => void
  onSubmit: (values: GroupValues) => void
}) {
  const range = teamSizeRange(events)
  const form = useForm<GroupValues>({
    resolver: zodResolver(groupSchema(events, settings)) as Resolver<GroupValues>,
    defaultValues,
    mode: 'onBlur',
  })
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form
  const { fields, append, remove } = useFieldArray({ control, name: 'members' })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <StepHeading
        eyebrow="Step 4"
        title="Team details"
        description={
          range.min === range.max ? `This team needs exactly ${range.min} members.` : `This team needs ${range.min}–${range.max} members to satisfy every selected item.`
        }
      />
      {!range.valid && (
        <Alert tone="error" title="These items cannot share one team">
          The selected items have overlapping member limits that cannot be satisfied together. Go back and change the selection.
        </Alert>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Team name" required error={errors.teamName?.message}>
          {(id) => <Input id={id} invalid={Boolean(errors.teamName)} {...register('teamName')} />}
        </Field>
        <Field label="Team leader" required error={errors.teamLeaderName?.message}>
          {(id) => <Input id={id} invalid={Boolean(errors.teamLeaderName)} {...register('teamLeaderName')} />}
        </Field>
        <Field label="Contact number" required hint="10 digit Indian mobile number" error={errors.contactNumber?.message} className="sm:col-span-2">
          {(id) => <Input id={id} inputMode="numeric" invalid={Boolean(errors.contactNumber)} {...register('contactNumber')} />}
        </Field>
      </div>

      {typeof errors.members?.message === 'string' && (
        <Alert tone="error" title={errors.members.message} />
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <article key={field.id} className="rounded-2xl border border-primary-900/10 bg-white p-4 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary-900">Member {index + 1}</h3>
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(index)} className="inline-flex items-center gap-1 text-sm font-semibold text-red-600">
                  <Trash2 className="size-3.5" /> Remove
                </button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required error={errors.members?.[index]?.fullName?.message}>
                {(id) => <Input id={id} invalid={Boolean(errors.members?.[index]?.fullName)} {...register(`members.${index}.fullName`)} />}
              </Field>
              <Field label="Gender" required error={errors.members?.[index]?.gender?.message}>
                {(id) => (
                  <Select id={id} invalid={Boolean(errors.members?.[index]?.gender)} {...register(`members.${index}.gender`)}>
                    {GENDERS.map((g) => (
                      <option key={g.value} value={g.value} disabled={!g.value}>
                        {g.label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Date of birth" error={errors.members?.[index]?.dateOfBirth?.message}>
                {(id) => <Input id={id} type="date" invalid={Boolean(errors.members?.[index]?.dateOfBirth)} {...register(`members.${index}.dateOfBirth`)} />}
              </Field>
              <Field label="Contact number" error={errors.members?.[index]?.contactNumber?.message}>
                {(id) => <Input id={id} inputMode="numeric" invalid={Boolean(errors.members?.[index]?.contactNumber)} {...register(`members.${index}.contactNumber`)} />}
              </Field>
            </div>
            <div className="mt-4">
              <Controller
                control={control}
                name={`members.${index}.photo`}
                render={({ field: photo, fieldState }) => (
                  <PhotoUpload compact value={photo.value} onChange={photo.onChange} error={fieldState.error?.message} />
                )}
              />
            </div>
          </article>
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        disabled={fields.length >= range.max}
        onClick={() => append({ fullName: '', gender: '', dateOfBirth: '', contactNumber: '', photo: null })}
        icon={<Plus className="size-4" />}
      >
        Add member
      </Button>

      <div className="flex flex-wrap justify-between gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue to review</Button>
      </div>
    </form>
  )
}
