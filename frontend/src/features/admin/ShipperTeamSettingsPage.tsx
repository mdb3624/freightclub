import { ShipperPageLayout } from '@/features/shipper/components/ShipperPageLayout'
import { useAuthStore } from '@/store/authStore'
import { useTeamAdmin } from './useTeamAdmin'
import { TeamMemberList } from './TeamMemberList'
import { JoinCodeCard } from './JoinCodeCard'
import { OrgSettingsForm } from './OrgSettingsForm'

// US-875 (Team & Seat Management) + US-876 (Org Settings) — a contained section inside the
// existing Shipper shell, per the council-review verdict: never a separate admin workflow,
// never inline on the load board/dashboard, reachable only via the header's account menu.
export function ShipperTeamSettingsPage() {
  const user = useAuthStore((s) => s.user)
  const { members, joinCode, orgSettings, removeMember, setAdminStatus, saveOrgSettings } = useTeamAdmin()

  return (
    <ShipperPageLayout>
      <div className="panel" style={{ maxWidth: 720, margin: '0 auto', padding: 24 }} data-testid="shipper-team-settings-page">
        <h1 className="panel-title" style={{ marginBottom: 4 }}>Team &amp; Org Settings</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 24 }}>
          Manage who has access to your account and your organization&apos;s defaults.
        </p>

        {joinCode.data && <JoinCodeCard joinCode={joinCode.data.joinCode} theme="light" />}

        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Team Members</h2>
        {members.isLoading ? (
          <p>Loading…</p>
        ) : members.data ? (
          <TeamMemberList
            currentUserId={user?.id ?? ''}
            members={members.data}
            onRemove={(userId) => removeMember.mutate(userId)}
            onSetAdmin={(userId, isTenantAdmin) => setAdminStatus.mutate({ userId, isTenantAdmin })}
            isMutating={removeMember.isPending || setAdminStatus.isPending}
            theme="light"
          />
        ) : null}

        <div style={{ marginTop: 32 }}>
          {orgSettings.data && (
            <OrgSettingsForm
              persona="shipper"
              settings={orgSettings.data}
              onSave={(settings) => saveOrgSettings.mutate(settings)}
              isSaving={saveOrgSettings.isPending}
              theme="light"
            />
          )}
        </div>
      </div>
    </ShipperPageLayout>
  )
}
