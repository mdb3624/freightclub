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

// US-880: append-only audit trail for every Super User write action.
export interface AuditLogEntry {
  id: string
  actorUserId: string
  actionType: string
  targetId: string
  reason: string
  createdAt: string
}

// US-882: a user's merged activity — login events (proxied via refresh-token issuance) and
// audit entries where they were the target of a Super User action.
export interface ActivityEvent {
  eventType: string
  description: string
  occurredAt: string
}

export type AdminRole = 'SHIPPER' | 'TRUCKER'

// US-886: the new user's setup token (never a password) — the Super User relays it out-of-band.
export interface ProvisioningResult {
  setupToken: string
}

// US-881: the reset token (never the new password) — relayed out-of-band.
export interface ForcePasswordResetResult {
  resetToken: string
}

// US-885: target summary returned alongside a new impersonation session.
export interface ImpersonationTarget {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export interface ImpersonationStartResult {
  impersonationToken: string
  sessionId: string
  expiresAt: string
  target: ImpersonationTarget
}
