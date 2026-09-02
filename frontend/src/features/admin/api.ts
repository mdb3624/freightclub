import { apiGet, apiPut, apiDelete, apiPatch, apiPost } from '@/lib/apiClient'
import type {
  TeamMember,
  JoinCode,
  OrgSettings,
  SuperUserDashboard,
  DisputeQueueItem,
  DisputeOutcome,
  PlatformHealth,
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
