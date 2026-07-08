import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useLoadBoard } from '@/features/loads/hooks/useLoadBoard'
import { useMyActiveLoad } from '@/features/loads/hooks/useMyActiveLoad'
import { useMyLoadHistory } from '@/features/loads/hooks/useMyLoadHistory'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { LoadBoardTab } from '@/features/loads/components/LoadBoardTab'
import { HosWidget } from '@/features/hos/components/HosWidget'
import { useDieselPrices } from '@/features/market/hooks/useDieselPrices'
import { computeRpm } from '@/features/loads/utils/profitability'
import { useHosState } from '@/features/hos/hooks/useHosState'
import { useUnreadCount } from '@/features/notifications/hooks/useNotifications'
import type { BoardFilter, BoardSortBy, BoardSortDir, EquipmentType } from '@/features/loads/types'

const VALID_SORT_BY = new Set<BoardSortBy>(['pickupDate', 'distance', 'rpm'])
const VALID_SORT_DIR = new Set<BoardSortDir>(['asc', 'desc'])

function toBoardSortBy(v: string | null): BoardSortBy {
  if (!v || !VALID_SORT_BY.has(v as BoardSortBy)) return 'pickupDate'
  return v as BoardSortBy
}
function toBoardSortDir(v: string | null): BoardSortDir {
  if (!v || !VALID_SORT_DIR.has(v as BoardSortDir)) return 'asc'
  return v as BoardSortDir
}

type Tab = 'board' | 'stats' | 'settings'

/* ─── Styles ────────────────────────────────────────────────────────── */
const C = {
  bg:        '#121212',
  surface:   '#1A1A1A',
  deep:      '#161616',
  border:    '#2A2A2A',
  text:      '#F5F5F5',
  muted:     '#808080',
  dim:       '#636E72',
  accent:    '#C9A876',
  accentDim: 'rgba(201,168,118,.1)',
  green:     '#27AE60',
  amber:     '#F59E0B',
  purple:    '#7C3AED',
}

const PHASE_COLORS: Record<string, string> = {
  CLAIMED:    C.amber,
  IN_TRANSIT: C.purple,
}
const PHASE_LABELS: Record<string, string> = {
  CLAIMED:    'CLAIMED — AWAITING PICKUP',
  IN_TRANSIT: 'IN TRANSIT',
}
const PHASE_NEXT: Record<string, string> = {
  CLAIMED:    'Head to the pickup location and mark the load as picked up when you arrive.',
  IN_TRANSIT: "You're on the road — mark as delivered when you reach the destination.",
}

/* ─── Sub-components ────────────────────────────────────────────────── */
function SecLabel({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '.1em', color: color ?? C.dim, marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

function DarkCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, ...style }}>
      {children}
    </div>
  )
}

