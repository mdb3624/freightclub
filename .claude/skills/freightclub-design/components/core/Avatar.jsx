import React from 'react'

/**
 * Avatar — user initials in a circular badge.
 * Shipper: white bg + bronze ring. Carrier: bronze bg + dark text.
 */
export function Avatar({ firstName = '', lastName = '', size = 'md', persona = 'shipper', style: extraStyle }) {
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '?'

  const sizes = {
    sm: { width: 28, height: 28, fontSize: 10 },
    md: { width: 36, height: 36, fontSize: 13 },
    lg: { width: 48, height: 48, fontSize: 16 },
    xl: { width: 64, height: 64, fontSize: 22 },
  }

  const shipperStyle = {
    background: 'var(--color-surface-white)',
    color: 'var(--color-text-primary)',
    boxShadow: 'var(--shadow-avatar)',
    border: '2px solid var(--color-bronze)',
  }

  const carrierStyle = {
    background: 'var(--color-bronze)',
    color: '#121212',
    border: 'none',
    boxShadow: 'none',
  }

  const sz = sizes[size] || sizes.md

  return (
    <div style={{
      ...sz,
      borderRadius: 'var(--radius-full)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--font-weight-bold)',
      flexShrink: 0,
      userSelect: 'none',
      ...(persona === 'carrier' ? carrierStyle : shipperStyle),
      ...extraStyle,
    }}>
      {initials}
    </div>
  )
}
