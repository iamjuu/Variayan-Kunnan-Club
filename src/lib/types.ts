export type Mode = 'individual' | 'group'
export type EventGender = 'male' | 'female' | 'any'
export type PersonGender = 'male' | 'female' | 'other'
export type ItemStatus = 'active' | 'inactive' | 'archived'

export interface Category {
  _id: string
  name: string
  slug: 'arts' | 'sports'
  activeEvents?: { individual: number; group: number }
}

export interface CompetitionItem {
  _id: string
  legacyEventId?: number | string
  eventCode: string
  displayEventId: string
  name: string
  description: string
  categoryId: string | Category
  participationMode: Mode
  gender: EventGender
  ageDivision: string
  minAge: number | null
  maxAge: number | null
  minParticipants: number
  maxParticipants: number
  isRelay: boolean
  rules: string
  status: ItemStatus
  isActive: boolean
  startsFrom?: string | null
  endsAt?: string | null
  eventLevels?: unknown[]
  registrationCount?: number
  legacy?: { subCategoryName?: string; source?: string }
}

export type GalleryAlbum = 'club' | 'keralotsavam' | 'arts' | 'sports'

export interface GalleryImage {
  _id: string
  title: string
  caption: string
  album: GalleryAlbum
  featured: boolean
  hero: boolean
  isPublished: boolean
  sortOrder: number
  imageUrl: string
  image?: { mimeType: string; size: number }
  createdAt: string
  updatedAt?: string
}

export const GALLERY_ALBUMS: { value: GalleryAlbum; label: string; malayalam: string }[] = [
  { value: 'club', label: 'Club life', malayalam: 'ക്ലബ്' },
  { value: 'keralotsavam', label: 'Keralotsavam', malayalam: 'കേരളോത്സവം' },
  { value: 'arts', label: 'Arts', malayalam: 'കല' },
  { value: 'sports', label: 'Sports', malayalam: 'കായികം' },
]

export function albumMeta(album: GalleryAlbum) {
  return GALLERY_ALBUMS.find((a) => a.value === album) ?? GALLERY_ALBUMS[0]
}

export interface PublicSettings {
  registrationOpen: boolean
  individualEventLimit: number
  relayAllowance: number
  relayAllowanceConfirmed: boolean
  collectAadhaar: boolean
  ageReferenceDate: string | null
  consentVersion: string
  maxPhotoMB: number
  maxDocumentMB: number
}

export interface AdminSettings extends Omit<PublicSettings, 'consentVersion' | 'maxPhotoMB' | 'maxDocumentMB'> {
  retentionDays: number | null
  updatedAt?: string
}

export interface Admin {
  id: string
  name: string
  email: string
  role: string
  mustChangePassword: boolean
  isDevelopmentSeed: boolean
  lastLoginAt: string | null
}

export interface EventSnapshot {
  eventId: string
  displayEventId: string
  name: string
  gender?: EventGender
  ageDivision?: string
}

export interface RegistrationSummary {
  registrationId: string
  mode: Mode
  category: string | null
  events: { displayEventId: string; name: string }[]
  participantName: string | null
  teamName: string | null
  teamLeaderName: string | null
  memberCount: number | null
  createdAt: string
}

export interface RegistrationListItem {
  _id: string
  registrationId: string
  mode: Mode
  category: Pick<Category, '_id' | 'name' | 'slug'> | null
  participant: { fullName: string; contactNumber: string; gender: PersonGender } | null
  team: { teamName: string; teamLeaderName: string; contactNumber: string; memberCount: number } | null
  events: EventSnapshot[]
  createdAt: string
}

export interface FileInfo {
  mimeType: string
  size: number
}

export interface RegistrationDetail {
  _id: string
  registrationId: string
  mode: Mode
  category: Pick<Category, '_id' | 'name' | 'slug'>
  events: EventSnapshot[]
  participant?: {
    fullName: string
    contactNumber: string
    gender: PersonGender
    dateOfBirth: string | null
    aadhaarLast4: string | null
    photo: FileInfo | null
    aadhaarDocument: FileInfo | null
  }
  team?: {
    teamName: string
    teamLeaderName: string
    contactNumber: string
    members: {
      memberNumber: number
      fullName: string
      gender: PersonGender
      dateOfBirth: string | null
      contactNumber: string | null
      photo: FileInfo | null
    }[]
  }
  consentAcceptedAt: string
  consentVersion: string
  createdAt: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface DashboardData {
  stats: {
    totalRegistrations: number
    individualRegistrations: number
    groupRegistrations: number
    artsRegistrations: number
    sportsRegistrations: number
    totalActiveEvents: number
    galleryPhotos: number
  }
  recentRegistrations: RegistrationListItem[]
  topEvents: { _id: string; name: string; displayEventId: string; count: number }[]
}

export interface ExportLogEntry {
  _id: string
  adminEmail: string
  format: 'xlsx' | 'pdf'
  filters: Record<string, string>
  recordCount: number
  createdAt: string
}
