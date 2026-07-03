import React from 'react'

/**
 * FreightClub Card — universal widget container.
 * §6.5 spec: white bg, 1px #D0D0D0 border, 8px radius, subtle shadow, 24px padding.
 * Carrier variant flips to dark surface.
 */
export function Card({
  persona = 'shipper',
  padding = 'lg',
  hover = false,
  children,
  style: extraStyle,
  ...props
}) {
  const padMap = { sm: 'var(--space-sm)', md: 'var(--space-md)', lg: 'var(--space-lg)', xl: 'var(--space-xl)', none: 0 }

  const shipperStyle = {
    background: 'var(--color-surface-white)',
    border: 'var(--border-widget)',
    borderRadius: 'var(--radius-widget)',
    boxShadow: 'var(--shadow-subtle)',
    padding: padMap[padding] ?? 'var(--space-lg)',
  }

  const carrierStyle = {
    background: 'var(--carrier-surface)',
    border: '1px solid var(--carrier-border)',
    borderRadius: 'var(--radius-widget)',
    boxShadow: 'none',
    padding: padMap[padding] ?? 'var(--space-lg)',
  }

  return (
    <div
      style={{
        ...(persona === 'carrier' ? carrierStyle : shipperStyle),
        transition: 'box-shadow 200ms ease',
        ...(hover ? { cursor: 'pointer' } : {}),
        ...extraStyle,
      }}
      onMouseEnter={hover ? (e) => { e.currentTarget.style.boxShadow = 'var(--shadow-elevated)' } : undefined}
      onMouseLeave={hover ? (e) => { e.currentTarget.style.boxShadow = persona === 'carrier' ? 'none' : 'var(--shadow-subtle)' } : undefined}
      {...props}
    >
      {children}
    </div>
  )
}
