import { z } from 'zod'
import { ageOn } from '../../lib/format'
import type { CompetitionItem, PublicSettings } from '../../lib/types'

export const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u
export const TEAM_PATTERN = /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N}\s.'&()-]*$/u
export const MAX_GROUP_MEMBERS = 40

export const normaliseMobile = (v: string) => v.replace(/[\s-]/g, '').replace(/^(\+91|91(?=\d{10}$)|0(?=\d{10}$))/, '')
const normaliseName = (v: string) => v.toLocaleLowerCase('en-IN').replace(/[^\p{L}\p{M}\p{N}]+/gu, '')

const D = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]]
const P = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,0,2,7,8,6],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]]
export function isValidAadhaar(value: string) {
  const digits = value.replace(/\s+/g, '')
  if (!/^[2-9]\d{11}$/.test(digits)) return false
  let c = 0
  digits.split('').reverse().map(Number).forEach((n, i) => (c = D[c][P[i % 8][n]]))
  return c === 0
}

export const hasAgeRule = (e: CompetitionItem) => e.minAge != null || e.maxAge != null

/** Team size that satisfies every selected group item at once. */
export function teamSizeRange(events: CompetitionItem[]) {
  if (!events.length) return { min: 1, max: MAX_GROUP_MEMBERS, valid: true }
  const min = Math.max(...events.map((e) => e.minParticipants))
  const max = Math.min(MAX_GROUP_MEMBERS, ...events.map((e) => e.maxParticipants))
  return { min, max, valid: min <= max }
}

export function selectionRules(settings: PublicSettings) {
  const relayMode = settings.relayAllowanceConfirmed && settings.relayAllowance > 0
  return {
    relayMode,
    canAdd(selected: CompetitionItem[], item: CompetitionItem) {
      if (item.participationMode === 'group') return true
      const relay = selected.filter((e) => e.isRelay).length
      if (!relayMode) return selected.length < settings.individualEventLimit
      return item.isRelay ? relay < settings.relayAllowance : selected.length - relay < settings.individualEventLimit
    },
    summary(selected: CompetitionItem[]) {
      const relay = selected.filter((e) => e.isRelay).length
      return relayMode
        ? `${selected.length - relay} of ${settings.individualEventLimit} items · ${relay} of ${settings.relayAllowance} relay`
        : `${selected.length} of ${settings.individualEventLimit} items selected`
    },
  }
}

interface Person {
  fullName?: string
  gender?: string
  dateOfBirth?: string
}

function personProblems(person: Person, events: CompetitionItem[], reference: Date) {
  const gender: string[] = []
  const age: string[] = []
  for (const e of events) {
    if (person.gender && e.gender !== 'any' && person.gender !== e.gender) gender.push(`Not eligible for "${e.name}" (${e.gender} only)`)
    if (hasAgeRule(e)) {
      if (!person.dateOfBirth) age.push(`Date of birth is required for "${e.name}"`)
      else {
        const a = ageOn(person.dateOfBirth, reference)
        if (e.minAge != null && a < e.minAge) age.push(`Must be at least ${e.minAge} for "${e.name}"`)
        if (e.maxAge != null && a > e.maxAge) age.push(`Must be at most ${e.maxAge} for "${e.name}"`)
      }
    }
  }
  return { gender, age }
}

const fullName = z.string().trim().min(2, 'Enter the full name').max(100, 'Name is too long').regex(NAME_PATTERN, 'Use letters, spaces, dots or hyphens only')
const mobile = z.string().trim().min(1, 'Contact number is required').refine((v) => /^[6-9]\d{9}$/.test(normaliseMobile(v)), 'Enter a valid 10 digit Indian mobile number')
const optionalMobile = z.string().trim().refine((v) => !v || /^[6-9]\d{9}$/.test(normaliseMobile(v)), 'Enter a valid 10 digit Indian mobile number')
const gender = z.string().refine((v) => v === 'male' || v === 'female' || v === 'other', 'Select a gender')
const dob = z
  .string()
  .refine((v) => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && new Date(v) <= new Date() && new Date(v).getFullYear() > new Date().getFullYear() - 100), 'Enter a valid date of birth')

