import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { useCostProfile, useSaveCostProfile } from '@/features/carrier/hooks/useCostProfile'
import { CostProfileSummary } from '@/features/carrier/components/costProfile/CostProfileSummary'
import { CostProfileWizard } from '@/features/carrier/components/costProfile/CostProfileWizard'
import { costProfileWizardSchema, type CostProfileWizardFormData } from '@/features/carrier/schemas/costProfile.schemas'

export function CostProfilePage() {
  const navigate = useNavigate()
  const logout = useLogout()
  const { user } = useAuthStore()
  const userInitials = ((user?.firstName?.[0] ?? '') + (user?.lastName?.[0] ?? '')).toUpperCase() || 'U'
  const { data: profile, isLoading } = useCostProfile()
  const { mutate: save, isPending } = useSaveCostProfile()
  const [view, setView] = useState<'summary' | 'wizard'>('wizard')
  const [wizardData, setWizardData] = useState<Partial<CostProfileWizardFormData>>({})
  const [justSaved, setJustSaved] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen])

  const flashSaved = () => {
    const now = new Date()
    setLastSavedAt(now)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2500)
  }

  useEffect(() => {
    if (!isLoading) {
      setView(profile && profile.annualMiles != null ? 'summary' : 'wizard')
    }
  }, [isLoading, profile])

  useEffect(() => {
    if (view === 'wizard' && profile) {
      setWizardData(profile)
    }
  }, [view, profile])

  if (isLoading) {
    return <div data-testid="cost-profile-page" style={{ background: '#0a0a0a', minHeight: '100vh' }} />
  }

  const saveTimeStr = lastSavedAt
    ? lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div data-testid="cost-profile-page" style={{ background: '#0a0a0a', minHeight: '100vh', color: '#F5F5F5' }}>
      <header style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', borderBottom: '1px solid #2A2A2A', background: '#1A1A1A' }}>
        <button
          data-testid="header-logo-btn"
          onClick={() => navigate('/dashboard/trucker')}
          style={{ background: 'none', border: 'none', padding: 0, minHeight: 56, minWidth: 56, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <img src="/logo.png" alt="FreightClub" style={{ height: 40, objectFit: 'contain' }} />
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#636E72', textTransform: 'uppercase', letterSpacing: '.07em' }}>
            Cost Profile
          </span>
          {saveTimeStr && !justSaved && (
            <span style={{ fontSize: 10, color: '#4A5568' }}>Saved {saveTimeStr}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            data-testid="header-save-btn"
            disabled={isPending}
            onClick={() => {
              if (view === 'wizard' && costProfileWizardSchema.safeParse(wizardData).success) {
                save(wizardData as CostProfileWizardFormData, { onSuccess: flashSaved })
              }
            }}
            style={{ background: 'none', border: 'none', color: justSaved ? '#27AE60' : '#B08D57', fontWeight: 700, fontSize: 13, minHeight: 56, padding: '0 8px', whiteSpace: 'nowrap' }}
          >
            {isPending ? 'Saving…' : justSaved ? '✓ Saved' : 'Save'}
          </button>
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              data-testid="header-avatar"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Account menu"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              style={{ width: 48, height: 48, minHeight: 48, borderRadius: '50%', background: '#B08D57', color: '#121212', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', flexShrink: 0 }}
            >
              {userInitials}
            </button>
            {menuOpen && (
              <div
                role="menu"
                data-testid="header-avatar-menu"
                style={{
                  position: 'absolute', top: 56, right: 0, minWidth: 140, zIndex: 20,
                  background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)', overflow: 'hidden',
                }}
              >
                <button
                  role="menuitem"
                  data-testid="header-avatar-signout"
                  onClick={() => { setMenuOpen(false); logout() }}
                  style={{
                    width: '100%', height: 48, padding: '0 16px', background: 'transparent',
                    border: 'none', color: '#EF4444', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {view === 'summary' && profile && (
        <CostProfileSummary profile={profile} onEdit={() => setView('wizard')} />
      )}
      {view === 'wizard' && (
        <CostProfileWizard
          initialData={profile ?? undefined}
          onComplete={(formData) => save(formData, { onSuccess: () => { setView('summary'); flashSaved() } })}
          onDataChange={setWizardData}
        />
      )}
    </div>
  )
}
