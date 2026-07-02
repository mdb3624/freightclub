import React from 'react'

const STATUS_COLORS = {
  default: 'var(--color-text-primary)',
  green:   'var(--color-success)',
  yellow:  'var(--color-warning)',
  red:     'var(--color-critical)',
  bronze:  'var(--color-bronze)',
}

/**
 * KPI stat card — "Number-First" hierarchy pattern.
 * Large metric up top, uppercase label below.
 */
export function StatCard({
  label,
  value,
  prefix = '',
  suffix = '',
  statusColor = 'default',
  sublabel,
  icon,
  isLoading = false,
  style: extraStyle,
}) {
  const numColor = STATUS_COLORS[statusColor] || STATUS_COLORS.default

  return (
    <div style={{
      background: 'var(--color-surface-white)',
      border: 'var(--border-widget)',
      borderRadius: 'var(--radius-widget)',
      boxShadow: 'var(--shadow-subtle)',
      padding: 'var(--space-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-sm)',
      ...extraStyle,
    }}>
      {icon && (
        <div style={{ color: 'var(--color-text-tertiary)', fontSize: 20, marginBottom: 'var(--space-xs)' }}>
          {icon}
        </div>
      )}
      {isLoading ? (
        <div style={{ height: 64, background: '#F1F5F9', borderRadius: 4, animation: 'fc-pulse 1.5s ease-in-out infinite' }} />
      ) : (
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--font-size-4xl)',
          fontWeight: 'var(--font-weight-heavy)',
          lineHeight: 'var(--line-height-tight)',
          color: numColor,
        }}>
          {prefix}{value ?? '—'}{suffix}
        </div>
      )}
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-semibold)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--letter-spacing-wider)',
        color: 'var(--color-text-tertiary)',
      }}>
        {label}
      </div>
      {sublabel && (
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
        }}>
          {sublabel}
        </div>
      )}
    </div>
  )
}
