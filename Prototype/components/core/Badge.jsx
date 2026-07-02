import React from 'react'

const BADGE_STYLES = {
  default:     { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' },
  success:     { bg: 'var(--color-success-subtle)',  color: 'var(--color-success-text)',  border: 'var(--color-success)' },
  warning:     { bg: 'var(--color-warning-subtle)',  color: 'var(--color-warning-text)',  border: 'var(--color-warning)' },
  error:       { bg: 'var(--color-critical-subtle)', color: 'var(--color-critical-text)', border: 'var(--color-critical)' },
  info:        { bg: 'var(--color-info-subtle)',     color: 'var(--color-info-text)',     border: 'var(--color-info)' },
  bronze:      { bg: 'rgba(176,141,87,0.15)',        color: 'var(--color-bronze)',        border: 'var(--color-bronze)' },
  rpm_high:    { bg: 'rgba(34,197,94,0.12)',         color: '#15803D',                   border: 'var(--color-rpm-high)' },
  rpm_neutral: { bg: 'rgba(245,158,11,0.12)',        color: '#B45309',                   border: 'var(--color-rpm-neutral)' },
  rpm_low:     { bg: 'rgba(239,68,68,0.12)',         color: '#B91C1C',                   border: 'var(--color-rpm-low)' },
}

/**
 * Generic badge/chip — status indicators, tags, counts.
 */
export function Badge({ variant = 'default', size = 'sm', dot = false, children, style: extraStyle }) {
  const s = BADGE_STYLES[variant] || BADGE_STYLES.default

  const sizeStyles = {
    sm: { fontSize: 'var(--font-size-xs)', padding: '2px 8px' },
    md: { fontSize: 'var(--font-size-sm)', padding: '4px 10px' },
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      borderRadius: 'var(--radius-pill)',
      border: `1px solid ${s.border}`,
      background: s.bg,
      color: s.color,
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--font-weight-semibold)',
      letterSpacing: 'var(--letter-spacing-wide)',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      ...sizeStyles[size],
      ...extraStyle,
    }}>
      {dot && (
        <span style={{
          width: 6, height: 6,
          borderRadius: '50%',
          background: s.color,
          flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  )
}
