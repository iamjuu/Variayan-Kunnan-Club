import type { CompetitionItem, EventGender, Mode, PersonGender } from './types'

export const MODE_LABEL: Record<Mode, string> = { individual: 'Individual', group: 'Group' }
export const PERSON_GENDER_LABEL: Record<PersonGender, string> = { male: 'Male', female: 'Female', other: 'Other' }
export const EVENT_GENDER_LABEL: Record<EventGender, string> = { male: 'Male only', female: 'Female only', any: 'Open to all' }

const dateTime = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const dateOnly = new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' })

export const formatDateTime = (value?: string | null) => (value ? dateTime.format(new Date(value)) : '—')
export const formatDate = (value?: string | null) => (value ? dateOnly.format(new Date(value)) : '—')

export function participantRange(item: Pick<CompetitionItem, 'minParticipants' | 'maxParticipants' | 'participationMode'>) {
  if (item.participationMode === 'individual') return 'Solo'
  if (item.minParticipants === item.maxParticipants) return `Team of ${item.minParticipants}`
  return `Team of ${item.minParticipants}–${item.maxParticipants}`
}

export function ageRule(item: Pick<CompetitionItem, 'minAge' | 'maxAge'>) {
  if (item.minAge != null && item.maxAge != null) return `Age ${item.minAge}–${item.maxAge}`
  if (item.minAge != null) return `Age ${item.minAge}+`
  if (item.maxAge != null) return `Up to age ${item.maxAge}`
  return null
}

export const todayInIndia = () => new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10)

export function ageOn(dob: string, reference: Date) {
  const d = new Date(`${dob}T00:00:00Z`)
  let age = reference.getUTCFullYear() - d.getUTCFullYear()
  if (reference.getUTCMonth() < d.getUTCMonth() || (reference.getUTCMonth() === d.getUTCMonth() && reference.getUTCDate() < d.getUTCDate())) age -= 1
  return age
}

export const formatBytes = (n: number) => (n < 1024 ? `${n} B` : n < 1048576 ? `${Math.round(n / 1024)} KB` : `${(n / 1048576).toFixed(1)} MB`)
