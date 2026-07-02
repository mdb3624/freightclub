import React from 'react'

/**
 * Skeleton — animated loading placeholder.
 * Use while awaiting API data.
 */
export function Skeleton({ variant = 'text', width, height, count = 1, style: extraStyle }) {
  const defaults = {
    text:   { width: '100%', height: 16, borderRadius: 4 },
    title:  { width: '60%',  height: 28, borderRadius: 4 },
    avatar: { width: 40,     height: 40, borderRadius: '50%' },
    card:   { width: '100%', height: 120, borderRadius: 8 },
    badge:  { width: 64,     height: 20, borderRadius: 9999 },
  }

  const base = defaults[variant] || defaults.text

  const block = (key) => (
    <div key={key} style={{
      background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
      backgroundSize: '200% 100%',
      animation: 'fc-shimmer 1.4s ease-in-out infinite',
      ...base,
      ...(width ? { width } : {}),
      ...(height ? { height } : {}),
      ...extraStyle,
    }} />
  )

  if (count === 1) return block('s')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      {Array.from({ length: count }, (_, i) => block(i))}
    </div>
  )
}
