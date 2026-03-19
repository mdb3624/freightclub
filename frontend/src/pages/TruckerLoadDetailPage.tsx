import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { useBoardLoad } from '@/features/loads/hooks/useBoardLoad'
import { useClaimLoad } from '@/features/loads/hooks/useClaimLoad'
import { useMarkPickedUp } from '@/features/loads/hooks/useMarkPickedUp'
import { useMarkDelivered } from '@/features/loads/hooks/useMarkDelivered'
import { LoadDetail } from '@/features/loads/components/LoadDetail'
import { ContactCard } from '@/features/loads/components/ContactCard'
import { ProfitabilityCard } from '@/features/loads/components/ProfitabilityCard'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import type { ApiError } from '@/types'

type PendingAction = 'pickup' | 'deliver' | null

export function TruckerLoadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const { data: load, isLoading, isError } = useBoardLoad(id)
  const { data: profile } = useProfile()
  const { mutate: claimLoad, isPending: isClaiming, error: claimError } = useClaimLoad()
  const { mutate: markPickedUp, isPending: isPickingUp } = useMarkPickedUp()
  const { mutate: markDelivered, isPending: isDelivering } = useMarkDelivered()
  const navigate = useNavigate()
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  function handleClaim() {
    claimLoad(load!.id, {
      onSuccess: () => navigate('/dashboard/trucker', { state: { scrollToActive: true } }),
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
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">FreightClub</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.firstName} {user?.lastName}
          </span>
          <Link to="/profile" className="text-sm text-primary-600 hover:underline">
            My Profile
          </Link>
          <Button variant="secondary" onClick={logout}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6">
          <Link to="/dashboard/trucker" className="text-sm text-primary-600 hover:underline">
            ← Back to Dashboard
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-gray-900">Load Detail</h2>
        </div>

        {isLoading && (
          <p className="text-center text-gray-500 py-12">Loading...</p>
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

            {profile && load.status === 'OPEN' && (
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

            <div className="rounded-xl border border-gray-200 bg-white p-6 mt-4">
              <div className="flex items-center gap-3">
                {load.status === 'OPEN' && (
                  <Button isLoading={isClaiming} onClick={handleClaim}>
                    Claim This Load
                  </Button>
                )}
                {load.status === 'CLAIMED' && (
                  <Button onClick={() => setPendingAction('pickup')}>
                    Mark as Picked Up
                  </Button>
                )}
                {load.status === 'IN_TRANSIT' && (
                  <Button onClick={() => setPendingAction('deliver')}>
                    Mark as Delivered
                  </Button>
                )}
                <Link to="/dashboard/trucker">
                  <Button variant="secondary">Back to Board</Button>
                </Link>
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
      </main>
    </div>
  )
}
