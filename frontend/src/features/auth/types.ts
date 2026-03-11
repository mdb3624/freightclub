import type { UserRole } from '@/types'

export interface LoginFormValues {
  email: string
  password: string
}

export interface RegisterFormValues {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  role: UserRole
}
