import { apiGet, apiPut, apiDelete, apiPatch, apiPost } from '@/lib/apiClient'
import type {
  TeamMember,
  JoinCode,
  OrgSettings,
  SuperUserDashboard,
  DisputeQueueItem,
  DisputeOutcome,
  PlatformHealth,
  AuditLogEntry,
  ActivityEvent,
  AdminRole,
  ProvisioningResult,
  ForcePasswordResetResult,
  ImpersonationStartResult,
} from './types'

// US-875/877: shared team-management endpoints — one client for both personas, since the
// backend serves both from one ROLE_TENANT_ADMIN-gated controller.
export const getTeamMembers = () => apiGet<TeamMember[]>('/team/members')
export const getJoinCode = () => apiGet<JoinCode>('/team/join-code')
export const removeMember = (userId: string) => apiDelete<void>(`/team/members/${userId}`)
export const setTenantAdminStatus = (userId: string, isTenantAdmin: boolean) =>
  apiPatch<void>(`/team/members/${userId}/admin-status`, { isTenantAdmin })

// US-876/878: shared org-settings endpoints.
export const getOrgSettings = () => apiGet<OrgSettings>('/team/org-settings')
export const updateOrgSettings = (settings: Partial<OrgSettings>) =>
  apiPut<void>('/team/org-settings', settings)

// US-750/751/752: Super User (platform-wide) endpoints.
export const getSuperUserDashboard = () => apiGet<SuperUserDashboard>('/super-user/dashboard')
export const getOpenDisputes = () => apiGet<DisputeQueueItem[]>('/super-user/disputes')
export const resolveDispute = (disputeId: string, outcome: DisputeOutcome, reason: string) =>
  apiPost<void>(`/super-user/disputes/${disputeId}/resolve`, { outcome, reason })
export const getPlatformHealth = () => apiGet<PlatformHealth>('/super-user/health')

// US-880: append-only audit trail. targetId filters to one user/tenant's history; omitted
// returns everything.
export const getAuditLog = (targetId?: string) =>
  apiGet<AuditLogEntry[]>('/super-user/audit-log', targetId ? { params: { targetId } } : undefined)

// US-881: suspend/reactivate/force-password-reset a user — each requires a mandatory reason.
export const suspendUser = (userId: string, reason: string) =>
  apiPost<void>(`/super-user/users/${userId}/suspend`, { reason })
export const reactivateUser = (userId: string, reason: string) =>
  apiPost<void>(`/super-user/users/${userId}/reactivate`, { reason })
export const forcePasswordReset = (userId: string, reason: string) =>
  apiPost<ForcePasswordResetResult>(`/super-user/users/${userId}/force-password-reset`, { reason })

// US-882: a user's merged login + audit-target activity.
export const getUserActivity = (userId: string) => apiGet<ActivityEvent[]>(`/super-user/users/${userId}/activity`)

// US-884: tenant-level suspend/reactivate — independent of any individual user's own flag.
export const suspendTenant = (tenantId: string, reason: string) =>
  apiPost<void>(`/super-user/tenants/${tenantId}/suspend`, { reason })
export const reactivateTenant = (tenantId: string, reason: string) =>
  apiPost<void>(`/super-user/tenants/${tenantId}/reactivate`, { reason })

// US-886: create a user in an existing tenant, or a brand-new tenant with its first user.
// Bypasses the join-code flow; the returned setupToken is relayed out-of-band, never a password.
export const createUserInTenant = (params: {
  tenantId: string
  email: string
  firstName: string
  lastName: string
  role: AdminRole
  reason: string
}) => apiPost<ProvisioningResult>('/super-user/users', params)

export const createTenantWithFirstUser = (params: {
  companyName: string
  email: string
  firstName: string
  lastName: string
  role: AdminRole
  reason: string
}) => apiPost<ProvisioningResult>('/super-user/tenants', params)

// US-885: scoped, time-boxed, view-only impersonation. Starting requires re-authenticating
// with the Super User's own current password. apiClient's request interceptor automatically
// prefers the active impersonation token over the normal one (see impersonationStore), so
// endImpersonation below authenticates AS the impersonated session, matching the backend's
// ImpersonationContextHolder-based authorization for that one endpoint.
export const startImpersonation = (params: { targetUserId: string; reason: string; password: string }) =>
  apiPost<ImpersonationStartResult>('/super-user/impersonation/start', params)
export const endImpersonation = (sessionId: string) =>
  apiPost<void>('/super-user/impersonation/end', { sessionId })
