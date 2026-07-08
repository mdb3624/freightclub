interface Props {
  checks: boolean[]
}

// Ported 1:1 from Prototype/ui_kits/carrier/carrier-profile.html's ComplPill component.
export function CompletenessBar({ checks }: Props) {
  const pct = checks.length === 0 ? 0 : Math.round((checks.filter(Boolean).length / checks.length) * 100)
  const color = pct === 100 ? '#27AE60' : pct >= 70 ? '#F59E0B' : '#E74C3C'

  return (
    <div
      data-testid="completeness-bar"
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
        background: '#161616', borderBottom: '1px solid #2A2A2A', flexShrink: 0,
      }}
    >
      <div style={{ flex: 1, height: 4, background: '#2A2A2A', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 9999, transition: 'width 300ms' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, whiteSpace: 'nowrap' }}>{pct}% complete</span>
    </div>
  )
}
