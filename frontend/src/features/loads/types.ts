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

export type PaymentTerms = 'QUICK_PAY' | 'NET_7' | 'NET_15' | 'NET_30'

export const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  QUICK_PAY: 'Quick Pay',
  NET_7: 'Net 7',
  NET_15: 'Net 15',
  NET_30: 'Net 30',
}

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
  paymentTerms: PaymentTerms | null
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
  paymentTerms: PaymentTerms | null
  deliveryTo: string
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
  paymentTerms: PaymentTerms | ''
  specialRequirements: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
