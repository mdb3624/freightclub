import React from 'react'

const STATUS_CONFIG = {
  DRAFT:      { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1', icon: '✎', label: 'Draft' },
  OPEN:       { bg: '#DBEAFE', color: '#1D4ED8', border: '#3498DB', icon: '●', label: 'Open' },
  CLAIMED:    { bg: '#FEF3C7', color: '#B45309', border: '#F39C12', icon: '⚑', label: 'Claimed' },
  IN_TRANSIT: { bg: '#EDE9FE', color: '#6D28D9', border: '#7C3AED', icon: '▶', label: 'In Transit' },
  DELIVERED:  { bg: '#DCFCE7', color: '#15803D', border: '#27AE60', icon: '✓', label: 'Delivered' },
  SETTLED:    { bg: '#CCFBF1', color: '#0F766E', border: '#14B8A6', icon: '★', label: 'Settled' },
  CANCELLED:  { bg: '#FEE2E2', color: '#B91C1C', border: '#E74C3C', icon: '✕', label: 'Cancelled' },
}

/**
 * Load lifecycle status badge. Maps FreightClub status strings to colored pills.
 */
export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: 'var(--radius-pill)',
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      color: cfg.color,
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--font-size-xs)',
      fontWeight: 'var(--font-weight-semibold)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--letter-spacing-wide)',
      whiteSpace: 'nowrap',
    }}>
      <span aria-hidden="true" style={{ fontSize: 9 }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}
