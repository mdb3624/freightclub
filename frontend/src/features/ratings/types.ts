import type { UserRole } from '@/types/index'

export interface Rating {
  id: string
  loadId: string
  reviewerId: string
  reviewedId: string
  reviewerRole: UserRole
  stars: number
  comment: string | null
  createdAt: string
}

export interface RatingSummary {
  avgStars: number | null
  totalRatings: number
  completedLoads: number
}

export interface ShipperPublicProfile {
  shipperId: string
  displayName: string
  avgStars: number | null
  totalRatings: number
  completedLoads: number
  cancelledLoads: number
  avgPaymentDays: number | null
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
}
