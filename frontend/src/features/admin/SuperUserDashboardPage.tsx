import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useLogout } from '@/features/auth/hooks/useLogout'
import * as api from './api'
import type { DisputeOutcome } from './types'

const S = {
  bg: '#0E1116',
  surface: '#161B22',
  border: '#2D333B',
  text: '#E6EDF3',
  dim: '#8B949E',
  accent: '#58A6FF',
  danger: '#F85149',
}

type Tab = 'dashboard' | 'disputes' | 'health'

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
            {(['dashboard', 'disputes', 'health'] as Tab[]).map((t) => (
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
function DashboardTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['super-user', 'dashboard'],
    queryFn: api.getSuperUserDashboard,
    staleTime: 5 * 60 * 1000,
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
          </tr>
        </thead>
        <tbody>
          {data.tenants.map((t) => (
            <tr key={t.name} style={{ borderBottom: `1px solid ${S.border}` }}>
              <td style={{ padding: '6px 8px' }}>{t.name}</td>
              <td style={{ padding: '6px 8px' }}>{t.plan}</td>
              <td style={{ padding: '6px 8px' }}>{t.memberCount}</td>
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

  if (isLoading) return <p style={{ color: S.dim }}>Loading…</p>
  if (!data || data.length === 0) return <p style={{ color: S.dim }}>No open disputes.</p>

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
