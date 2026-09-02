export type UserRole = 'SHIPPER' | 'TRUCKER' | 'ADMIN'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  tenantId: string
  equipmentType?: string
  // US-874: additive tenant-admin capability — a SHIPPER/TRUCKER user who created their
  // tenant. Not a separate role; role stays SHIPPER/TRUCKER regardless of this flag.
  // Optional or absent (older cached auth state) must be treated as false, never as admin.
  isTenantAdmin?: boolean
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface RefreshResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}

export interface ApiError {
  status: number
  error: string
  message: string
  path: string
  timestamp: string
}

export interface ShipperProfileResponse {
  id: string
  tenantId: string
  companyName: string
  billingEmail: string
  phoneNumber: string
  city: string
  state: string
  zipCode: string
  mcNumber?: string
  usdotNumber?: string
  logoUrl?: string
  profileCompleteness: number
  createdAt: string
  updatedAt: string
}

export interface ShipperProfileRequest {
  companyName: string
  billingEmail: string
  phoneNumber: string
  city: string
  state: string
  zipCode: string
  mcNumber?: string
  usdotNumber?: string
  logoUrl?: string
}
