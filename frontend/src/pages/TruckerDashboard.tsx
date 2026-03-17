import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { useLoadBoard } from '@/features/loads/hooks/useLoadBoard'
import { useMyActiveLoad } from '@/features/loads/hooks/useMyActiveLoad'
import { useMyLoadHistory } from '@/features/loads/hooks/useMyLoadHistory'
import { LoadBoardTable } from '@/features/loads/components/LoadBoardTable'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { TableSkeleton } from '@/components/ui/Skeleton'

const STATUS_LABELS: Record<string, string> = {
  CLAIMED: 'Claimed — Ready for Pickup',
  IN_TRANSIT: 'In Transit',
}

const STATUS_NEXT_STEP: Record<string, string> = {
  CLAIMED: 'Head to the pickup location and mark the load as picked up when you arrive.',
  IN_TRANSIT: 'You\'re on the road — mark the load as delivered when you reach the destination.',
}

const STATUS_COLORS: Record<string, string> = {
  CLAIMED: 'border-amber-200 bg-amber-50',
  IN_TRANSIT: 'border-indigo-200 bg-indigo-50',
}

const STATUS_TEXT_COLORS: Record<string, string> = {
  CLAIMED: 'text-amber-700',
  IN_TRANSIT: 'text-indigo-700',
}

