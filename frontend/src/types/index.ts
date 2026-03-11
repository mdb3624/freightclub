export type UserRole = 'SHIPPER' | 'TRUCKER' | 'ADMIN'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  tenantId: string
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