function ActiveHero({ load, onView }: { load: any; onView: () => void }) {
  const estimatedTotal =
    load.payRateType === 'PER_MILE' && load.distanceMiles != null
      ? load.payRate * load.distanceMiles
      : null
  const phaseColor = PHASE_COLORS[load.status] ?? C.accent
  const phaseLabel = PHASE_LABELS[load.status] ?? load.status
  const rpm = computeRpm(load)
  const rpmColor = rpm == null ? C.dim : rpm >= 2.0 ? C.green : rpm >= 1.3 ? C.amber : '#EF4444'

  return (
    <div style={{ background: C.surface, padding: 12, borderBottom: `1px solid ${C.border}` }}>
      <SecLabel color={C.accent}>YOUR ACTIVE LOAD</SecLabel>
      <DarkCard style={{ padding: 14, position: 'relative' }}>
        {rpm != null && (
          <div style={{
            position: 'absolute', top: 10, right: 10, width: 52, height: 52, borderRadius: 8,
            background: rpmColor, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, gap: 1,
          }}>
            <span style={{ fontSize: 16 }}>{rpm >= 1.3 ? '✓' : '✕'}</span>
            <span>${rpm.toFixed(2)}</span>
          </div>
        )}
        <div style={{ paddingRight: rpm != null ? 60 : 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: phaseColor, marginBottom: 6 }}>
            {phaseLabel}
          </div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 2 }}>
            {load.originCity}, {load.originState}
          </div>
          <div style={{ fontSize: 13, color: C.accent, marginBottom: 8 }}>
            → {load.destinationCity}, {load.destinationState}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: C.border, borderRadius: 9999, overflow: 'hidden', marginBottom: 4 }}>
          <div style={{
            height: '100%',
            width: load.status === 'CLAIMED' ? '15%' : '55%',
            background: 'linear-gradient(90deg, #C9A46A, #B08D57)',
            borderRadius: 9999,
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.dim, marginBottom: 12 }}>
          <span>{load.originCity}</span>
          {load.distanceMiles != null && <span>{load.distanceMiles.toLocaleString()} mi</span>}
          <span>{load.destinationCity}</span>
        </div>

        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 14,
          padding: '10px 12px', background: C.deep, borderRadius: 6, border: `1px solid ${C.border}` }}>
          {PHASE_NEXT[load.status] ?? 'View your load for details.'}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onView}
            style={{
              flex: 1, height: 48, borderRadius: 8, border: '1px solid #7A5F3A',
              background: 'linear-gradient(180deg,#C9A46A 0%,#B08D57 45%,#8C6D3F 100%)',
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,.28), 0 2px 5px rgba(0,0,0,.35)',
            }}
          >
            View My Load
          </button>
          {load.shipperContact?.phone && (
            <a
              href={`tel:${load.shipperContact.phone}`}
              style={{
                flex: 1, height: 48, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${C.border}`, background: 'transparent', color: C.accent,
                fontSize: 13, fontWeight: 600, textDecoration: 'none', cursor: 'pointer',
              }}
            >
              Contact Shipper
            </a>
          )}
        </div>

        {estimatedTotal != null && (
          <div style={{ marginTop: 10, fontSize: 12, color: C.dim, textAlign: 'center' }}>
            Est. total: <span style={{ color: C.green, fontWeight: 700 }}>
              ${estimatedTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        )}
      </DarkCard>
    </div>
  )
}

function DieselTicker({ dieselRegions }: { dieselRegions: Array<{ label: string; fmt: string; delta: string | null; up: boolean; period?: string }> }) {
  if (dieselRegions.length === 0) return null
  return (
    <div style={{
      background: C.deep, borderBottom: `1px solid ${C.border}`,
      padding: '8px 12px', display: 'flex', gap: 16, overflowX: 'auto',
    }}>
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: C.dim, flexShrink: 0 }}>
        DIESEL
      </span>
      {dieselRegions.map((r) => (
        <span key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, flexShrink: 0 }}>
          <span style={{ color: C.dim }}>{r.label}</span>
          <span style={{ fontWeight: 700, color: C.text }}>{r.fmt}</span>
          {r.delta && (
            <span style={{ fontSize: 10, color: r.up ? '#EF4444' : C.green }}>
              {r.up ? '↑' : '↓'}{r.delta.replace(/^[+-]/, '')}
            </span>
          )}
        </span>
      ))}
    </div>
  )
}

/* ─── Header (CARRIER_DESIGN_SYSTEM.md: fixed 56px, #1A1A1A, logo + HOS + bell + avatar) ── */
function DashboardHeader({ userInitials, onProfile }: { userInitials: string; onProfile: () => void }) {
  const [hos] = useHosState()
  const { data: unread } = useUnreadCount()
  const hoursDriven = parseFloat(hos.hoursDrivenToday) || 0
  const hosSet = hos.hoursDrivenToday !== '' && hos.hoursDrivenToday !== undefined
  const remainingDrive = Math.max(0, 11 - hoursDriven)
  const hosColor = !hosSet ? C.dim : remainingDrive <= 2 ? '#EF4444' : remainingDrive <= 4 ? C.amber : C.green
  const unreadCount = unread?.count ?? 0

  return (
    <header
      data-testid="carrier-header"
      style={{
        height: 56,
        flexShrink: 0,
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        gap: 8,
      }}
    >
      <img src="/logo.png" alt="FreightClub" style={{ height: 36, objectFit: 'contain', flexShrink: 0 }} />

      <div
        data-testid="hos-chip"
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
          background: `${hosColor}26`, border: `1px solid ${hosColor}`, borderRadius: 12,
          fontSize: 11, fontWeight: 700, color: hosColor, flexShrink: 0,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: hosColor, flexShrink: 0 }} />
        {hosSet ? `${remainingDrive.toFixed(1)}h HOS available` : 'HOS not set'}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <button
          data-testid="notification-bell"
          aria-label={unreadCount > 0 ? `${unreadCount} notifications` : 'Notifications'}
          style={{
            width: 48, height: 48, background: 'transparent', border: 'none',
            color: C.text, fontSize: 18, cursor: 'pointer', position: 'relative',
          }}
        >
          🔔
          {unreadCount > 0 && (
            <span aria-hidden="true" style={{
              position: 'absolute', top: 10, right: 10, width: 8, height: 8,
              background: '#E74C3C', borderRadius: '50%',
            }} />
          )}
        </button>
        <button
          data-testid="carrier-avatar"
          onClick={onProfile}
          aria-label="Profile"
          style={{
            width: 48, height: 48, borderRadius: '50%', background: '#B08D57',
            color: '#121212', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
          }}
        >
          {userInitials}
        </button>
      </div>
    </header>
  )
}

function LockedBoardBanner({ load }: { load: any }) {
  return (
    <div style={{ padding: 12 }}>
      <div
        data-testid="board-lock-banner"
        style={{
          background: 'rgba(176,141,87,.08)',
          border: `1px solid ${C.accent}`,
          borderRadius: 8, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 18, flexShrink: 0 }}>🔒</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>Load board locked</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Complete your current load to claim another.</div>
        </div>
      </div>

      {/* Active load card in board tab */}
      <DarkCard style={{ padding: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em',
          color: PHASE_COLORS[load.status] ?? C.accent, marginBottom: 8 }}>
          {PHASE_LABELS[load.status] ?? load.status}
        </div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 2 }}>
          {load.originCity}, {load.originState}
        </div>
        <div style={{ fontSize: 14, color: C.accent, marginBottom: 10 }}>
          → {load.destinationCity}, {load.destinationState}
        </div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginBottom: 14,
          padding: '10px 12px', background: C.deep, borderRadius: 6, border: `1px solid ${C.border}` }}>
          {PHASE_NEXT[load.status] ?? ''}
        </div>
        <Link
          to={`/trucker/loads/${load.id}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 52, borderRadius: 8, border: '1px solid #7A5F3A',
            background: 'linear-gradient(180deg,#C9A46A 0%,#B08D57 45%,#8C6D3F 100%)',
            color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none',
          }}
        >
          {load.status === 'CLAIMED' ? 'Confirm Pickup →' : 'Confirm Delivery →'}
        </Link>
      </DarkCard>
    </div>
  )
}

