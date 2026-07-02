import React, { useState } from 'react'

/**
 * Select dropdown — form select matching Input styling.
 */
export function Select({ label, error, helper, options = [], disabled = false, id, value, onChange, placeholder, containerStyle, style: extraStyle, ...props }) {
  const [focused, setFocused] = useState(false)
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', ...containerStyle }}>
      {label && (
        <label htmlFor={selectId} style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--font-size-base)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
        }}>{label}</label>
      )}
      <select
        id={selectId}
        disabled={disabled}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          height: '40px',
          padding: '8px 12px',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--font-size-base)',
          color: value ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
          background: disabled ? 'var(--color-surface-light)' : '#FFFFFF',
          border: error
            ? '2px solid var(--color-critical)'
            : focused
            ? 'var(--border-focus)'
            : '1px solid var(--color-border-primary)',
          borderRadius: 'var(--radius-input)',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          width: '100%',
          boxSizing: 'border-box',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23636E72' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: 32,
          ...extraStyle,
        }}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={typeof opt === 'object' ? opt.value : opt} value={typeof opt === 'object' ? opt.value : opt}>
            {typeof opt === 'object' ? opt.label : opt}
          </option>
        ))}
      </select>
      {error && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-sm)', fontStyle: 'italic', color: 'var(--color-critical)' }}>{error}</span>}
      {helper && !error && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-sm)', fontStyle: 'italic', color: 'var(--color-text-tertiary)' }}>{helper}</span>}
    </div>
  )
}
