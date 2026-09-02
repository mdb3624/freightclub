import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useTeamAdmin } from './useTeamAdmin'
import { TeamMemberList } from './TeamMemberList'
import { JoinCodeCard } from './JoinCodeCard'
import { OrgSettingsForm } from './OrgSettingsForm'

const C = {
  bg: '#121212',
  surface: '#1A1A1A',
  border: '#2A2A2A',
  text: '#F5F5F5',
  dim: '#808080',
  accent: '#C9A876',
}

// US-877 (Team & Seat Management) + US-878 (Org Settings) — mobile-first, per the
// council-review Buyer persona (a fleet-owner driver working in-cab): a quiet corner reached
// from the Settings tab, never a desktop-shaped console, never competing with the load board.
export function CarrierTeamSettingsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { members, joinCode, orgSettings, removeMember, setAdminStatus, saveOrgSettings } = useTeamAdmin()

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }} data-testid="carrier-team-settings-page">
      <header
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
          borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, background: C.bg, zIndex: 10,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          style={{ background: 'transparent', border: 'none', color: C.text, fontSize: 20, cursor: 'pointer', padding: 4 }}
        >
          ‹
        </button>
        <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Team &amp; Fleet Settings</h1>
      </header>

      <div style={{ padding: 16 }}>
        {joinCode.data && <JoinCodeCard joinCode={joinCode.data.joinCode} theme="dark" />}

        <h2 style={{ fontSize: 13, fontWeight: 700, color: C.dim, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
          Drivers
        </h2>
        {members.isLoading ? (
          <p style={{ color: C.dim }}>Loading…</p>
        ) : members.data ? (
          <TeamMemberList
            currentUserId={user?.id ?? ''}
            members={members.data}
            onRemove={(userId) => removeMember.mutate(userId)}
            onSetAdmin={(userId, isTenantAdmin) => setAdminStatus.mutate({ userId, isTenantAdmin })}
            isMutating={removeMember.isPending || setAdminStatus.isPending}
            theme="dark"
          />
        ) : null}

        <div style={{ marginTop: 24, marginBottom: 24 }}>
          {orgSettings.data && (
            <OrgSettingsForm
              persona="carrier"
              settings={orgSettings.data}
              onSave={(settings) => saveOrgSettings.mutate(settings)}
              isSaving={saveOrgSettings.isPending}
              theme="dark"
            />
          )}
        </div>
      </div>
    </div>
  )
}
