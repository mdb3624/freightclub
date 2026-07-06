import React from 'react'

const TIER_STYLES = {
  green:   { bg: 'rgba(34,197,94,0.12)',  color: '#15803D', border: 'var(--color-rpm-high)',    label: '●' },
  yellow:  { bg: 'rgba(245,158,11,0.12)', color: '#B45309', border: 'var(--color-rpm-neutral)', label: '◐' },
  red:     { bg: 'rgba(239,68,68,0.12)',  color: '#B91C1C', border: 'var(--color-rpm-low)',     label: '○' },
  unknown: { bg: '#F1F5F9',               color: '#94A3B8', border: '#CBD5E1',                 label: '—' },
}

/**
 * RPM Profitability Badge — shows $/mile with color-coded tier.
 * green ≥ minRpm×1.2, yellow within 20%, red below.
 */
export function ProfitabilityBadge({ rpm, minRpm, style: extraStyle }) {
  let tier = 'unknown'
  if (rpm != null && minRpm != null) {
    if (rpm >= minRpm * 1.2) tier = 'green'
    else if (rpm >= minRpm) tier = 'yellow'
    else tier = 'red'
  } else if (rpm != null) {
    tier = rpm >= 1.5 ? 'green' : rpm >= 1.0 ? 'yellow' : 'red'
  }

  const s = TIER_STYLES[tier]

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      padding: '2px 8px',
      borderRadius: 'var(--radius-pill)',
      background: s.bg,
      border: `1px solid ${s.border}`,
      color: s.color,
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--font-size-xs)',
      fontWeight: 'var(--font-weight-semibold)',
      whiteSpace: 'nowrap',
      ...extraStyle,
    }}>
      <span aria-hidden="true">{s.label}</span>
      {rpm != null ? `$${Number(rpm).toFixed(2)}/mi` : '—'}
    </span>
  )
}
