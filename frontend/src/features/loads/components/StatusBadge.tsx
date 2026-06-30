import type { CSSProperties } from 'react'
import type { LoadStatus } from '../types'

interface StatusStyle {
  background: string
  color: string
  border: string
}

const colorMap: Record<LoadStatus, StatusStyle> = {
  DRAFT:      { background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1' },
  OPEN:       { background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #3498DB' },
  CLAIMED:    { background: '#FEF3C7', color: '#B45309', border: '1px solid #F39C12' },
  IN_TRANSIT: { background: '#EDE9FE', color: '#6D28D9', border: '1px solid #7C3AED' },
  DELIVERED:  { background: '#DCFCE7', color: '#15803D', border: '1px solid #27AE60' },
  SETTLED:    { background: '#CCFBF1', color: '#0F766E', border: '1px solid #14B8A6' },
  CANCELLED:  { background: '#FEE2E2', color: '#B91C1C', border: '1px solid #E74C3C' },
}

const iconMap: Record<LoadStatus, string> = {
  DRAFT:      '✎',
  OPEN:       '●',
  CLAIMED:    '⚑',
  IN_TRANSIT: '▶',
  DELIVERED:  '✓',
  SETTLED:    '★',
  CANCELLED:  '✕',
}

const badgeBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 8px',
  borderRadius: '9999px',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
}

interface StatusBadgeProps {
  status: LoadStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { background, color, border } = colorMap[status]
  return (
    <span style={{ ...badgeBase, background, color, border }}>
      <span aria-hidden="true">{iconMap[status]}</span>
      {status.replace('_', ' ')}
    </span>
  )
}
