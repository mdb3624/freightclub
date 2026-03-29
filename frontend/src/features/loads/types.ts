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

export interface LoadContactInfo {
  name: string
  businessName: string | null
  phone: string | null
  email: string
  mcNumber: string | null
  dotNumber: string | null
}

export interface Load {
  id: string
  tenantId: string
  shipperId: string
  truckerId: string | null
  status: LoadStatus
  originCity: string
  originState: string
  originZip: string
  originAddress1: string
  originAddress2: string | null
  destinationCity: string
  destinationState: string
  destinationZip: string
  destinationAddress1: string
  destinationAddress2: string | null
  distanceMiles: number | null
  pickupFrom: string
  pickupTo: string
  deliveryFrom: string
  deliveryTo: string
  commodity: string
  weightLbs: number
  lengthFt: number | null
  widthFt: number | null
  heightFt: number | null
  equipmentType: EquipmentType
  payRate: number
  payRateType: PayRateType
  paymentTerms: PaymentTerms | null
  specialRequirements: string | null
  shipperContact: LoadContactInfo | null
  truckerContact: LoadContactInfo | null
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
  shipperAvgStars: number | null
  shipperRatingCount: number
}

export interface LoadFormValues {
  originCity: string
  originState: string
  originZip: string
  originAddress1: string
  originAddress2: string
  destinationCity: string
  destinationState: string
  destinationZip: string
  destinationAddress1: string
  destinationAddress2: string
  distanceMiles: number | null
  pickupFrom: string
  pickupTo: string
  deliveryFrom: string
  deliveryTo: string
  commodity: string
  weightLbs: number
  lengthFt: number | ''
  lengthIn: number | ''
  widthFt: number | ''
  widthIn: number | ''
  heightFt: number | ''
  heightIn: number | ''
  equipmentType: EquipmentType
  payRate: number
  payRateType: PayRateType
  paymentTerms: PaymentTerms | ''
  specialRequirements: string
  overweightAcknowledged?: boolean
}

export type BoardSortBy = 'pickupDate' | 'distance' | 'rpm'
export type BoardSortDir = 'asc' | 'desc'

export interface BoardFilter {
  originState?: string
  destinationState?: string
  equipmentType?: EquipmentType | ''
  pickupDate?: string
  deliveryDate?: string
  sortBy?: BoardSortBy
  sortDir?: BoardSortDir
}

export interface AvailableStates {
  originStates: string[]
  destinationStates: string[]
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
