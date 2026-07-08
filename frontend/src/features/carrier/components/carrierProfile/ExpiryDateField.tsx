import { expiryStatus, expiryColor, expiryLabel } from '../../schemas/carrierProfile.schemas'

interface Props {
  label: string
  testId: string
  value: string
  onChange: (value: string) => void
}

// Ported 1:1 from Prototype/ui_kits/carrier/carrier-profile.html's ExpiryF component.
export function ExpiryDateField({ label, testId, value, onChange }: Props) {
  const status = expiryStatus(value)
  const color = expiryColor(status)
  const label_ = expiryLabel(value)

  const borderColor = status === 'warn' ? '#F59E0B' : status === 'critical' || status === 'expired' ? '#E74C3C' : '#2A2A2A'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#636E72' }}>
          {label}
        </span>
        {label_ && (
          <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase' }}>{label_}</span>
        )}
      </div>
      <input
        type="date"
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: 52, padding: '0 14px', background: '#161616', border: `1px solid ${borderColor}`,
          borderRadius: 8, color: '#F5F5F5', fontSize: 16, width: '100%', outline: 'none',
        }}
      />
    </div>
  )
}
