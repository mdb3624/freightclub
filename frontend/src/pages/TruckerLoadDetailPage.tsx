import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { AxiosError } from 'axios'
import { useToastStore } from '@/store/toastStore'
import { AppShell } from '@/components/AppShell'
import { useBoardLoad } from '@/features/loads/hooks/useBoardLoad'
import { useClaimLoad } from '@/features/loads/hooks/useClaimLoad'
import { useMarkPickedUp } from '@/features/loads/hooks/useMarkPickedUp'
import { useMarkDelivered } from '@/features/loads/hooks/useMarkDelivered'
import { useMyActiveLoad } from '@/features/loads/hooks/useMyActiveLoad'
import { LoadDetail } from '@/features/loads/components/LoadDetail'
import { ContactCard } from '@/features/loads/components/ContactCard'
import { ProfitabilityCard } from '@/features/loads/components/ProfitabilityCard'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { useLoadDocuments } from '@/features/documents/hooks/useDocuments'
import { DocumentSection } from '@/features/documents/components/DocumentSection'
import { useMyRatingForLoad, useRateShipper } from '@/features/ratings/hooks/useRatings'
import { RatingForm } from '@/features/ratings/components/RatingForm'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import type { ApiError } from '@/types'

type PendingAction = 'pickup' | 'deliver' | null

export function TruckerLoadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: load, isLoading, isError } = useBoardLoad(id)
  const { data: profile } = useProfile()
  const { data: documents = [] } = useLoadDocuments(id)
  const { mutate: claimLoad, isPending: isClaiming, error: claimError } = useClaimLoad()
  const { mutate: markPickedUp, isPending: isPickingUp } = useMarkPickedUp()
  const { mutate: markDelivered, isPending: isDelivering } = useMarkDelivered()
  const { data: activeLoad } = useMyActiveLoad()
  const navigate = useNavigate()
  const toast = useToastStore()
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  const { data: myRating } = useMyRatingForLoad(load?.status === 'DELIVERED' || load?.status === 'SETTLED' ? id : undefined)
  const { mutate: rateShipper, isPending: isRating } = useRateShipper(id ?? '')

  const hasBolPhoto = documents.some((d) => d.documentType === 'BOL_PHOTO')
  const hasPodPhoto = documents.some((d) => d.documentType === 'POD_PHOTO')

  function handleClaim() {
    claimLoad(load!.id, {
      onSuccess: () => {
        toast.show('Load claimed — head to the pickup location.')
        navigate('/dashboard/trucker', { state: { scrollToActive: true } })
      },
    })
  }

  function confirmAction() {
    if (pendingAction === 'pickup') {
      markPickedUp(load!.id, {
        onSuccess: () => navigate('/dashboard/trucker'),
      })
    } else if (pendingAction === 'deliver') {
      markDelivered(load!.id, {
        onSuccess: () => navigate('/dashboard/trucker'),
      })
    }
    setPendingAction(null)
  }

  return (
    <AppShell maxWidth="md">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Load Detail</h1>
      </div>

        {isLoading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-7 bg-gray-200 rounded w-2/5" />
            <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
              {[80, 65, 70, 55, 75, 60].map((w, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        )}
        {(isError || (!isLoading && !load)) && (
          <ErrorBanner message="Load not found." />
        )}

        {load && (
          <>
            {claimError && (
              <div className="mb-4">
                <ErrorBanner
                  message={
                    (claimError as AxiosError<ApiError>).response?.data?.message ??
                    'This load is no longer available.'
                  }
                />
              </div>
            )}

            {load.shipperContact && (load.status === 'CLAIMED' || load.status === 'IN_TRANSIT') && (
              <div className="mb-4">
                <ContactCard title="Shipper Contact" contact={load.shipperContact} />
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <LoadDetail load={load} />
            </div>

            {profile && (load.status === 'OPEN' || load.status === 'CLAIMED' || load.status === 'IN_TRANSIT') && (
              <ProfitabilityCard
                load={load}
                costProfile={{
                  monthlyFixedCosts:      profile.monthlyFixedCosts,
                  fuelCostPerGallon:      profile.fuelCostPerGallon,
                  milesPerGallon:         profile.milesPerGallon,
                  maintenanceCostPerMile: profile.maintenanceCostPerMile,
                  monthlyMilesTarget:     profile.monthlyMilesTarget,
                  targetMarginPerMile:    profile.targetMarginPerMile,
                }}
              />
            )}

            {/* Rate shipper — shown after delivery */}
            {(load.status === 'DELIVERED' || load.status === 'SETTLED') && (
              <RatingForm
                loadId={load.id}
                target="SHIPPER"
                targetName={load.shipperContact?.businessName ?? load.shipperContact?.name ?? 'the shipper'}
                existingRating={myRating ?? undefined}
                onSubmit={(stars, comment) => rateShipper({ stars, comment })}
                isPending={isRating}
              />
            )}

            {/* Documents section — shown for claimed/in-transit/delivered loads */}
            {(load.status === 'CLAIMED' || load.status === 'IN_TRANSIT' || load.status === 'DELIVERED') && (
              <DocumentSection
                loadId={load.id}
                loadStatus={load.status}
                role="TRUCKER"
                documents={documents}
              />
            )}

            <div className="rounded-xl border border-gray-200 bg-white p-6 mt-4">
              <div className="flex items-center gap-3">
                {load.status === 'OPEN' && (
                  <div className="flex flex-col gap-2">
                    <Button
                      isLoading={isClaiming}
                      onClick={handleClaim}
                      disabled={!!activeLoad}
                      title={activeLoad ? 'You already have an active load. Complete or wait for your current load to claim a new one.' : undefined}
                    >
                      Claim This Load
                    </Button>
                    {activeLoad && (
                      <p className="text-xs text-amber-700">
                        You have an active load in progress. Complete it before claiming another.
                      </p>
                    )}
                  </div>
                )}
                {load.status === 'CLAIMED' && (
                  <Button
                    onClick={() => setPendingAction('pickup')}
                    disabled={!hasBolPhoto}
                    title={!hasBolPhoto ? 'Upload a BOL photo above to continue' : undefined}
                  >
                    {hasBolPhoto ? 'Mark as Picked Up' : 'Upload BOL Photo to Continue'}
                  </Button>
                )}
                {load.status === 'IN_TRANSIT' && (
                  <Button
                    onClick={() => setPendingAction('deliver')}
                    disabled={!hasPodPhoto}
                    title={!hasPodPhoto ? 'Upload a POD photo above to continue' : undefined}
                  >
                    {hasPodPhoto ? 'Mark as Delivered' : 'Upload POD Photo to Continue'}
                  </Button>
                )}
              </div>

              {pendingAction && (
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="confirm-dialog-title"
                  className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4"
                >
                  <p id="confirm-dialog-title" className="text-sm font-semibold text-amber-900">
                    {pendingAction === 'pickup'
                      ? 'Confirm pickup — this cannot be undone'
                      : 'Confirm delivery — this cannot be undone'}
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    {pendingAction === 'pickup'
                      ? 'You are confirming you have physically picked up this load at the origin. The load will move to In Transit.'
                      : 'You are confirming this load has been delivered to the destination. The shipper will be notified.'}
                  </p>
                  <div className="mt-3 flex gap-3">
                    <Button
                      isLoading={isPickingUp || isDelivering}
                      onClick={confirmAction}
                    >
                      {pendingAction === 'pickup' ? 'Yes, I have the load' : 'Yes, delivered'}
                    </Button>
                    <Button variant="secondary" onClick={() => setPendingAction(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
    </AppShell>
  )
}
