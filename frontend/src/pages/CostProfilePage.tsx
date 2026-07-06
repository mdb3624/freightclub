import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCostProfile, useSaveCostProfile } from '@/features/carrier/hooks/useCostProfile'
import { CostProfileSummary } from '@/features/carrier/components/costProfile/CostProfileSummary'
import { CostProfileWizard } from '@/features/carrier/components/costProfile/CostProfileWizard'
import type { CostProfileWizardFormData } from '@/features/carrier/schemas/costProfile.schemas'

export function CostProfilePage() {
  const navigate = useNavigate()
  const { data: profile, isLoading } = useCostProfile()
  const { mutate: save, isPending } = useSaveCostProfile()
  const [view, setView] = useState<'summary' | 'wizard'>('wizard')
  const [wizardData, setWizardData] = useState<Partial<CostProfileWizardFormData>>({})

  useEffect(() => {
    if (!isLoading) {
      setView(profile ? 'summary' : 'wizard')
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

  return (
    <div data-testid="cost-profile-page" style={{ background: '#0a0a0a', minHeight: '100vh', color: '#F5F5F5' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottom: '1px solid #2A2A2A' }}>
        <button data-testid="header-logo-btn" onClick={() => navigate('/dashboard/trucker')} style={{ background: 'none', border: 'none', color: '#B08D57', fontWeight: 700, minHeight: 56, padding: '0 12px' }}>
          FreightClub
        </button>
        <span>Cost Profile</span>
        <button
          data-testid="header-save-btn"
          disabled={isPending}
          onClick={() => view === 'wizard' && save(wizardData as CostProfileWizardFormData)}
          style={{ background: 'none', border: 'none', color: '#B08D57', fontWeight: 700, minHeight: 56, padding: '0 12px' }}
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
      </header>

      {view === 'summary' && profile && (
        <CostProfileSummary profile={profile} onEdit={() => setView('wizard')} />
      )}
      {view === 'wizard' && (
        <CostProfileWizard
          initialData={profile ?? undefined}
          onComplete={(formData) => save(formData, { onSuccess: () => setView('summary') })}
          onDataChange={setWizardData}
        />
      )}
    </div>
  )
}
