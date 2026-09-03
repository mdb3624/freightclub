import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { useImpersonationStore } from '@/store/impersonationStore'
import * as api from './api'
import type { DisputeOutcome } from './types'

// "Ops Dark" — Super User's own locked system (formalized via /council-review, 2026-09-02;
// see docs/standards/ADMIN_DESIGN_SYSTEM.md). Distinct from both Shipper (light, customer-
// facing) and Carrier (dark, sunlight-glare-driven): this dashboard is dense cross-tenant
// tabular/log data reviewed in long monitoring sessions, and its red/amber/green alert states
// (dispute urgency, live health) need to read unambiguously — that's the job dark serves here,
// not glare. Accent uses FreightClub's own bronze/copper (matching Shipper/Carrier) instead of
// a borrowed GitHub-blue, so this reads as this platform's tool, not a generic dev-console skin.
const S = {
  bg: '#0E1116',
  surface: '#161B22',
  border: '#2D333B',
  text: '#E6EDF3',
  dim: '#8B949E',
  accent: '#C9A876',
  danger: '#F85149',
}

type Tab = 'dashboard' | 'users' | 'create' | 'audit' | 'disputes' | 'health'

// US-750/751/752: Super User's own shell. Genuinely new — no existing persona to inherit
// from (unlike Shipper/Carrier Admin, which live inside their existing personas). Cross-tenant
// scope is made visually unmistakable (dark ops-tool palette distinct from both Shipper cream
// and Carrier's own dark theme) so it can never be confused with a tenant's own view.
export function SuperUserDashboardPage() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const logout = useLogout()

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: `1px solid ${S.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>FreightClub — Super User</h1>
          <nav style={{ display: 'flex', gap: 4 }}>
            {(['dashboard', 'users', 'create', 'audit', 'disputes', 'health'] as Tab[]).map((t) => (
              <button
                key={t}
                data-testid={`super-user-tab-${t}`}
                onClick={() => setTab(t)}
                style={{
                  padding: '8px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
                  background: tab === t ? S.accent : 'transparent',
                  color: tab === t ? S.bg : S.dim,
                }}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={logout} style={{ background: 'transparent', border: `1px solid ${S.border}`, color: S.dim, borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
          Sign out
        </button>
      </header>

      <main style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
        {tab === 'dashboard' && <DashboardTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'create' && <CreateUserTab />}
        {tab === 'audit' && <AuditLogTab />}
        {tab === 'disputes' && <DisputesTab />}
        {tab === 'health' && <HealthTab />}
      </main>
    </div>
  )
}

function Tile({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16, minWidth: 140 }}>
      <div style={{ fontSize: 11, color: S.dim, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  )
}

// US-750: read-only dashboard, 5-minute cache TTL server-side (react-query staleTime matches).
// US-884: suspend/reactivate a tenant directly from its row — the dashboard's own tenant list
// already carries the tenant ids this action needs, so no separate lookup surface is required.
function DashboardTab() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['super-user', 'dashboard'],
    queryFn: api.getSuperUserDashboard,
    staleTime: 5 * 60 * 1000,
  })
  const [actingOnTenantId, setActingOnTenantId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<'suspend' | 'reactivate' | null>(null)
  const [reason, setReason] = useState('')

  const suspend = useMutation({
    mutationFn: (tenantId: string) => api.suspendTenant(tenantId, reason),
    onSuccess: () => {
      setActingOnTenantId(null)
      setReason('')
      queryClient.invalidateQueries({ queryKey: ['super-user', 'dashboard'] })
    },
  })
  const reactivate = useMutation({
    mutationFn: (tenantId: string) => api.reactivateTenant(tenantId, reason),
    onSuccess: () => {
      setActingOnTenantId(null)
      setReason('')
      queryClient.invalidateQueries({ queryKey: ['super-user', 'dashboard'] })
    },
  })

  if (isLoading || !data) return <p style={{ color: S.dim }}>Loading…</p>

  return (
    <div data-testid="super-user-dashboard">
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <Tile label="Tenants" value={data.tenantCount} />
        {Object.entries(data.userCountByRole).map(([role, count]) => (
          <Tile key={role} label={`${role} users`} value={count} />
        ))}
        {Object.entries(data.loadCountByStatus).map(([status, count]) => (
          <Tile key={status} label={`Loads: ${status}`} value={count} />
        ))}
      </div>

      <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Tenants</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: 'left', color: S.dim, borderBottom: `1px solid ${S.border}` }}>
            <th style={{ padding: '6px 8px' }}>Name</th>
            <th style={{ padding: '6px 8px' }}>Plan</th>
            <th style={{ padding: '6px 8px' }}>Members</th>
            <th style={{ padding: '6px 8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.tenants.map((t) => (
            <tr key={t.id} style={{ borderBottom: `1px solid ${S.border}` }}>
              <td style={{ padding: '6px 8px' }}>{t.name}</td>
              <td style={{ padding: '6px 8px' }}>{t.plan}</td>
              <td style={{ padding: '6px 8px' }}>{t.memberCount}</td>
              <td style={{ padding: '6px 8px' }}>
                {actingOnTenantId === t.id ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                      aria-label={`Reason for ${t.name}`}
                      data-testid={`tenant-reason-${t.id}`}
                      placeholder="Reason (required)"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      style={{ padding: 4, borderRadius: 4, border: `1px solid ${S.border}`, background: S.bg, color: S.text, fontSize: 12, width: 160 }}
                    />
                    <button
                      data-testid={`tenant-confirm-${t.id}`}
                      disabled={reason.trim().length === 0 || suspend.isPending || reactivate.isPending}
                      onClick={() => (pendingAction === 'suspend' ? suspend.mutate(t.id) : reactivate.mutate(t.id))}
                      style={{ padding: '4px 10px', borderRadius: 4, border: 'none', background: S.accent, color: S.bg, fontWeight: 700, fontSize: 12, cursor: 'pointer', opacity: reason.trim().length === 0 ? 0.5 : 1 }}
                    >
                      Confirm
                    </button>
                    <button onClick={() => { setActingOnTenantId(null); setReason('') }} style={{ padding: '4px 10px', borderRadius: 4, border: 'none', background: 'transparent', color: S.dim, fontSize: 12, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      data-testid={`tenant-suspend-${t.id}`}
                      onClick={() => { setActingOnTenantId(t.id); setPendingAction('suspend') }}
                      style={{ padding: '4px 10px', borderRadius: 4, border: `1px solid ${S.danger}`, background: 'transparent', color: S.danger, fontSize: 12, cursor: 'pointer' }}
                    >
                      Suspend
                    </button>
                    <button
                      data-testid={`tenant-reactivate-${t.id}`}
                      onClick={() => { setActingOnTenantId(t.id); setPendingAction('reactivate') }}
                      style={{ padding: '4px 10px', borderRadius: 4, border: `1px solid ${S.accent}`, background: 'transparent', color: S.accent, fontSize: 12, cursor: 'pointer' }}
                    >
                      Reactivate
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// US-751: forced-reason resolution — the resolve action cannot commit without both an
// outcome and a non-empty reason (AC-3/BR-3).
function DisputesTab() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['super-user', 'disputes'], queryFn: api.getOpenDisputes })
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<DisputeOutcome>('NO_ACTION_NEEDED')
  const [reason, setReason] = useState('')

  const resolve = useMutation({
    mutationFn: () => api.resolveDispute(resolvingId!, outcome, reason),
    onSuccess: () => {
      setResolvingId(null)
      setReason('')
      queryClient.invalidateQueries({ queryKey: ['super-user', 'disputes'] })
    },
  })

  if (isLoading) return <p data-testid="super-user-disputes" style={{ color: S.dim }}>Loading…</p>
  if (!data || data.length === 0) return <p data-testid="super-user-disputes" style={{ color: S.dim }}>No open disputes.</p>

  return (
    <div data-testid="super-user-disputes">
      {data.map((d) => (
        <div key={d.id} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{d.tenantName} — Load {d.loadId}</div>
          <div style={{ fontSize: 12, color: S.dim, marginTop: 4 }}>Raised by {d.raisedByEmail}</div>
          <p style={{ fontSize: 13, marginTop: 8 }}>{d.reason}</p>

          {resolvingId === d.id ? (
            <div style={{ marginTop: 12 }}>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as DisputeOutcome)}
                style={{ marginBottom: 8, padding: 6, borderRadius: 6, border: `1px solid ${S.border}`, background: S.bg, color: S.text, width: '100%' }}
              >
                <option value="RESOLVED_SHIPPER_FAVOR">Resolved — Shipper favor</option>
                <option value="RESOLVED_CARRIER_FAVOR">Resolved — Carrier favor</option>
                <option value="NO_ACTION_NEEDED">No action needed</option>
              </select>
              <textarea
                data-testid="resolve-reason-input"
                placeholder="Reason (required)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ width: '100%', minHeight: 60, padding: 8, borderRadius: 6, border: `1px solid ${S.border}`, background: S.bg, color: S.text, marginBottom: 8 }}
              />
              <button
                data-testid="confirm-resolve"
                disabled={reason.trim().length === 0 || resolve.isPending}
                onClick={() => resolve.mutate()}
                style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: S.accent, color: S.bg, fontWeight: 700, cursor: 'pointer', opacity: reason.trim().length === 0 ? 0.5 : 1 }}
              >
                Resolve
              </button>
              <button onClick={() => setResolvingId(null)} style={{ marginLeft: 8, padding: '8px 14px', borderRadius: 6, border: 'none', background: 'transparent', color: S.dim, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          ) : (
            <button
              data-testid={`resolve-dispute-${d.id}`}
              onClick={() => setResolvingId(d.id)}
              style={{ marginTop: 12, padding: '8px 14px', borderRadius: 6, border: `1px solid ${S.accent}`, background: 'transparent', color: S.accent, cursor: 'pointer', fontSize: 13 }}
            >
              Resolve
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

const inputStyle = { padding: 8, borderRadius: 6, border: `1px solid ${S.border}`, background: S.bg, color: S.text, fontSize: 13, width: '100%', marginBottom: 8 }
const primaryBtnStyle = { padding: '8px 14px', borderRadius: 6, border: 'none', background: S.accent, color: S.bg, fontWeight: 700, cursor: 'pointer', fontSize: 13 }
const dangerBtnStyle = { padding: '8px 14px', borderRadius: 6, border: `1px solid ${S.danger}`, background: 'transparent', color: S.danger, fontWeight: 700, cursor: 'pointer', fontSize: 13 }
const secondaryBtnStyle = { padding: '8px 14px', borderRadius: 6, border: `1px solid ${S.accent}`, background: 'transparent', color: S.accent, fontWeight: 700, cursor: 'pointer', fontSize: 13 }

function TokenBox({ label, token }: { label: string; token: string }) {
  return (
    <div style={{ background: S.bg, border: `1px solid ${S.accent}`, borderRadius: 6, padding: 12, marginTop: 12 }}>
      <div style={{ fontSize: 11, color: S.dim, textTransform: 'uppercase', marginBottom: 4 }}>{label} — relay out-of-band, never share as a password</div>
      <code data-testid="issued-token" style={{ fontSize: 12, wordBreak: 'break-all', color: S.text }}>{token}</code>
    </div>
  )
}

// US-881/882/885: a target user's id is entered directly (e.g. from a support ticket) — the
// Super User dashboard is deliberately not a user browser/search surface (US-750 BR-2), so
// this mirrors the API's own shape (every action is keyed by userId, not email/search).
function UsersTab() {
  const [userId, setUserId] = useState('')
  const [reason, setReason] = useState('')
  const [password, setPassword] = useState('')
  const [activity, setActivity] = useState<import('./types').ActivityEvent[] | null>(null)
  const [issuedToken, setIssuedToken] = useState<{ label: string; token: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const impersonation = useImpersonationStore()

  const suspend = useMutation({ mutationFn: () => api.suspendUser(userId, reason) })
  const reactivate = useMutation({ mutationFn: () => api.reactivateUser(userId, reason) })
  const forceReset = useMutation({
    mutationFn: () => api.forcePasswordReset(userId, reason),
    onSuccess: (res) => setIssuedToken({ label: 'Password reset token', token: res.resetToken }),
  })
  const loadActivity = useMutation({
    mutationFn: () => api.getUserActivity(userId),
    onSuccess: (res) => setActivity(res),
  })
  const startImpersonation = useMutation({
    mutationFn: () => api.startImpersonation({ targetUserId: userId, reason, password }),
    onSuccess: (res) => {
      impersonation.start({ token: res.impersonationToken, sessionId: res.sessionId, expiresAt: res.expiresAt, target: res.target })
      window.location.href = '/'
    },
    onError: (e: unknown) => setError(e instanceof Error ? e.message : 'Failed to start impersonation'),
  })

  const idReady = userId.trim().length > 0
  const reasonReady = reason.trim().length > 0
  const busy = suspend.isPending || reactivate.isPending || forceReset.isPending || startImpersonation.isPending

  return (
    <div data-testid="super-user-users">
      <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Manage a user</h2>
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16, maxWidth: 480 }}>
        <input aria-label="Target user ID" data-testid="user-id-input" placeholder="Target user ID" value={userId} onChange={(e) => setUserId(e.target.value)} style={inputStyle} />
        <input aria-label="Reason" data-testid="user-reason-input" placeholder="Reason (required for suspend/reactivate/reset/impersonate)" value={reason} onChange={(e) => setReason(e.target.value)} style={inputStyle} />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <button data-testid="suspend-user-btn" disabled={!idReady || !reasonReady || busy} onClick={() => suspend.mutate()} style={{ ...dangerBtnStyle, opacity: !idReady || !reasonReady ? 0.5 : 1 }}>Suspend</button>
          <button data-testid="reactivate-user-btn" disabled={!idReady || !reasonReady || busy} onClick={() => reactivate.mutate()} style={{ ...secondaryBtnStyle, opacity: !idReady || !reasonReady ? 0.5 : 1 }}>Reactivate</button>
          <button data-testid="force-reset-btn" disabled={!idReady || !reasonReady || busy} onClick={() => forceReset.mutate()} style={{ ...secondaryBtnStyle, opacity: !idReady || !reasonReady ? 0.5 : 1 }}>Force password reset</button>
          <button data-testid="view-activity-btn" disabled={!idReady || busy} onClick={() => loadActivity.mutate()} style={{ ...secondaryBtnStyle, opacity: !idReady ? 0.5 : 1 }}>View activity</button>
        </div>

        {(suspend.isSuccess || reactivate.isSuccess) && (
          <p style={{ color: '#3FB950', fontSize: 12, marginBottom: 8 }}>Action completed.</p>
        )}
        {issuedToken && <TokenBox label={issuedToken.label} token={issuedToken.token} />}

        <hr style={{ border: 'none', borderTop: `1px solid ${S.border}`, margin: '12px 0' }} />

        <h3 style={{ fontSize: 12, fontWeight: 700, color: S.dim, textTransform: 'uppercase', marginBottom: 8 }}>
          Impersonate (view-only, 15 min, requires re-authentication)
        </h3>
        <input
          aria-label="Your own password (re-authentication)"
          autoComplete="current-password"
          data-testid="reauth-password-input"
          type="password"
          placeholder="Your own password (re-authentication)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        <button
          data-testid="start-impersonation-btn"
          disabled={!idReady || !reasonReady || password.trim().length === 0 || busy}
          onClick={() => startImpersonation.mutate()}
          style={{ ...primaryBtnStyle, opacity: !idReady || !reasonReady || password.trim().length === 0 ? 0.5 : 1 }}
        >
          Start impersonation
        </button>
        {error && <p style={{ color: S.danger, fontSize: 12, marginTop: 8 }}>{error}</p>}
      </div>

      {activity && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Activity</h3>
          {activity.length === 0 ? (
            <p style={{ color: S.dim, fontSize: 13 }}>No activity recorded.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: S.dim, borderBottom: `1px solid ${S.border}` }}>
                  <th style={{ padding: '6px 8px' }}>Event</th>
                  <th style={{ padding: '6px 8px' }}>Description</th>
                  <th style={{ padding: '6px 8px' }}>When</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((a, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${S.border}` }}>
                    <td style={{ padding: '6px 8px' }}>{a.eventType}</td>
                    <td style={{ padding: '6px 8px' }}>{a.description}</td>
                    <td style={{ padding: '6px 8px', color: S.dim }}>{new Date(a.occurredAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

// US-886: two creation paths sharing one form shell — add-to-existing-tenant vs
// create-new-tenant, differing only in whether tenantId or companyName is supplied.
function CreateUserTab() {
  const [mode, setMode] = useState<'existing' | 'new'>('existing')
  const [tenantId, setTenantId] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<'SHIPPER' | 'TRUCKER'>('SHIPPER')
  const [reason, setReason] = useState('')

  const createExisting = useMutation({
    mutationFn: () => api.createUserInTenant({ tenantId, email, firstName, lastName, role, reason }),
  })
  const createNew = useMutation({
    mutationFn: () => api.createTenantWithFirstUser({ companyName, email, firstName, lastName, role, reason }),
  })

  const active = mode === 'existing' ? createExisting : createNew
  const ready =
    email.trim().length > 0 &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    reason.trim().length > 0 &&
    (mode === 'existing' ? tenantId.trim().length > 0 : companyName.trim().length > 0)

  return (
    <div data-testid="super-user-create">
      <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Create a user</h2>
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16, maxWidth: 480 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button
            data-testid="create-mode-existing"
            onClick={() => setMode('existing')}
            style={mode === 'existing' ? primaryBtnStyle : secondaryBtnStyle}
          >
            Add to existing tenant
          </button>
          <button
            data-testid="create-mode-new"
            onClick={() => setMode('new')}
            style={mode === 'new' ? primaryBtnStyle : secondaryBtnStyle}
          >
            Create new tenant
          </button>
        </div>

        {/* Field order matches this app's own established RegisterForm convention (company/tenant
            → who → contact → role) — name comes before email, not after, per
            HUMAN_FACTORS_DESIGNER.md's Information Architecture Rule 3 (natural sequence) and
            consistency with existing patterns. */}
        {mode === 'existing' ? (
          <input aria-label="Existing tenant ID" data-testid="create-tenant-id-input" placeholder="Existing tenant ID" value={tenantId} onChange={(e) => setTenantId(e.target.value)} style={inputStyle} />
        ) : (
          <input aria-label="New company name" data-testid="create-company-name-input" placeholder="New company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={inputStyle} />
        )}
        <input aria-label="First name" data-testid="create-first-name-input" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
        <input aria-label="Last name" data-testid="create-last-name-input" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
        <input aria-label="Email" data-testid="create-email-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        <select aria-label="Role" data-testid="create-role-select" value={role} onChange={(e) => setRole(e.target.value as 'SHIPPER' | 'TRUCKER')} style={inputStyle}>
          <option value="SHIPPER">Shipper</option>
          <option value="TRUCKER">Trucker</option>
        </select>
        <input aria-label="Reason (required)" data-testid="create-reason-input" placeholder="Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} style={inputStyle} />

        <button data-testid="create-submit-btn" disabled={!ready || active.isPending} onClick={() => active.mutate()} style={{ ...primaryBtnStyle, opacity: !ready ? 0.5 : 1 }}>
          Create
        </button>

        {active.isSuccess && active.data && <TokenBox label="Setup token" token={active.data.setupToken} />}
        {active.isError && <p style={{ color: S.danger, fontSize: 12, marginTop: 8 }}>Failed to create user — check the details and try again.</p>}
      </div>
    </div>
  )
}

// US-880: read-only view onto the append-only audit trail. Optional targetId filter mirrors
// the backend's own query param.
function AuditLogTab() {
  const [targetId, setTargetId] = useState('')
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['super-user', 'audit-log', targetId],
    queryFn: () => api.getAuditLog(targetId.trim() || undefined),
  })

  return (
    <div data-testid="super-user-audit">
      <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Audit log</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, maxWidth: 480 }}>
        <input
          aria-label="Filter by target ID"
          data-testid="audit-target-filter"
          placeholder="Filter by target ID (optional)"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          style={{ ...inputStyle, marginBottom: 0 }}
        />
        <button data-testid="audit-refresh-btn" onClick={() => refetch()} style={secondaryBtnStyle}>Refresh</button>
      </div>

      {isLoading ? (
        <p style={{ color: S.dim }}>Loading…</p>
      ) : !data || data.length === 0 ? (
        <p style={{ color: S.dim }}>No audit entries.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: S.dim, borderBottom: `1px solid ${S.border}` }}>
              <th style={{ padding: '6px 8px' }}>Action</th>
              <th style={{ padding: '6px 8px' }}>Target</th>
              <th style={{ padding: '6px 8px' }}>Actor</th>
              <th style={{ padding: '6px 8px' }}>Reason</th>
              <th style={{ padding: '6px 8px' }}>When</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => (
              <tr key={entry.id} style={{ borderBottom: `1px solid ${S.border}` }}>
                <td style={{ padding: '6px 8px' }}>{entry.actionType}</td>
                <td style={{ padding: '6px 8px', color: S.dim }}>{entry.targetId}</td>
                <td style={{ padding: '6px 8px', color: S.dim }}>{entry.actorUserId}</td>
                <td style={{ padding: '6px 8px' }}>{entry.reason}</td>
                <td style={{ padding: '6px 8px', color: S.dim }}>{new Date(entry.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// US-752: 10s live-updating signal (AC-3) — no full-page reload/flash, refetchInterval only.
function HealthTab() {
  const { data } = useQuery({
    queryKey: ['super-user', 'health'],
    queryFn: api.getPlatformHealth,
    refetchInterval: 10_000,
  })

  return (
    <div data-testid="super-user-health" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16, minWidth: 200 }}>
        <div style={{ fontSize: 11, color: S.dim, textTransform: 'uppercase' }}>Backend</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: data?.backendHealthy ? '#3FB950' : S.danger }}>
          {data ? (data.backendHealthy ? 'Healthy' : 'Unhealthy') : 'Checking…'}
        </div>
      </div>
      <Tile label="Total Requests" value={data?.totalRequests ?? '—'} />
      <Tile label="Error Responses" value={data?.errorResponses ?? '—'} />
    </div>
  )
}