function imageFile(maxMB: number, required: boolean, allowPdf = false) {
  return z.custom<File | null>((v) => v == null || v instanceof File).superRefine((file, ctx) => {
    if (!file) {
      if (required) ctx.addIssue({ code: 'custom', message: 'A passport size photo is required' })
      return
    }
    const types = allowPdf ? ['image/jpeg', 'image/png', 'application/pdf'] : ['image/jpeg', 'image/png']
    if (!types.includes(file.type)) ctx.addIssue({ code: 'custom', message: allowPdf ? 'Use a JPG, PNG or PDF file' : 'Use a JPG or PNG image' })
    else if (file.size > maxMB * 1048576) ctx.addIssue({ code: 'custom', message: `File must be smaller than ${maxMB} MB` })
  })
}

export function individualSchema(events: CompetitionItem[], settings: PublicSettings) {
  const reference = settings.ageReferenceDate ? new Date(settings.ageReferenceDate) : new Date()
  return z
    .object({
      fullName,
      contactNumber: mobile,
      gender,
      dateOfBirth: dob,
      aadhaarNumber: z.string().trim().refine((v) => !v || isValidAadhaar(v), 'Enter a valid 12 digit Aadhaar number'),
      photo: imageFile(settings.maxPhotoMB, true),
      aadhaarDocument: imageFile(settings.maxDocumentMB, false, true),
    })
    .superRefine((v, ctx) => {
      const { gender: g, age } = personProblems(v, events, reference)
      if (g.length) ctx.addIssue({ code: 'custom', path: ['gender'], message: g[0] })
      if (age.length) ctx.addIssue({ code: 'custom', path: ['dateOfBirth'], message: age[0] })
    })
}
export type IndividualValues = z.input<ReturnType<typeof individualSchema>>

export function groupSchema(events: CompetitionItem[], settings: PublicSettings) {
  const reference = settings.ageReferenceDate ? new Date(settings.ageReferenceDate) : new Date()
  const range = teamSizeRange(events)
  return z
    .object({
      teamName: z.string().trim().min(2, 'Enter the team name').max(100).regex(TEAM_PATTERN, 'Team name contains unsupported characters'),
      teamLeaderName: fullName,
      contactNumber: mobile,
      members: z.array(
        z.object({ fullName, gender, dateOfBirth: dob, contactNumber: optionalMobile, photo: imageFile(settings.maxPhotoMB, true) }),
      ),
    })
    .superRefine((v, ctx) => {
      if (v.members.length < range.min || v.members.length > range.max) {
        ctx.addIssue({
          code: 'custom',
          path: ['members'],
          message: range.min === range.max ? `This team needs exactly ${range.min} members` : `This team needs ${range.min}–${range.max} members`,
        })
      }
      const seen = new Map<string, number>()
      const phones = new Map<string, number>()
      v.members.forEach((m, i) => {
        const { gender: g, age } = personProblems(m, events, reference)
        if (g.length) ctx.addIssue({ code: 'custom', path: ['members', i, 'gender'], message: g[0] })
        if (age.length) ctx.addIssue({ code: 'custom', path: ['members', i, 'dateOfBirth'], message: age[0] })
        const key = `${normaliseName(m.fullName)}|${m.dateOfBirth ?? ''}`
        if (m.fullName && seen.has(key)) ctx.addIssue({ code: 'custom', path: ['members', i, 'fullName'], message: `Duplicate of member ${seen.get(key)! + 1}` })
        else seen.set(key, i)
        const phone = m.contactNumber ? normaliseMobile(m.contactNumber) : ''
        if (phone && phones.has(phone)) ctx.addIssue({ code: 'custom', path: ['members', i, 'contactNumber'], message: `Same number as member ${phones.get(phone)! + 1}` })
        else if (phone) phones.set(phone, i)
      })
    })
}
export type GroupValues = z.input<ReturnType<typeof groupSchema>>
export type MemberValues = GroupValues['members'][number]
