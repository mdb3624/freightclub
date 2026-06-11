import { useProfile } from '@/features/profile/hooks/useProfile'
import { ShipperPageLayout } from '@/features/shipper/components/ShipperPageLayout'
import { ProfileCompletionBanner } from '@/features/shipper/components/ProfileCompletionBanner'
import { KPISummaryPanel } from '@/features/shipper/components/KPISummaryPanel'
import { QuickActionsPanel } from '@/features/shipper/dashboard/components/QuickActionsPanel'
import { useQuickActionNavigation } from '@/features/shipper/dashboard/hooks/useQuickActionNavigation'
import { useState } from 'react'

export function ShipperDashboard() {
  const { data: profile } = useProfile()
  const { onPostLoad, onGetQuote, onTrackShipments, onPreferredCarriers } = useQuickActionNavigation()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingButtonId, setLoadingButtonId] = useState<string | null>(null)

  // Profile completion check
  const p = profile as any
  const isComplete = p && p.phone && p.billingCity && (p.businessName || p.firstName)
  const completionPct = p ? (isComplete ? 85 : 20) : 0
  const showCompletionBanner = !p || !isComplete

  const handleActionClick = (buttonId: string, handler: () => void) => {
    setIsLoading(true)
    setLoadingButtonId(buttonId)
    // Navigation happens immediately
    handler()
  }

  // SLOT_A: KPI Summary Panel only
  const slotAContent = (
    <div className="panel" data-testid="kpi-summary-section">
      <KPISummaryPanel />
    </div>
  )

  // SLOT_C: Quick Actions Panel (right sidebar)
  const slotCContent = (
    <QuickActionsPanel
      onPostLoad={() => handleActionClick('quick-actions-post-load', onPostLoad)}
      onGetQuote={() => handleActionClick('quick-actions-quote', onGetQuote)}
      onTrackShipments={() => handleActionClick('quick-actions-track', onTrackShipments)}
      onPreferredCarriers={() => handleActionClick('quick-actions-carriers', onPreferredCarriers)}
      isLoading={isLoading}
      loadingButtonId={loadingButtonId}
    />
  )

  return (
    <ShipperPageLayout
      data-testid="dashboard-container"
      profileBanner={showCompletionBanner ? <ProfileCompletionBanner completeness={completionPct} /> : undefined}
      slotA={slotAContent}
      slotC={slotCContent}
    />
  )
}
