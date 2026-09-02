import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from './api'
import type { OrgSettings } from './types'

// US-875/877/876/878: shared data hook for the Team & Org Settings page — one hook covers
// both personas since the backend already serves both from the same ROLE_TENANT_ADMIN
// capability. Persona-specific rendering happens in the page component, not here.
export function useTeamAdmin() {
  const queryClient = useQueryClient()

  const members = useQuery({ queryKey: ['team', 'members'], queryFn: api.getTeamMembers })
  const joinCode = useQuery({ queryKey: ['team', 'join-code'], queryFn: api.getJoinCode })
  const orgSettings = useQuery({ queryKey: ['team', 'org-settings'], queryFn: api.getOrgSettings })

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['team'] })
  }

  const removeMember = useMutation({
    mutationFn: api.removeMember,
    onSuccess: invalidateAll,
  })

  const setAdminStatus = useMutation({
    mutationFn: ({ userId, isTenantAdmin }: { userId: string; isTenantAdmin: boolean }) =>
      api.setTenantAdminStatus(userId, isTenantAdmin),
    onSuccess: invalidateAll,
  })

  const saveOrgSettings = useMutation({
    mutationFn: (settings: Partial<OrgSettings>) => api.updateOrgSettings(settings),
    onSuccess: invalidateAll,
  })

  return { members, joinCode, orgSettings, removeMember, setAdminStatus, saveOrgSettings }
}
