import type { CSSProperties } from 'react'
import { computeRpm, computeMinRpm, computeProfitabilityTier } from '../utils/profitability'
import type { CostProfile } from '../utils/profitability'
import type { LoadSummary } from '../types'

interface TierStyle {
  background: string
  color: string
  border: string
}

const tierStyles: Record<string, TierStyle> = {
  green:   { background: 'rgba(34,197,94,0.12)',  color: '#15803D', border: '1px solid #22C55E' },
  yellow:  { background: 'rgba(245,158,11,0.12)', color: '#B45309', border: '1px solid #F59E0B' },
  red:     { background: 'rgba(239,68,68,0.12)',  color: '#B91C1C', border: '1px solid #EF4444' },
  unknown: { background: '#F1F5F9',               color: '#94A3B8', border: '1px solid #CBD5E1' },
}

const badgeBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: '9999px',
  padding: '2px 8px',
  fontSize: '11px',
  fontWeight: 700,
  whiteSpace: 'nowrap',
}

interface ProfitabilityBadgeProps {
  load: LoadSummary
  costProfile: CostProfile
}

export function ProfitabilityBadge({ load, costProfile }: ProfitabilityBadgeProps) {
  const rpm = computeRpm(load)
  if (rpm == null) return <span style={{ fontSize: '12px', color: '#94A3B8' }}>—</span>

  const minRpm = computeMinRpm(costProfile)
  const tier = computeProfitabilityTier(rpm, minRpm)
  const { background, color, border } = tierStyles[tier]

  return (
    <span
      style={{ ...badgeBase, background, color, border }}
      title={minRpm != null ? `Min RPM: $${minRpm.toFixed(2)}/mi` : 'Set a cost profile to see profitability'}
    >
      ${rpm.toFixed(2)}/mi
    </span>
  )
}
