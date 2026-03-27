import type { EquipmentType } from '@/features/loads/types'

export interface Profile {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  tenantId: string | null
  companyName: string | null
  companyJoinCode: string | null
  businessName: string | null
  phone: string | null
  billingAddress1: string | null
  billingAddress2: string | null
  billingCity: string | null
  billingState: string | null
  billingZip: string | null
  defaultPickupAddress1: string | null
  defaultPickupAddress2: string | null
  defaultPickupCity: string | null
  defaultPickupState: string | null
  defaultPickupZip: string | null
  notifyEmail: boolean
  notifySms: boolean
  notifyInApp: boolean
  mcNumber: string | null
  dotNumber: string | null
  equipmentType: EquipmentType | null
  monthlyFixedCosts: number | null
  fuelCostPerGallon: number | null
  milesPerGallon: number | null
  maintenanceCostPerMile: number | null
  monthlyMilesTarget: number | null
  targetMarginPerMile: number | null
}

export interface UpdateProfileValues {
  firstName: string
  lastName: string
  businessName: string
  phone: string
  billingAddress1: string
  billingAddress2: string
  billingCity: string
  billingState: string
  billingZip: string
  defaultPickupAddress1: string
  defaultPickupAddress2: string
  defaultPickupCity: string
  defaultPickupState: string
  defaultPickupZip: string
  notifyEmail: boolean
  notifySms: boolean
  notifyInApp: boolean
  mcNumber: string
  dotNumber: string
  equipmentType: EquipmentType | '' | undefined
  monthlyFixedCosts: number | '' | null
  fuelCostPerGallon: number | '' | null
  milesPerGallon: number | '' | null
  maintenanceCostPerMile: number | '' | null
  monthlyMilesTarget: number | '' | null
  targetMarginPerMile: number | '' | null
}
