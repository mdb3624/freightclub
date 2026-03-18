import type { UserRole } from '@/types'
import type { EquipmentType } from '@/features/loads/types'

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
  companyName: string
  joinCode: string
  mcNumber: string
  dotNumber: string
  equipmentType: EquipmentType | '' | undefined
}