function MyStatsTab({ profile, history }: { profile: any; history: any }) {
  const onTime = profile?.onTimePercentage
  const totalLoads = history?.totalElements ?? 0
  const historyItems: any[] = history?.content ?? []

  const totalMiles = historyItems.reduce((sum: number, l: any) => sum + (l.distanceMiles ?? 0), 0)
  const rpms = historyItems.map((l: any) => computeRpm(l)).filter((r: number | null): r is number => r != null)
  const avgRpm = rpms.length > 0 ? rpms.reduce((s: number, r: number) => s + r, 0) / rpms.length : null
  const totalEarnings = historyItems.reduce((sum: number, l: any) => {
    if (l.payRateType === 'PER_MILE' && l.distanceMiles != null) return sum + l.payRate * l.distanceMiles
    if (l.payRateType === 'FLAT_RATE') return sum + l.payRate
    return sum
  }, 0)

  return (
    <div style={{ padding: 12 }}>
      {/* Earnings hero */}
      <DarkCard style={{ padding: 20, marginBottom: 12, textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: C.dim, marginBottom: 8 }}>
          TOTAL EARNINGS
        </div>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 40, fontWeight: 900, color: C.green, lineHeight: 1 }}>
          ${totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
        {historyItems.length > 0 && (
          <div style={{ fontSize: 11, color: C.dim, marginTop: 6 }}>last {historyItems.length} loads</div>
        )}
      </DarkCard>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <DarkCard style={{ padding: 14 }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 900,
            color: onTime != null ? (onTime >= 90 ? C.green : onTime >= 75 ? C.amber : '#EF4444') : C.dim,
            marginBottom: 4 }}>
            {onTime != null ? `${onTime.toFixed(0)}%` : '—'}
          </div>
          <SecLabel>ON-TIME RATE</SecLabel>
        </DarkCard>
        <DarkCard style={{ padding: 14 }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 900,
            color: avgRpm != null ? (avgRpm >= 2.0 ? C.green : avgRpm >= 1.3 ? C.amber : '#EF4444') : C.dim,
            marginBottom: 4 }}>
            {avgRpm != null ? `$${avgRpm.toFixed(2)}` : '—'}
          </div>
          <SecLabel>AVG RPM</SecLabel>
        </DarkCard>
        <DarkCard style={{ padding: 14 }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 4 }}>
            {totalLoads}
          </div>
          <SecLabel>LOADS COMPLETED</SecLabel>
        </DarkCard>
        <DarkCard style={{ padding: 14 }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 4 }}>
            {totalMiles > 0 ? totalMiles.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}
          </div>
          <SecLabel>MILES DRIVEN</SecLabel>
        </DarkCard>
      </div>

      {/* Rig card */}
      <DarkCard style={{ padding: 16, marginBottom: 12 }}>
        <SecLabel>MY RIG</SecLabel>
        {profile?.equipmentType ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                {profile.equipmentType.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>Equipment type on file</div>
            </div>
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 9999, fontWeight: 700,
              textTransform: 'uppercase', background: 'rgba(39,174,96,.12)', color: C.green, border: `1px solid ${C.green}`,
            }}>
              Active
            </span>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: C.dim }}>
            No equipment type set.{' '}
            <Link to="/profile" style={{ color: C.accent }}>Update profile →</Link>
          </div>
        )}
        <Link
          to="/profile"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12,
            height: 44, borderRadius: 8, border: `1px solid ${C.border}`,
            background: 'transparent', color: C.accent, fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}
        >
          Edit Equipment
        </Link>
      </DarkCard>

      {/* HOS */}
      <DarkCard style={{ padding: 16 }}>
        <HosWidget />
      </DarkCard>
    </div>
  )
}

