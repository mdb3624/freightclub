export interface Profile {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  companyName: string | null
  businessName: string | null
  phone: string | null
  billingAddress: string | null
  billingCity: string | null
  billingState: string | null
  billingZip: string | null
  defaultPickupAddress: string | null
  defaultPickupCity: string | null
  defaultPickupState: string | null
  defaultPickupZip: string | null
  notifyEmail: boolean
  notifySms: boolean
  notifyInApp: boolean
}

export interface UpdateProfileValues {
  firstName: string
  lastName: string
  businessName: string
  phone: string
  billingAddress: string
  billingCity: string
  billingState: string
  billingZip: string
  defaultPickupAddress: string
  defaultPickupCity: string
  defaultPickupState: string
  defaultPickupZip: string
  notifyEmail: boolean
  notifySms: boolean
  notifyInApp: boolean
}