export function TruckerDashboard() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const { data, isLoading, isError, isFetching } = useLoadBoard(page)
  const { data: activeLoad, isLoading: isLoadingActiveLoad } = useMyActiveLoad()
  const [historyPage, setHistoryPage] = useState(0)
  const { data: history } = useMyLoadHistory(historyPage)

  const hasActiveLoad = !isLoadingActiveLoad && !!activeLoad

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ['board'] })
    queryClient.invalidateQueries({ queryKey: ['my-active-load'] })
    queryClient.invalidateQueries({ queryKey: ['my-load-history'] })
  }

  const estimatedTotal =
    activeLoad?.payRateType === 'PER_MILE' && activeLoad.distanceMiles != null
      ? activeLoad.payRate * activeLoad.distanceMiles
      : null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">FreightClub</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.firstName} {user?.lastName}
          </span>
          <Button variant="secondary" onClick={handleRefresh} isLoading={isFetching}>
            Refresh
          </Button>
          <Link to="/profile" className="text-sm text-primary-600 hover:underline">
            My Profile
          </Link>
          <Button variant="secondary" onClick={logout}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        {activeLoad && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Active Load</h2>
            <div
              className={`rounded-xl border p-5 ${STATUS_COLORS[activeLoad.status] ?? 'border-primary-200 bg-primary-50'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${STATUS_TEXT_COLORS[activeLoad.status] ?? 'text-primary-700'}`}>
                    {STATUS_LABELS[activeLoad.status] ?? activeLoad.status}
                  </p>
                  <p className="text-gray-900 font-semibold text-lg truncate">
                    {activeLoad.origin} → {activeLoad.destination}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-gray-600">
                    {activeLoad.distanceMiles != null && (
                      <span>{activeLoad.distanceMiles.toLocaleString()} mi</span>
                    )}
                    <span>
                      ${activeLoad.payRate.toLocaleString()}
                      <span className="text-xs text-gray-400 ml-0.5">
                        {activeLoad.payRateType === 'PER_MILE' ? '/mi' : ' flat'}
                      </span>
                    </span>
                    {estimatedTotal != null && (
                      <span className="font-medium text-gray-800">
                        ≈ ${estimatedTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} total
                      </span>
                    )}
                    <span>Pickup {new Date(activeLoad.pickupFrom).toLocaleDateString()}</span>
                    <span>Deliver by {new Date(activeLoad.deliveryTo).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link to={`/trucker/loads/${activeLoad.id}`}>
                  <Button>View Load</Button>
                </Link>
              </div>
              {activeLoad.shipperContact && (
                <div className="mt-4 pt-4 border-t border-current border-opacity-20 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <span className="font-medium text-gray-700">
                    {activeLoad.shipperContact.businessName ?? activeLoad.shipperContact.name}
                  </span>
                  {activeLoad.shipperContact.phone && (
                    <a
                      href={`tel:${activeLoad.shipperContact.phone}`}
                      className="text-primary-600 hover:underline"
                    >
                      {activeLoad.shipperContact.phone}
                    </a>
                  )}
                  <a
                    href={`mailto:${activeLoad.shipperContact.email}`}
                    className="text-primary-600 hover:underline"
                  >
                    {activeLoad.shipperContact.email}
                  </a>
                </div>
              )}
              {STATUS_NEXT_STEP[activeLoad.status] && (
                <p className={`mt-3 text-sm ${STATUS_TEXT_COLORS[activeLoad.status]}`}>
                  {STATUS_NEXT_STEP[activeLoad.status]}
                </p>
              )}
            </div>
          </section>
        )}

        {!user?.equipmentType && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            No equipment type set on your profile — you're seeing all open loads.{' '}
            <Link to="/profile" className="font-medium underline hover:text-amber-900">
              Update your profile
            </Link>{' '}
            to see only loads that match your truck.
          </div>
        )}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Load Board</h2>
              <p className="mt-1 text-gray-600 text-sm">
                {hasActiveLoad
                  ? 'Complete your active load before claiming another.'
                  : 'Browse open loads and claim one to get started.'}
              </p>
            </div>
            {data && data.totalElements > 0 && (
              <span className="text-sm text-gray-500">{data.totalElements} available</span>
            )}
          </div>

          {isError && <ErrorBanner message="Failed to load the board. Please try again." />}

          {isLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <>
              <div className={hasActiveLoad ? 'opacity-50 pointer-events-none select-none' : ''}>
                <LoadBoardTable loads={data?.content ?? []} />
              </div>

              {data && data.totalPages > 1 && !hasActiveLoad && (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Page {data.number + 1} of {data.totalPages} ({data.totalElements} loads)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={data.number === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={data.number >= data.totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">History</h2>
          {!history || history.totalElements === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="text-gray-400 text-sm">No past loads yet.</p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Route', 'Distance', 'Pay', 'Status', 'Pickup', 'Delivery'].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.content.map((load) => {
                      const isCancelled = load.status === 'CANCELLED'
                      const total =
                        !isCancelled && load.payRateType === 'PER_MILE' && load.distanceMiles != null
                          ? load.payRate * load.distanceMiles
                          : null
                      return (
                        <tr
                          key={load.id}
                          className="hover:bg-primary-50 cursor-pointer transition-colors"
                          onClick={() => navigate(`/trucker/loads/${load.id}`)}
                        >
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-900">{load.origin}</p>
                            <p className="text-xs text-gray-500 mt-0.5">→ {load.destination}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {load.distanceMiles != null
                              ? `${load.distanceMiles.toLocaleString()} mi`
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            {isCancelled ? (
                              <span className="text-sm text-gray-400">—</span>
                            ) : (
                              <>
                                <p className="text-sm font-medium text-gray-900">
                                  ${load.payRate.toLocaleString()}
                                  <span className="text-xs font-normal text-gray-500 ml-0.5">
                                    {load.payRateType === 'PER_MILE' ? '/mi' : ' flat'}
                                  </span>
                                </p>
                                {total != null && (
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    ≈ ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                  </p>
                                )}
                              </>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                isCancelled
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {load.status.toLowerCase().replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {isCancelled ? '—' : new Date(load.pickupFrom).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {isCancelled ? '—' : new Date(load.deliveryTo).toLocaleDateString()}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {history.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Page {history.number + 1} of {history.totalPages} (
                    {history.totalElements} loads)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setHistoryPage((p) => p - 1)}
                      disabled={history.number === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setHistoryPage((p) => p + 1)}
                      disabled={history.number >= history.totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  )
}
