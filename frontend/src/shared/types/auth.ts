import type { User } from '@/types'

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface AuthError {
  code: string
  message: string
}
