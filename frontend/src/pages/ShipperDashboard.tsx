import { useProfile } from '@/features/profile/hooks/useProfile'
import { ShipperPageLayout } from '@/features/shipper/components/ShipperPageLayout'
import { ProfileCompletionBanner } from '@/features/shipper/components/ProfileCompletionBanner'
import { KPISummaryPanel } from '@/features/shipper/components/KPISummaryPanel'

export function ShipperDashboard() {
  const { data: profile } = useProfile()

  // Profile completion check
  const p = profile as any
  const isComplete = p && p.phone && p.billingCity && (p.businessName || p.firstName)
  const completionPct = p ? (isComplete ? 85 : 20) : 0
  const showCompletionBanner = !p || !isComplete

  // SLOT_A: KPI Summary Panel only
  const slotAContent = (
    <div className="panel" data-testid="kpi-summary-section">
      <KPISummaryPanel />
    </div>
  )

  return (
    <ShipperPageLayout
      data-testid="dashboard-container"
      profileBanner={showCompletionBanner ? <ProfileCompletionBanner completeness={completionPct} /> : undefined}
      slotA={slotAContent}
    />
  )
}
