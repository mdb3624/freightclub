import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LoadSummary, BoardSortBy, BoardSortDir } from '../types'
import { computeRpm } from '../utils/profitability'

interface LoadBoardTableProps {
  loads: LoadSummary[]
  sortBy?: BoardSortBy
  sortDir?: BoardSortDir
  onSort?: (col: BoardSortBy) => void
}

function rpmColor(rpm: number | null): string {
  if (rpm == null) return '#636E72'
  if (rpm >= 2.0) return '#22C55E'
  if (rpm >= 1.3) return '#F59E0B'
  return '#EF4444'
}

function rpmBg(rpm: number | null): string {
  if (rpm == null) return 'transparent'
  if (rpm >= 2.0) return 'rgba(34,197,94,.12)'
  if (rpm >= 1.3) return 'rgba(245,158,11,.12)'
  return 'rgba(239,68,68,.12)'
}

function rpmBorder(rpm: number | null): string {
  if (rpm == null) return '#3A3A3A'
  if (rpm >= 2.0) return '#22C55E'
  if (rpm >= 1.3) return '#F59E0B'
  return '#EF4444'
}

// US-854: human-readable labels for EIA's 5 diesel price regions.
const EIA_REGION_LABELS: Record<string, string> = {
  EAST: 'East Coast',
  MIDWEST: 'Midwest',
  SOUTH: 'Gulf Coast',
  ROCKY: 'Rocky Mountain',
  WEST: 'West Coast',
}

function formatShortDate(isoDate: string): string {
  // isoDate is a plain YYYY-MM-DD string (EIA's period field) -- parse and
  // format in UTC so the displayed date doesn't shift a day in negative-UTC
  // timezones.
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function LoadBoardTable({ loads, sortBy, sortDir, onSort }: LoadBoardTableProps) {
  const navigate = useNavigate()

  const sortedLoads = useMemo(() => {
    if (sortBy !== 'rpm') return loads
    const withRpm = loads.map((l) => ({ load: l, rpm: computeRpm(l) }))
    withRpm.sort((a, b) => {
      if (a.rpm == null && b.rpm == null) return 0
      if (a.rpm == null) return 1
      if (b.rpm == null) return -1
      return sortDir === 'asc' ? a.rpm - b.rpm : b.rpm - a.rpm
    })
    return withRpm.map((x) => x.load)
  }, [loads, sortBy, sortDir])

  // Sort controls
  function SortBtn({ col, label }: { col: BoardSortBy; label: string }) {
    const active = sortBy === col
    const icon = active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''
    return (
      <button
        onClick={() => onSort?.(col)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em',
          color: active ? '#C9A876' : '#636E72',
        }}
      >
        {label}{icon}
      </button>
    )
  }

  if (sortedLoads.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '32px 0',
        color: '#636E72', fontSize: 13,
      }}>
        No loads match your filters.
      </div>
    )
  }

  return (
    <div>
      {/* Sort controls row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 8, paddingLeft: 2 }}>
        <SortBtn col="pickupDate" label="Pickup" />
        <SortBtn col="distance" label="Distance" />
        <SortBtn col="rpm" label="RPM" />
      </div>

      {sortedLoads.map((load) => {
        const rpm = computeRpm(load)
        const estimatedTotal =
          load.payRateType === 'PER_MILE' && load.distanceMiles != null
            ? load.payRate * load.distanceMiles
            : null

        const cardStyle: React.CSSProperties = {
          background: '#1A1A1A',
          border: '1px solid #2A2A2A',
          borderRadius: 8,
          padding: 14,
          marginBottom: 8,
          cursor: 'pointer',
          transition: 'border-color 150ms, transform 80ms',
        }

        return (
          <div
            key={load.id}
            style={cardStyle}
            onClick={() => navigate(`/trucker/loads/${load.id}`)}
            role="button"
            aria-label={`Load: ${load.origin} to ${load.destination}`}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#C9A876' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2A2A2A' }}
            onMouseDown={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(.99)' }}
            onMouseUp={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
          >
            {/* Route + RPM badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 14, fontWeight: 700, color: '#F5F5F5' }}>
                  {load.origin}
                </div>
                <div style={{ fontSize: 12, color: '#C9A876', marginTop: 2 }}>
                  → {load.destination}
                </div>
              </div>
              {rpm != null && (
                <span style={{
                  padding: '3px 10px',
                  background: rpmBg(rpm),
                  border: `1px solid ${rpmBorder(rpm)}`,
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: 700,
                  color: rpmColor(rpm),
                  flexShrink: 0,
                }}>
                  ${rpm.toFixed(2)}/mi
                </span>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: '#2A2A2A', marginBottom: 8 }} />

            {/* Metadata row */}
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#808080', flexWrap: 'wrap' }}>
              {load.distanceMiles != null && <span>{load.distanceMiles.toLocaleString()} mi</span>}
              <span>
                ${load.payRate.toLocaleString()}
                {load.payRateType === 'PER_MILE' ? '/mi' : ' flat'}
                {estimatedTotal != null && ` · ≈$${estimatedTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              </span>
              <span>{load.equipmentType.replace(/_/g, ' ')}</span>
              <span>Pickup {new Date(load.pickupFrom).toLocaleDateString()}</span>
              {load.regionUsed != null && (
                <span style={{ color: load.isFallback ? '#F59E0B' : '#808080' }}>
                  {load.isFallback
                    ? '⛽ Est. (home region)'
                    : `⛽ Diesel: ${EIA_REGION_LABELS[load.regionUsed] ?? load.regionUsed}${
                        load.asOfPeriod != null ? ` (as of ${formatShortDate(load.asOfPeriod)})` : ''
                      }`}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
