import { useState } from 'react'
import type { TeamMember } from './types'

interface TeamMemberListProps {
  currentUserId: string
  members: TeamMember[]
  onRemove: (userId: string) => void
  onSetAdmin: (userId: string, isTenantAdmin: boolean) => void
  isMutating: boolean
  theme: 'light' | 'dark'
}

// US-875/877 BR-4/BR-7 + council-review: shared, persona-agnostic member list. Distinguishes
// admin vs. regular members and shows the last-admin protection as an in-context disabled
// state (not a raw error after the fact) — HFD requirement from ADMIN_HFD_RULES.md.
export function TeamMemberList({ currentUserId, members, onRemove, onSetAdmin, isMutating, theme }: TeamMemberListProps) {
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const adminCount = members.filter((m) => m.isTenantAdmin).length
  const isLight = theme === 'light'

  const colors = isLight
    ? { border: '#D8CEB8', text: '#1A1A1A', muted: '#4A5568', surface: '#FFFFFF', accent: '#B08D57' }
    : { border: '#2A2A2A', text: '#F5F5F5', muted: '#808080', surface: '#1A1A1A', accent: '#C9A876' }

  return (
    <div>
      {members.map((member) => {
        const isLastAdmin = member.isTenantAdmin && adminCount <= 1
        return (
          <div
            key={member.id}
            data-testid={`team-member-${member.id}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', marginBottom: 8, borderRadius: 8,
              border: `1px solid ${colors.border}`, background: colors.surface,
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
                {member.firstName} {member.lastName}
                {member.isTenantAdmin && (
                  <span
                    data-testid={`admin-badge-${member.id}`}
                    style={{
                      marginLeft: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      color: colors.accent, border: `1px solid ${colors.accent}`,
                      borderRadius: 4, padding: '1px 6px',
                    }}
                  >
                    Admin
                  </span>
                )}
                {member.id === currentUserId && (
                  <span style={{ marginLeft: 8, fontSize: 12, color: colors.muted }}>(you)</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{member.email}</div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                data-testid={`toggle-admin-${member.id}`}
                disabled={isMutating || (member.isTenantAdmin && isLastAdmin)}
                title={member.isTenantAdmin && isLastAdmin ? 'A tenant must always have at least one admin' : undefined}
                onClick={() => onSetAdmin(member.id, !member.isTenantAdmin)}
                style={{
                  fontSize: 12, padding: '6px 10px', borderRadius: 6,
                  border: `1px solid ${colors.border}`, background: 'transparent', color: colors.text,
                  cursor: member.isTenantAdmin && isLastAdmin ? 'not-allowed' : 'pointer',
                  opacity: member.isTenantAdmin && isLastAdmin ? 0.5 : 1,
                }}
              >
                {member.isTenantAdmin ? 'Revoke admin' : 'Make admin'}
              </button>

              {confirmRemove === member.id ? (
                <>
                  <button
                    data-testid={`confirm-remove-${member.id}`}
                    disabled={isMutating || isLastAdmin}
                    title={isLastAdmin ? 'A tenant must always have at least one admin' : undefined}
                    onClick={() => { onRemove(member.id); setConfirmRemove(null) }}
                    style={{
                      fontSize: 12, padding: '6px 10px', borderRadius: 6, border: 'none',
                      background: '#C0392B', color: '#fff',
                      cursor: isLastAdmin ? 'not-allowed' : 'pointer', opacity: isLastAdmin ? 0.5 : 1,
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmRemove(null)}
                    style={{ fontSize: 12, padding: '6px 10px', borderRadius: 6, border: 'none', background: 'transparent', color: colors.muted, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  data-testid={`remove-member-${member.id}`}
                  disabled={isMutating || isLastAdmin}
                  title={isLastAdmin ? 'A tenant must always have at least one admin' : undefined}
                  onClick={() => setConfirmRemove(member.id)}
                  style={{
                    fontSize: 12, padding: '6px 10px', borderRadius: 6,
                    border: `1px solid ${isLastAdmin ? colors.border : '#C0392B'}`, background: 'transparent',
                    color: isLastAdmin ? colors.muted : '#C0392B',
                    cursor: isLastAdmin ? 'not-allowed' : 'pointer', opacity: isLastAdmin ? 0.5 : 1,
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
