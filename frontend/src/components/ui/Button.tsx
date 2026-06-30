import { type ButtonHTMLAttributes, type CSSProperties } from 'react'
import { usePersonaTheme } from '@/contexts/PersonaThemeContext'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  persona?: 'shipper' | 'carrier'
}

const bronzeGradient = 'linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)'
const bronzeShadow = 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)'

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  persona,
  children,
  disabled,
  className = '',
  style: extraStyle,
  ...props
}: ButtonProps) {
  const { persona: contextPersona } = usePersonaTheme()
  const isDisabled = disabled || isLoading
  const resolvedPersona = persona ?? contextPersona
  const borderRadius = resolvedPersona === 'carrier' ? '8px' : '4px'

  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-body, Inter, sans-serif)',
    fontWeight: 700,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 150ms ease',
    border: 'none',
    outline: 'none',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    borderRadius,
  }

  const sizes: Record<string, CSSProperties> = {
    sm: { padding: '4px 12px',  fontSize: '12px' },
    md: { padding: '8px 16px',  fontSize: '14px' },
    lg: { padding: '12px 24px', fontSize: '16px', minHeight: '48px' },
  }

  const variants: Record<string, CSSProperties> = {
    primary: {
      background: bronzeGradient,
      boxShadow: bronzeShadow,
      border: '1px solid #7A5F3A',
      color: '#FFFFFF',
    },
    secondary: {
      background: 'linear-gradient(180deg, #FAF6EE 0%, #F0E9D8 100%)',
      border: '1px solid #C9A876',
      color: '#7A5F3A',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.15)',
    },
    danger: {
      background: 'linear-gradient(180deg, #FEF0EE 0%, #FEE2E2 100%)',
      border: '1px solid #E74C3C',
      color: '#B91C1C',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 3px rgba(231,76,60,0.2)',
    },
    ghost: {
      background: 'transparent',
      border: '1px solid transparent',
      color: resolvedPersona === 'carrier' ? '#C9A876' : '#4A5568',
      boxShadow: 'none',
    },
  }

  const disabledStyle: CSSProperties = isDisabled ? {
    background: '#D3D3D3',
    border: '1px solid #CCCCCC',
    color: '#888888',
    boxShadow: 'none',
  } : {}

  return (
    <button
      disabled={isDisabled}
      className={className}
      style={{ ...base, ...sizes[size], ...variants[variant], ...disabledStyle, ...extraStyle }}
      {...props}
    >
      {isLoading && (
        <svg
          style={{ marginRight: 8, width: 14, height: 14, animation: 'spin 1s linear infinite', flexShrink: 0 }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" opacity="0.75" />
        </svg>
      )}
      {children}
    </button>
  )
}
