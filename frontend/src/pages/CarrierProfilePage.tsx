import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile'
import { CompletenessBar } from '@/features/carrier/components/carrierProfile/CompletenessBar'
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

  const completenessChecks = [
    !!form.firstName, !!form.lastName, !!form.phone,
    !!form.equipmentType, !!form.licensePlate, !!form.dotNumber,
    !!form.cdlClass, !!form.cdlExpiry, !!form.insuranceExpiry, !!form.insuranceCarrier,
  ]

  const userInitials = ((user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '')).toUpperCase() || 'U'

  if (isLoading) {
    return <div data-testid="carrier-profile-page" style={{ background: '#0a0a0a', minHeight: '100vh' }} />
  }

  const TAB_CONTENT: Record<Tab, React.ReactNode> = {
    identity: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 14px 0' }}>
        <Row2>
          <Field label="First name">
            <input data-testid="identity-first-name-input" className="di" style={inputStyle}
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
    equipment: null,
    credentials: null,
    lanes: null,
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
            style={{ background: 'none', border: 'none', color: justSaved ? '#27AE60' : '#C9A876', fontWeight: 700, fontSize: 13, minHeight: 56, padding: '0 8px' }}>
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
    </div>
  )
}
