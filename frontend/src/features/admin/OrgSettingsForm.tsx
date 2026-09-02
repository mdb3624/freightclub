import { useState, useEffect } from 'react'
import type { OrgSettings } from './types'

interface OrgSettingsFormProps {
  persona: 'shipper' | 'carrier'
  settings: OrgSettings
  onSave: (settings: Partial<OrgSettings>) => void
  isSaving: boolean
  theme: 'light' | 'dark'
}

// US-876/878 BR-5 + council-review 1-seat collapse rule: for a 1-member tenant, "org default
// vs. your value" is a meaningless distinction over one row of data — label it plainly instead
// of introducing that framing. Shipper fields vs. Carrier fields per persona, shared component.
export function OrgSettingsForm({ persona, settings, onSave, isSaving, theme }: OrgSettingsFormProps) {
  const [form, setForm] = useState<Partial<OrgSettings>>(settings)
  useEffect(() => setForm(settings), [settings])

  const isSolo = settings.memberCount <= 1
  const isLight = theme === 'light'
  const colors = isLight
    ? { border: '#D8CEB8', text: '#1A1A1A', muted: '#4A5568', surface: '#FFFFFF', accent: '#B08D57' }
    : { border: '#2A2A2A', text: '#F5F5F5', muted: '#808080', surface: '#1A1A1A', accent: '#C9A876' }

  const inputStyle = {
    width: '100%', padding: '8px 10px', borderRadius: 6, fontSize: 13,
    border: `1px solid ${colors.border}`, background: isLight ? '#F8F9FB' : '#121212', color: colors.text,
  }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: colors.muted, marginBottom: 4, display: 'block' as const }

  const field = (key: keyof OrgSettings, label: string, type: 'text' | 'number' = 'text') => (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      <input
        data-testid={`org-setting-${key}`}
        type={type}
        style={inputStyle}
        value={(form[key] as string | number | null | undefined) ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, [key]: type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value }))}
      />
    </div>
  )

  return (
    <div style={{ padding: 16, borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.surface }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.text, marginTop: 0, marginBottom: 4 }}>
        {isSolo ? 'Your Settings' : `Org Defaults (${settings.memberCount} members)`}
      </h3>
      <p style={{ fontSize: 12, color: colors.muted, marginTop: 0, marginBottom: 16 }}>
        {isSolo
          ? 'These apply to your account. Once someone else joins, this becomes the default new members inherit.'
          : "New members inherit these defaults on signup. Changing a value here never overwrites a member's own saved value."}
      </p>

      {persona === 'shipper' ? (
        <>
          {field('defaultPickupAddress1', 'Default Pickup Address')}
          {field('defaultPickupCity', 'City')}
          {field('defaultPickupState', 'State')}
          {field('defaultPickupZip', 'ZIP')}
          {field('billingAddress1', 'Billing Address')}
          {field('billingCity', 'Billing City')}
          {field('billingState', 'Billing State')}
          {field('billingZip', 'Billing ZIP')}
        </>
      ) : (
        <>
          {field('fuelCostPerGallon', 'Fuel Cost / Gallon ($)', 'number')}
          {field('maintenanceCostPerMile', 'Maintenance Cost / Mile ($)', 'number')}
          {field('monthlyFixedCosts', 'Monthly Fixed Costs ($)', 'number')}
          {field('targetMarginPerMile', 'Target Margin / Mile ($)', 'number')}
        </>
      )}

      <button
        data-testid="save-org-settings"
        disabled={isSaving}
        onClick={() => onSave(form)}
        style={{
          marginTop: 8, padding: '10px 16px', borderRadius: 6, border: 'none',
          background: colors.accent, color: isLight ? '#fff' : '#121212', fontWeight: 700,
          fontSize: 13, cursor: 'pointer', opacity: isSaving ? 0.6 : 1,
        }}
      >
        {isSaving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  )
}