function SettingsTab({ onLogout }: { onLogout: () => void }) {
  const items = [
    { icon: '👤', label: 'Profile', sub: 'DOT number, CDL, insurance', to: '/carrier/profile' },
    { icon: '⚙', label: 'Cost Profile', sub: 'Set CPM, fuel & maintenance costs', to: '/carrier/cost-profile' },
    { icon: '💳', label: 'Payments', sub: 'Bank account & payout settings', to: null },
    { icon: '📋', label: 'Load History', sub: 'All completed loads', to: null },
    { icon: '🔔', label: 'Notifications', sub: 'Alerts & email preferences', to: null },
    { icon: '❓', label: 'Support', sub: 'Help center & contact us', to: null },
  ]
  return (
    <div style={{ padding: 12 }}>
      {items.map(({ icon, label, sub, to }) => (
        <div
          key={label}
          onClick={() => { if (to) window.location.href = to }}
          style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
            marginBottom: 8, background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, cursor: to ? 'pointer' : 'default',
          }}
        >
          <span style={{ fontSize: 22, width: 36, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{label}</div>
            <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>{sub}</div>
          </div>
          {to && <span style={{ color: C.accent, fontSize: 16 }}>›</span>}
        </div>
      ))}
      <button
        onClick={onLogout}
        style={{
          width: '100%', height: 48, borderRadius: 8, marginTop: 8,
          border: `1px solid #3A3A3A`, background: 'transparent',
          color: '#EF4444', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}
      >
        Sign out
      </button>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────────────── */
export function TruckerDashboard() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const { data: dieselData } = useDieselPrices()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>('board')
  const [page, setPage] = useState(0)
  const [historyPage] = useState(0)

  const { data: profile } = useProfile()

  const filter: BoardFilter = {
    originState: searchParams.get('origin') ?? undefined,
    destinationState: searchParams.get('dest') ?? undefined,
    equipmentType: ((user?.equipmentType ?? profile?.equipmentType) as EquipmentType) ?? undefined,
    pickupDate: searchParams.get('pickupDate') ?? undefined,
    deliveryDate: searchParams.get('deliveryDate') ?? undefined,
    sortBy: toBoardSortBy(searchParams.get('sortBy')),
    sortDir: toBoardSortDir(searchParams.get('sortDir')),
  }

  const setFilter = useCallback((updater: (prev: BoardFilter) => BoardFilter) => {
    setSearchParams((prev) => {
      const current: BoardFilter = {
        originState: prev.get('origin') ?? undefined,
        destinationState: prev.get('dest') ?? undefined,
        equipmentType: ((user?.equipmentType ?? profile?.equipmentType) as EquipmentType) ?? undefined,
        pickupDate: prev.get('pickupDate') ?? undefined,
        deliveryDate: prev.get('deliveryDate') ?? undefined,
        sortBy: toBoardSortBy(prev.get('sortBy')),
        sortDir: toBoardSortDir(prev.get('sortDir')),
      }
      const next = updater(current)
      const params = new URLSearchParams()
      if (next.originState) params.set('origin', next.originState)
      if (next.destinationState) params.set('dest', next.destinationState)
      if (next.pickupDate) params.set('pickupDate', next.pickupDate)
      if (next.deliveryDate) params.set('deliveryDate', next.deliveryDate)
      if (next.sortBy && next.sortBy !== 'pickupDate') params.set('sortBy', next.sortBy)
      if (next.sortDir && next.sortDir !== 'asc') params.set('sortDir', next.sortDir)
      return params
    }, { replace: true })
    setPage(0)
  }, [setSearchParams, user?.equipmentType, profile?.equipmentType])

  const { data, isLoading, isError } = useLoadBoard(page, filter)
  const { data: activeLoad, isLoading: isLoadingActiveLoad } = useMyActiveLoad()
  const { data: history } = useMyLoadHistory(historyPage)
  const activeLoadRef = useRef<HTMLElement>(null)

  const hasActiveLoad = !isLoadingActiveLoad && !!activeLoad

  useEffect(() => {
    if (location.state?.scrollToActive && activeLoad && activeLoadRef.current) {
      activeLoadRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.state, activeLoad])

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ['board'] })
    queryClient.invalidateQueries({ queryKey: ['my-active-load'] })
    queryClient.invalidateQueries({ queryKey: ['my-load-history'] })
  }

  function handleSort(col: BoardSortBy) {
    setFilter((f) => {
      if (f.sortBy === col) {
        if (f.sortDir === 'asc') return { ...f, sortDir: 'desc' }
        return { ...f, sortBy: 'pickupDate', sortDir: 'asc' }
      }
      return { ...f, sortBy: col, sortDir: 'asc' }
    })
  }

  const dieselRegions = useMemo(() => {
    if (!dieselData?.available) return []
    const fmt = (p: number) => `$${p.toFixed(2)}`
    const delta = (d: number | null | undefined) => d != null ? `${d >= 0 ? '+' : ''}${Math.abs(d).toFixed(2)}` : null
    return [
      { label: 'East',       price: dieselData.eastPrice,    d: dieselData.eastDelta },
      { label: 'Midwest',    price: dieselData.midwestPrice, d: dieselData.midwestDelta },
      { label: 'Gulf',       price: dieselData.southPrice,   d: dieselData.southDelta },
      { label: 'Rocky Mtn',  price: dieselData.rockyPrice,   d: dieselData.rockyDelta },
      { label: 'West',       price: dieselData.westPrice,    d: dieselData.westDelta },
    ].filter(r => r.price != null).map(r => ({
      label: r.label, fmt: fmt(r.price!), delta: delta(r.d), up: (r.d ?? 0) > 0,
    }))
  }, [dieselData])

  const TABS = [
    { id: 'board' as Tab,    icon: '⊞', label: 'Board' },
    { id: 'stats' as Tab,    icon: '📊', label: 'My Stats' },
    { id: 'settings' as Tab, icon: '⚙', label: 'Settings' },
  ]

  const userInitials = ((user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '')).toUpperCase() || 'U'

  return (
    <div
      data-testid="trucker-dashboard"
      data-persona="carrier"
      style={{
        position: 'fixed',
        inset: 0,
        background: C.bg,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
        <DashboardHeader userInitials={userInitials} onProfile={() => navigate('/profile')} />

        {/* Active Load Hero */}
        {activeLoad && (
          <section ref={activeLoadRef as any}>
            <ActiveHero load={activeLoad} onView={() => navigate(`/trucker/loads/${activeLoad.id}`)} />
          </section>
        )}

        {/* Diesel Ticker */}
        <DieselTicker dieselRegions={dieselRegions} />

        {/* Tab content — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {tab === 'board' && (
            hasActiveLoad ? (
              <LockedBoardBanner load={activeLoad} />
            ) : (
              <div style={{ padding: '0 0 12px' }}>
                <LoadBoardTab
                  filter={filter}
                  setPage={setPage}
                  data={data}
                  isLoading={isLoading}
                  isError={isError}
                  onRefresh={handleRefresh}
                  onSort={handleSort}
                  userEquipmentType={(user?.equipmentType ?? profile?.equipmentType) as EquipmentType | undefined}
                />
              </div>
            )
          )}

          {tab === 'stats' && (
            <MyStatsTab profile={profile} history={history} />
          )}

          {tab === 'settings' && (
            <SettingsTab onLogout={logout} />
          )}
        </div>

        {/* Bottom tab bar — fixed style at bottom of the flex column */}
        <nav
          style={{
            display: 'flex',
            background: C.surface,
            borderTop: `1px solid ${C.border}`,
            flexShrink: 0,
          }}
          aria-label="Main navigation"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-selected={tab === t.id}
              role="tab"
              style={{
                flex: 1, height: 48, background: 'transparent', border: 'none',
                color: tab === t.id ? C.text : C.dim,
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--font-body, Inter)',
                textTransform: 'uppercase', letterSpacing: '.05em',
                borderTop: `2px solid ${tab === t.id ? C.accent : 'transparent'}`,
                transition: 'all 150ms',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 3,
              }}
            >
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
    </div>
  )
}
