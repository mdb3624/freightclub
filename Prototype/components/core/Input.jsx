import React, { useState } from 'react'

/**
 * FreightClub Input — form input with label, helper text, error state.
 * §6.3 specs: 40px height, 4px radius, bronze focus ring.
 */
export function Input({
  label,
  error,
  helper,
  disabled = false,
  id,
  style: extraStyle,
  containerStyle,
  ...props
}) {
  const [focused, setFocused] = useState(false)

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', ...containerStyle }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          height: '40px',
          padding: '8px 12px',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--font-size-base)',
          color: 'var(--color-text-primary)',
          background: disabled ? 'var(--color-surface-light)' : '#FFFFFF',
          border: error
            ? '2px solid var(--color-critical)'
            : focused
            ? 'var(--border-focus)'
            : '1px solid var(--color-border-primary)',
          borderRadius: 'var(--radius-input)',
          outline: 'none',
          transition: 'border-color 150ms ease',
          width: '100%',
          boxSizing: 'border-box',
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.7 : 1,
          ...extraStyle,
        }}
        {...props}
      />
      {error && (
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--font-size-sm)',
          fontStyle: 'italic',
          color: 'var(--color-critical)',
        }}>
          {error}
        </span>
      )}
      {helper && !error && (
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--font-size-sm)',
          fontStyle: 'italic',
          color: 'var(--color-text-tertiary)',
        }}>
          {helper}
        </span>
      )}
    </div>
  )
}
