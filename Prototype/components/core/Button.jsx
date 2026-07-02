import React from 'react'

const bronzeGradient = 'linear-gradient(180deg, var(--color-bronze-light) 0%, var(--color-bronze) 45%, var(--color-bronze-dark) 100%)'

/**
 * FreightClub Button — persona-aware CTA.
 * Shipper + Carrier both use the bronze gradient as primary.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  persona = 'shipper',
  isLoading = false,
  disabled = false,
  children,
  onClick,
  type = 'button',
  style: extraStyle,
  ...props
}) {
  const isDisabled = disabled || isLoading

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--font-weight-medium)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    transition: 'all 150ms ease-in-out',
    border: 'none',
    outline: 'none',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  }

  const sizes = {
    sm: { padding: '4px 12px', fontSize: 'var(--font-size-sm)',  borderRadius: 'var(--radius-button)', minHeight: '28px' },
    md: { padding: '8px 16px', fontSize: 'var(--font-size-base)', borderRadius: 'var(--radius-button)', minHeight: '36px' },
    lg: { padding: '12px 24px', fontSize: 'var(--font-size-lg)', borderRadius: 'var(--radius-button)', minHeight: '48px' },
  }

  const variants = {
    primary: {
      background: bronzeGradient,
      boxShadow: 'var(--shadow-btn)',
      border: '1px solid var(--color-bronze-border)',
      color: '#FFFFFF',
    },
    secondary: {
      background: persona === 'carrier' ? 'transparent' : '#FFFFFF',
      border: persona === 'carrier'
        ? '1px solid var(--carrier-border-glow)'
        : '1px solid var(--color-border-primary)',
      color: persona === 'carrier' ? 'var(--carrier-text)' : 'var(--color-text-primary)',
      boxShadow: 'none',
    },
    ghost: {
      background: 'transparent',
      border: '1px solid transparent',
      color: persona === 'carrier' ? 'var(--carrier-text-muted)' : 'var(--color-text-secondary)',
      boxShadow: 'none',
    },
    danger: {
      background: 'var(--color-critical)',
      border: '1px solid var(--color-critical-text)',
      color: '#FFFFFF',
      boxShadow: 'var(--shadow-btn-outer)',
    },
  }

  const disabledStyle = isDisabled ? {
    background: '#D3D3D3',
    border: '1px solid #CCCCCC',
    color: '#888888',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  } : {}

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...disabledStyle, ...extraStyle }}
      {...props}
    >
      {isLoading && (
        <svg
          style={{ marginRight: 8, width: 14, height: 14, animation: 'fc-spin 1s linear infinite', flexShrink: 0 }}
          viewBox="0 0 24 24" fill="none"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" opacity="0.75" />
        </svg>
      )}
      {children}
    </button>
  )
}
