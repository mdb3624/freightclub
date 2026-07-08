import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile'
import { CompletenessBar } from '@/features/carrier/components/carrierProfile/CompletenessBar'
import { ExpiryDateField } from '@/features/carrier/components/carrierProfile/ExpiryDateField'
import { expiryStatus, MAX_PREFERRED_LANES } from '@/features/carrier/schemas/carrierProfile.schemas'
import { carrierApi } from '@/features/carrier/api'
import { useLanes } from '@/features/carrier/hooks/useCarrierProfile'
import type { UpdateProfileValues } from '@/features/profile/types'

const inputStyle: React.CSSProperties = {
  height: 52, padding: '0 14px', background: '#161616', border: '1px solid #2A2A2A',
  borderRadius: 8, color: '#F5F5F5', fontSize: 16, width: '100%', outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#636E72',
}

type Tab = 'identity' | 'equipment' | 'credentials' | 'lanes'
const TABS: { id: Tab; label: string }[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'credentials', label: 'Creds' },
  { id: 'lanes', label: 'Lanes' },
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </div>
  )
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{children}</div>
}

export function CarrierProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: profile, isLoading } = useProfile()
  const { mutate: updateProfile, isPending } = useUpdateProfile()
  const [tab, setTab] = useState<Tab>('identity')
  const [form, setForm] = useState<Partial<UpdateProfileValues>>({})
  const [justSaved, setJustSaved] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [pendingEquipmentChange, setPendingEquipmentChange] = useState<{ from: string; to: string } | null>(null)
  const [lanes, setLanes] = useState<Array<{ id?: string; originRegion: string; destinationRegion: string }>>([])
  const [lanesInitialized, setLanesInitialized] = useState(false)
  const { data: existingLanes } = useLanes(user?.id ?? '')

  // Guarded with `initialized` (rather than depending on `profile` directly) so the
  // form is pre-filled exactly once when the profile first loads. Without this guard,
  // any hook implementation that doesn't return a referentially-stable object (e.g. a
  // fresh literal per call, as in test doubles) causes this effect to refire on every
  // render, triggering an infinite render loop.
  useEffect(() => {
    if (profile && !initialized) {
      setForm(profile as Partial<UpdateProfileValues>)
      setInitialized(true)
    }
  }, [profile, initialized])

  // Guarded with `lanesInitialized` for the same reason as the profile-seeding
  // effect above: a hook implementation that doesn't return a referentially-stable
  // object (e.g. a fresh array/object literal per call, as in test doubles) would
  // otherwise cause this effect to refire every render, triggering an infinite
  // render loop (confirmed via an actual OOM crash before this guard was added).
  useEffect(() => {
    if (existingLanes && !lanesInitialized) {
      const rows: Array<{ id?: string; originRegion: string; destinationRegion: string }> = existingLanes.slice(0, MAX_PREFERRED_LANES).map((l) => ({ id: l.id, originRegion: l.originRegion, destinationRegion: l.destinationRegion }))
      while (rows.length < MAX_PREFERRED_LANES) rows.push({ originRegion: '', destinationRegion: '' })
      setLanes(rows)
      setLanesInitialized(true)
    }
  }, [existingLanes, lanesInitialized])

  const set = <K extends keyof UpdateProfileValues>(key: K, value: UpdateProfileValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSave = () => {
    updateProfile(form as UpdateProfileValues, {
      onSuccess: () => {
        setJustSaved(true)
        setTimeout(() => setJustSaved(false), 2500)
      },
    })
  }

  const handleEquipmentTypeChange = (newType: string) => {
    if (newType === form.equipmentType) return
    setPendingEquipmentChange({ from: form.equipmentType ?? '', to: newType })
  }

  const confirmEquipmentChange = () => {
    if (pendingEquipmentChange) set('equipmentType', pendingEquipmentChange.to as UpdateProfileValues['equipmentType'])
    setPendingEquipmentChange(null)
  }

  const setLaneField = (index: number, field: 'originRegion' | 'destinationRegion', value: string) => {
    setLanes((prev) => prev.map((lane, i) => (i === index ? { ...lane, [field]: value } : lane)))
  }

  const saveLane = (index: number) => {
    const lane = lanes[index]
    if (!lane.originRegion || !lane.destinationRegion) return
    if (lane.id) {
      carrierApi.lanes.update(lane.id, { originRegion: lane.originRegion, destinationRegion: lane.destinationRegion, frequencyPreference: 'ANY' })
    } else {
      carrierApi.lanes.add({ originRegion: lane.originRegion, destinationRegion: lane.destinationRegion, frequencyPreference: 'ANY' })
        .then((created) => setLanes((prev) => prev.map((l, i) => (i === index ? { ...l, id: created.id } : l))))
    }
  }

  const completenessChecks = [
    !!form.firstName, !!form.lastName, !!form.phone,
    !!form.equipmentType, !!form.licensePlate, !!form.dotNumber,
    !!form.cdlClass, !!form.cdlExpiry, !!form.insuranceExpiry, !!form.insuranceCarrier,
  ]

  const credWarnings = [
    { label: 'CDL', expiry: form.cdlExpiry },
    { label: 'Insurance', expiry: form.insuranceExpiry },
    { label: 'Med', expiry: form.medCardExpiry },
  ].filter((c) => ['warn', 'critical', 'expired'].includes(expiryStatus(c.expiry)))

  const userInitials = ((user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '')).toUpperCase() || 'U'

  if (isLoading) {
    return <div data-testid="carrier-profile-page" style={{ background: '#0a0a0a', minHeight: '100vh' }} />
  }

  const TAB_CONTENT: Record<Tab, React.ReactNode> = {
    identity: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 14px 0' }}>
        <Row2>
          <Field label="First name">
            <input data-testid="identity-first-name-input" style={inputStyle}
              value={form.firstName ?? ''} onChange={(e) => set('firstName', e.target.value)} placeholder="First" />
          </Field>
          <Field label="Last name">
            <input data-testid="identity-last-name-input" style={inputStyle}
              value={form.lastName ?? ''} onChange={(e) => set('lastName', e.target.value)} placeholder="Last" />
          </Field>
        </Row2>
        <Field label="Phone">
          <input data-testid="identity-phone-input" type="tel" style={inputStyle}
            value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} placeholder="(555) 000-0000" />
        </Field>
        <div style={{
          background: '#161616', border: '1px solid #2A2A2A', borderRadius: 8, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 12, marginTop: 4,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A46A,#8C6D3F)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
            fontSize: 16, flexShrink: 0, boxShadow: '0 0 0 2px #B08D57',
          }}>
            {userInitials}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{form.firstName} {form.lastName}</div>
            <div style={{ fontSize: 11, color: '#636E72', marginTop: 2 }}>{form.phone} · {profile?.email || '—'}</div>
          </div>
        </div>
      </div>
    ),
    equipment: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 14px 0' }}>
        <Field label="Equipment type">
          <select data-testid="equipment-type-select" style={inputStyle}
            value={form.equipmentType ?? ''} onChange={(e) => handleEquipmentTypeChange(e.target.value)}>
            <option value="DRY_VAN">Dry Van</option>
            <option value="FLATBED">Flatbed</option>
            <option value="REEFER">Reefer</option>
            <option value="STEP_DECK">Step Deck</option>
            <option value="REFRIGERATED">Refrigerated</option>
            <option value="TANKER">Tanker</option>
            <option value="SPECIALIZED">Specialized</option>
          </select>
          <div style={{ fontSize: 11, color: '#4A5568', fontStyle: 'italic', marginTop: 4 }}>
            Filters every load on your board — one type only
          </div>
        </Field>
        <Row2>
          <Field label="Year">
            <input data-testid="equipment-year-input" style={inputStyle} value={form.equipmentYear ?? ''}
              onChange={(e) => set('equipmentYear', e.target.value)} placeholder="2019" maxLength={4} />
          </Field>
          <Field label="Make">
            <input data-testid="equipment-make-input" style={inputStyle} value={form.equipmentMake ?? ''}
              onChange={(e) => set('equipmentMake', e.target.value)} placeholder="Freightliner" />
          </Field>
        </Row2>
        <Row2>
          <Field label="Model">
            <input data-testid="equipment-model-input" style={inputStyle} value={form.equipmentModel ?? ''}
              onChange={(e) => set('equipmentModel', e.target.value)} placeholder="Cascadia" />
          </Field>
          <Field label="Plate">
            <input data-testid="equipment-plate-input" style={{ ...inputStyle, textTransform: 'uppercase' }}
              value={form.licensePlate ?? ''} onChange={(e) => set('licensePlate', e.target.value)} placeholder="TX-0000" />
          </Field>
        </Row2>
        <Field label="VIN (optional)">
          <input data-testid="equipment-vin-input" style={inputStyle} value={form.vin ?? ''}
            onChange={(e) => set('vin', e.target.value)} placeholder="Leave blank if unknown" maxLength={17} />
        </Field>
      </div>
    ),
    credentials: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 14px 0' }}>
        <Row2>
          <Field label="DOT #">
            <input data-testid="creds-dot-input" style={inputStyle} value={form.dotNumber ?? ''}
              onChange={(e) => set('dotNumber', e.target.value)} placeholder="TX-0000" />
          </Field>
          <Field label="MC #">
            <input data-testid="creds-mc-input" style={inputStyle} value={form.mcNumber ?? ''}
              onChange={(e) => set('mcNumber', e.target.value)} placeholder="MC-000000" />
          </Field>
        </Row2>
        <Row2>
          <Field label="CDL class">
            <select data-testid="creds-cdl-class-select" style={inputStyle}
              value={form.cdlClass ?? ''} onChange={(e) => set('cdlClass', e.target.value as UpdateProfileValues['cdlClass'])}>
              <option value="CLASS_A">Class A</option>
              <option value="CLASS_B">Class B</option>
              <option value="CLASS_C">Class C</option>
            </select>
          </Field>
          <ExpiryDateField label="CDL expiry" testId="creds-cdl-expiry-input"
            value={form.cdlExpiry ?? ''} onChange={(v) => set('cdlExpiry', v)} />
        </Row2>
        <Field label="Insurance carrier">
          <input data-testid="creds-insurance-carrier-input" style={inputStyle} value={form.insuranceCarrier ?? ''}
            onChange={(e) => set('insuranceCarrier', e.target.value)} placeholder="Progressive Commercial" />
        </Field>
        <Row2>
          <ExpiryDateField label="Insurance expiry" testId="creds-insurance-expiry-input"
            value={form.insuranceExpiry ?? ''} onChange={(v) => set('insuranceExpiry', v)} />
          <ExpiryDateField label="Med card expiry" testId="creds-med-card-expiry-input"
            value={form.medCardExpiry ?? ''} onChange={(v) => set('medCardExpiry', v)} />
        </Row2>
      </div>
    ),
    lanes: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '14px 14px 0' }}>
        <div style={{ fontSize: 13, color: '#636E72', lineHeight: 1.5 }}>
          Up to {MAX_PREFERRED_LANES} lanes — matching loads surface first on your board.
        </div>
        {lanes.map((lane, i) => (
          <div key={i}>
            <div style={labelStyle}>Lane {i + 1}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 24px 1fr', gap: 6, alignItems: 'center', marginTop: 6 }}>
              <select data-testid={`lane-${i + 1}-origin-select`} style={inputStyle}
                value={lane.originRegion} onChange={(e) => { setLaneField(i, 'originRegion', e.target.value); }}
                onBlur={() => saveLane(i)}>
                <option value="">Origin</option>
                <option value="TX">TX</option><option value="CA">CA</option><option value="FL">FL</option>
                <option value="NY">NY</option><option value="IL">IL</option>
              </select>
              <span style={{ color: '#C9A876', textAlign: 'center', fontSize: 14 }}>→</span>
              <select data-testid={`lane-${i + 1}-destination-select`} style={inputStyle}
                value={lane.destinationRegion} onChange={(e) => { setLaneField(i, 'destinationRegion', e.target.value); }}
                onBlur={() => saveLane(i)}>
                <option value="">Dest.</option>
                <option value="TX">TX</option><option value="CA">CA</option><option value="FL">FL</option>
                <option value="NY">NY</option><option value="IL">IL</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    ),
  }

  return (
    <div data-testid="carrier-profile-page" style={{ background: '#0a0a0a', minHeight: '100vh', color: '#F5F5F5', display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', borderBottom: '1px solid #2A2A2A', background: '#1A1A1A', flexShrink: 0 }}>
        <button data-testid="header-logo-btn" onClick={() => navigate('/dashboard/trucker')}
          style={{ background: 'none', border: 'none', padding: 0, minHeight: 56, minWidth: 56, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <img src="/logo.png" alt="FreightClub" style={{ height: 32, objectFit: 'contain' }} />
        </button>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#636E72', textTransform: 'uppercase', letterSpacing: '.07em' }}>
          My Profile
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button data-testid="header-save-btn" disabled={isPending} onClick={handleSave}
            style={{ background: 'none', border: 'none', color: justSaved ? '#27AE60' : '#C9A876', fontWeight: 700, fontSize: 13, minHeight: 56, minWidth: 48, padding: '0 8px' }}>
            {isPending ? 'Saving…' : justSaved ? '✓ Saved' : 'Save'}
          </button>
          <div data-testid="header-avatar" style={{
            width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A46A,#8C6D3F)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
            fontSize: 13, flexShrink: 0, boxShadow: '0 0 0 2px #B08D57',
          }}>
            {userInitials}
          </div>
        </div>
      </header>

      <CompletenessBar checks={completenessChecks} />

      {credWarnings.length > 0 && (
        <div style={{
          background: 'rgba(231,76,60,.1)', borderBottom: '1px solid #E74C3C', padding: '7px 14px',
          display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: 13 }}>⚠️</span>
          <span style={{ fontSize: 12, color: '#E74C3C', fontWeight: 600 }}>
            {credWarnings.map((w) => w.label).join(', ')} expire{credWarnings.length === 1 ? 's' : ''} soon
          </span>
          <button data-testid="cred-warning-review-btn" onClick={() => setTab('credentials')}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#E74C3C', fontSize: 11, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', minHeight: 48, minWidth: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
            Review
          </button>
        </div>
      )}

      <div style={{ display: 'flex', background: '#1A1A1A', borderBottom: '1px solid #2A2A2A', flexShrink: 0 }}>
        {TABS.map((t) => (
          <button key={t.id} data-testid={`tab-${t.id}`} onClick={() => setTab(t.id)}
            style={{
              flex: 1, height: 48, background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t.id ? '#B08D57' : 'transparent'}`,
              color: tab === t.id ? '#F5F5F5' : '#636E72', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '.04em',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {TAB_CONTENT[tab]}
        <div style={{ padding: '12px 14px', marginTop: 'auto', flexShrink: 0 }}>
          <button data-testid="save-profile-btn" onClick={handleSave} disabled={isPending} style={{
            height: 64, width: '100%', borderRadius: 8, border: '1px solid #7A5F3A', color: '#fff',
            fontWeight: 700, fontSize: 15, cursor: 'pointer',
            background: 'linear-gradient(180deg,#C9A46A 0%,#B08D57 45%,#8C6D3F 100%)',
          }}>
            {justSaved ? '✓ Profile Saved' : 'Save Profile'}
          </button>
        </div>
      </div>

      {pendingEquipmentChange && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }}>
          <div style={{ width: '100%', maxWidth: 375, margin: '0 auto', background: '#1A1A1A', borderTop: '1px solid #C9A876', borderRadius: '12px 12px 0 0', padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Change equipment type?</div>
            <div style={{ fontSize: 13, color: '#808080', marginBottom: 20, lineHeight: 1.6 }}>
              <span style={{ color: '#C9A876', fontWeight: 700 }}>{pendingEquipmentChange.to}</span> loads will replace{' '}
              <span style={{ color: '#C9A876', fontWeight: 700 }}>{pendingEquipmentChange.from}</span> on your board. Takes effect immediately.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button data-testid="equip-confirm-yes-btn" onClick={confirmEquipmentChange} style={{
                height: 64, borderRadius: 8, border: '1px solid #7A5F3A', color: '#fff', fontWeight: 700, cursor: 'pointer',
                background: 'linear-gradient(180deg,#C9A46A 0%,#B08D57 45%,#8C6D3F 100%)',
              }}>
                Yes, Switch
              </button>
              <button data-testid="equip-confirm-cancel-btn" onClick={() => setPendingEquipmentChange(null)} style={{
                height: 56, borderRadius: 8, border: '1px solid #3A3A3A', color: '#C9A876', fontWeight: 600, cursor: 'pointer', background: 'transparent',
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
