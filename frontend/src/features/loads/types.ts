export type LoadStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'CLAIMED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'SETTLED'
  | 'CANCELLED'

export type EquipmentType = 'DRY_VAN' | 'FLATBED' | 'REEFER' | 'STEP_DECK'

export type PayRateType = 'PER_MILE' | 'FLAT_RATE'

export interface Load {
  id: string
  tenantId: string
  shipperId: string
  truckerId: string | null
  status: LoadStatus
  origin: string
  originAddress: string
  originZip: string
  destination: string
  destinationAddress: string
  destinationZip: string
  distanceMiles: number | null
  pickupFrom: string
  pickupTo: string
  deliveryFrom: string
  deliveryTo: string
  commodity: string
  weightLbs: number
  equipmentType: EquipmentType
  payRate: number
  payRateType: PayRateType
  specialRequirements: string | null
  createdAt: string
  updatedAt: string
}

export interface LoadSummary {
  id: string
  status: LoadStatus
  origin: string
  destination: string
  distanceMiles: number | null
  pickupFrom: string
  equipmentType: EquipmentType
  payRate: number
  payRateType: PayRateType
  createdAt: string
}

export interface LoadFormValues {
  origin: string
  originAddress: string
  originZip: string
  destination: string
  destinationAddress: string
  destinationZip: string
  distanceMiles: number | null
  pickupFrom: string
  pickupTo: string
  deliveryFrom: string
  deliveryTo: string
  commodity: string
  weightLbs: number
  equipmentType: EquipmentType
  payRate: number
  payRateType: PayRateType
  specialRequirements: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
