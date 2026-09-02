// US-875/877/876/878/750/751/752: shared frontend types for the admin persona surfaces.

export interface TeamMember {
  id: string
  email: string
  firstName: string
  lastName: string
  isTenantAdmin: boolean
  joinedAt: string
}

export interface JoinCode {
  joinCode: string
}

export interface OrgSettings {
  defaultPickupAddress1?: string | null
  defaultPickupAddress2?: string | null
  defaultPickupCity?: string | null
  defaultPickupState?: string | null
  defaultPickupZip?: string | null
  billingAddress1?: string | null
  billingAddress2?: string | null
  billingCity?: string | null
  billingState?: string | null
  billingZip?: string | null
  fuelCostPerGallon?: number | null
  maintenanceCostPerMile?: number | null
  monthlyFixedCosts?: number | null
  targetMarginPerMile?: number | null
  notifyEmail?: boolean | null
  notifySms?: boolean | null
  notifyInApp?: boolean | null
  memberCount: number
}

export interface SuperUserDashboard {
  tenantCount: number
  userCountByRole: Record<string, number>
  loadCountByStatus: Record<string, number>
  tenants: { id: string; name: string; plan: string; memberCount: number }[]
}

export interface DisputeQueueItem {
  id: string
  loadId: string
  tenantName: string
  raisedByEmail: string
  reason: string
  status: string
  createdAt: string
}

export type DisputeOutcome = 'RESOLVED_SHIPPER_FAVOR' | 'RESOLVED_CARRIER_FAVOR' | 'NO_ACTION_NEEDED'

export interface PlatformHealth {
  backendHealthy: boolean
  totalRequests: number
  errorResponses: number
}
