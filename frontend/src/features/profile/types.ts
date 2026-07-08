import type { EquipmentType } from '@/features/loads/types'
import type { CdlClass } from '@/features/carrier/schemas/carrierProfile.schemas'

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
  equipmentYear: string | null
  equipmentMake: string | null
  equipmentModel: string | null
  licensePlate: string | null
  vin: string | null
  cdlClass: CdlClass | null
  cdlExpiry: string | null
  insuranceCarrier: string | null
  insuranceExpiry: string | null
  medCardExpiry: string | null
  truckPaymentLease: number | null
  insurance: number | null
  iftaIrpPermits: number | null
  phoneEldMisc: number | null
  perDiemDailyRate: number | null
  perDiemDaysPerMonth: number | null
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
  equipmentYear: string
  equipmentMake: string
  equipmentModel: string
  licensePlate: string
  vin: string
  cdlClass: CdlClass | '' | undefined
  cdlExpiry: string
  insuranceCarrier: string
  insuranceExpiry: string
  medCardExpiry: string
  truckPaymentLease: number | '' | null
  insurance: number | '' | null
  iftaIrpPermits: number | '' | null
  phoneEldMisc: number | '' | null
  perDiemDailyRate: number | '' | null
  perDiemDaysPerMonth: number | '' | null
  monthlyFixedCosts: number | '' | null
  fuelCostPerGallon: number | '' | null
  milesPerGallon: number | '' | null
  maintenanceCostPerMile: number | '' | null
  monthlyMilesTarget: number | '' | null
  targetMarginPerMile: number | '' | null
}
