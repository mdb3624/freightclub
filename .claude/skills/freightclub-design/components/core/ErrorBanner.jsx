import React from 'react'

/**
 * ErrorBanner — inline error message block.
 */
export function ErrorBanner({ message, children, style: extraStyle }) {
  const text = message || children
  if (!text) return null
  return (
    <div style={{
      padding: 'var(--space-md)',
      borderRadius: 'var(--radius-widget)',
      background: 'var(--color-critical-subtle)',
      border: '1px solid var(--color-critical)',
      color: 'var(--color-critical-text)',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--font-size-base)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-sm)',
      ...extraStyle,
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>⚠</span>
      <span>{text}</span>
    </div>
  )
}
