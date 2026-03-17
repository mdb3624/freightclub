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
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import type { ApiError } from '@/types'

export function TruckerLoadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const { data: load, isLoading, isError } = useBoardLoad(id)
  const { mutate: claimLoad, isPending: isClaiming, error: claimError } = useClaimLoad()
  const { mutate: markPickedUp, isPending: isPickingUp } = useMarkPickedUp()
  const { mutate: markDelivered, isPending: isDelivering } = useMarkDelivered()
  const navigate = useNavigate()

  function handleClaim() {
    claimLoad(load!.id, {
      onSuccess: () => navigate('/dashboard/trucker'),
    })
  }

  function handlePickedUp() {
    markPickedUp(load!.id, {
      onSuccess: () => navigate('/dashboard/trucker'),
    })
  }

  function handleDelivered() {
    markDelivered(load!.id, {
      onSuccess: () => navigate('/dashboard/trucker'),
    })
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

              <div className="mt-6 border-t border-gray-100 pt-6 flex items-center gap-3">
                {load.status === 'OPEN' && (
                  <Button isLoading={isClaiming} onClick={handleClaim}>
                    Claim This Load
                  </Button>
                )}
                {load.status === 'CLAIMED' && (
                  <Button isLoading={isPickingUp} onClick={handlePickedUp}>
                    Mark as Picked Up
                  </Button>
                )}
                {load.status === 'IN_TRANSIT' && (
                  <Button isLoading={isDelivering} onClick={handleDelivered}>
                    Mark as Delivered
                  </Button>
                )}
                <Link to="/dashboard/trucker">
                  <Button variant="secondary">Back to Board</Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
