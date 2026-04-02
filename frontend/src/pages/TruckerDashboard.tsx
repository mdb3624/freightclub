import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useLoadBoard } from '@/features/loads/hooks/useLoadBoard'
import { useMyActiveLoad } from '@/features/loads/hooks/useMyActiveLoad'
import { useMyLoadHistory } from '@/features/loads/hooks/useMyLoadHistory'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { useAvailableStates } from '@/features/loads/hooks/useAvailableStates'
import { LoadBoardTable } from '@/features/loads/components/LoadBoardTable'
import { StatusBadge } from '@/features/loads/components/StatusBadge'
import { EarningSummaryCard } from '@/features/loads/components/EarningSummaryCard'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { TableSkeleton } from '@/components/ui/Skeleton'
import type { BoardFilter, BoardSortBy, BoardSortDir, EquipmentType } from '@/features/loads/types'
import { useDieselPrices } from '@/features/market/hooks/useDieselPrices'

const VALID_SORT_BY = new Set<BoardSortBy>(['pickupDate', 'distance', 'rpm'])
const VALID_SORT_DIR = new Set<BoardSortDir>(['asc', 'desc'])

function toBoardSortBy(v: string | null): BoardSortBy {
  if (!v || !VALID_SORT_BY.has(v as BoardSortBy)) return 'pickupDate'
  return v as BoardSortBy
}
function toBoardSortDir(v: string | null): BoardSortDir {
  if (!v || !VALID_SORT_DIR.has(v as BoardSortDir)) return 'asc'
  return v as BoardSortDir
}

type Tab = 'board' | 'history'


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
  const { data: dieselData } = useDieselPrices()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>('board')
  const [page, setPage] = useState(0)

  // Derive filter from URL params — equipment type is always the trucker's own, never user-selectable
  const filter: BoardFilter = {
    originState: searchParams.get('origin') ?? undefined,
    destinationState: searchParams.get('dest') ?? undefined,
    equipmentType: (user?.equipmentType as EquipmentType) ?? undefined,
    pickupDate: searchParams.get('pickupDate') ?? undefined,
    deliveryDate: searchParams.get('deliveryDate') ?? undefined,
    sortBy: toBoardSortBy(searchParams.get('sortBy')),
    sortDir: toBoardSortDir(searchParams.get('sortDir')),
  }

  const setFilter = useCallback((updater: (prev: BoardFilter) => BoardFilter) => {
    setSearchParams((prev) => {
      const current: BoardFilter = {
        originState: prev.get('origin') ?? undefined,
        destinationState: prev.get('dest') ?? undefined,
        equipmentType: (user?.equipmentType as EquipmentType) ?? undefined,
        pickupDate: prev.get('pickupDate') ?? undefined,
        deliveryDate: prev.get('deliveryDate') ?? undefined,
        sortBy: toBoardSortBy(prev.get('sortBy')),
        sortDir: toBoardSortDir(prev.get('sortDir')),
      }
      const next = updater(current)
      const params = new URLSearchParams()
      if (next.originState) params.set('origin', next.originState)
      if (next.destinationState) params.set('dest', next.destinationState)
      if (next.pickupDate) params.set('pickupDate', next.pickupDate)
      if (next.deliveryDate) params.set('deliveryDate', next.deliveryDate)
      if (next.sortBy && next.sortBy !== 'pickupDate') params.set('sortBy', next.sortBy)
      if (next.sortDir && next.sortDir !== 'asc') params.set('sortDir', next.sortDir)
      return params
    }, { replace: true })
    setPage(0)
  }, [setSearchParams, user?.equipmentType])
  const { data, isLoading, isError } = useLoadBoard(page, filter)
  const { data: activeLoad, isLoading: isLoadingActiveLoad } = useMyActiveLoad()
  const { data: profile } = useProfile()
  const { data: availableStates } = useAvailableStates()
  const [historyPage, setHistoryPage] = useState(0)
  const { data: history } = useMyLoadHistory(historyPage)
  const activeLoadRef = useRef<HTMLElement>(null)

  const hasActiveLoad = !isLoadingActiveLoad && !!activeLoad
  const hasCostProfile = !!(
    profile?.monthlyFixedCosts != null ||
    profile?.fuelCostPerGallon != null ||
    profile?.milesPerGallon != null ||
    profile?.maintenanceCostPerMile != null
  )

  // Scroll to active load section when returning from a claim action
  useEffect(() => {
    if (location.state?.scrollToActive && activeLoad && activeLoadRef.current) {
      activeLoadRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.state, activeLoad])

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ['board'] })
    queryClient.invalidateQueries({ queryKey: ['my-active-load'] })
    queryClient.invalidateQueries({ queryKey: ['my-load-history'] })
  }

  function handleSort(col: BoardSortBy) {
    setFilter((f) => {
      if (f.sortBy === col) {
        // cycle: asc → desc → default (pickupDate asc)
        if (f.sortDir === 'asc') return { ...f, sortDir: 'desc' }
        return { ...f, sortBy: 'pickupDate', sortDir: 'asc' }
      }
      return { ...f, sortBy: col, sortDir: 'asc' }
    })
  }

  const estimatedTotal =
    activeLoad?.payRateType === 'PER_MILE' && activeLoad.distanceMiles != null
      ? activeLoad.payRate * activeLoad.distanceMiles
      : null

  const dieselRegions = useMemo(() => {
    if (!dieselData?.available) return []
    const fmt = (p: number) => `$${p.toFixed(2)}`
    const delta = (d: number | null | undefined) => d != null ? `${d >= 0 ? '+' : ''}$${Math.abs(d).toFixed(2)}` : null
    return [
      { label: 'East', price: dieselData.eastPrice,    d: dieselData.eastDelta },
      { label: 'Midwest', price: dieselData.midwestPrice, d: dieselData.midwestDelta },
      { label: 'Gulf Coast', price: dieselData.southPrice,   d: dieselData.southDelta },
      { label: 'Rocky Mtn', price: dieselData.rockyPrice,   d: dieselData.rockyDelta },
      { label: 'West', price: dieselData.westPrice,    d: dieselData.westDelta },
    ].filter(r => r.price != null).map(r => ({ ...r, fmt: fmt(r.price!), delta: delta(r.d), up: (r.d ?? 0) > 0 }))
  }, [dieselData])

  return (
    <AppShell maxWidth="5xl">
      {dieselRegions.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-xs">
          <span className="font-semibold uppercase tracking-wide text-gray-500">Diesel Prices</span>
          {dieselRegions.map(r => (
            <span key={r.label} className="flex items-center gap-1">
              <span className="text-gray-500">{r.label}</span>
              <span className="font-semibold text-gray-900">{r.fmt}</span>
              {r.delta && <span className={r.up ? 'text-red-500' : 'text-green-600'}>{r.delta}</span>}
            </span>
          ))}
          {dieselData?.period && <span className="ml-auto text-gray-400">Week of {dieselData.period}</span>}
        </div>
      )}
      <div className="space-y-8">
        {activeLoad && (
          <section ref={activeLoadRef}>
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
                    {activeLoad.originCity}, {activeLoad.originState} → {activeLoad.destinationCity}, {activeLoad.destinationState}
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

        {profile !== undefined && !hasCostProfile && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-4">
            <p className="text-sm font-semibold text-blue-900">
              Set up your cost profile to see profitability ratings on loads.
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Without a cost profile, RPM badges and profitability breakdowns will be empty.
            </p>
            <Link
              to="/profile"
              className="mt-2 inline-block text-sm font-medium text-blue-700 underline hover:text-blue-900"
            >
              Set up cost profile →
            </Link>
          </div>
        )}

        {/* Tab bar */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-6" aria-label="Dashboard tabs">
            {([
              { id: 'board', label: 'Load Board' },
              { id: 'history', label: 'History' },
            ] as { id: Tab; label: string }[]).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                aria-selected={tab === id}
                role="tab"
              >
                {label}
                {id === 'history' && history && history.totalElements > 0 && (
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {history.totalElements}
                  </span>
                )}
                {id === 'board' && data && data.totalElements > 0 && (
                  <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    {data.totalElements}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {tab === 'board' && (
        <section>
<div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {hasActiveLoad
                ? 'Complete your active load before claiming another.'
                : 'Browse open loads and claim one to get started.'}
            </p>
            <Button variant="secondary" onClick={handleRefresh}>Refresh</Button>
          </div>

          <div className="mb-4 flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Origin State</label>
              <select
                className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filter.originState ?? ''}
                onChange={(e) => {
                  setFilter((f) => ({ ...f, originState: e.target.value || undefined }))
                  setPage(0)
                }}
              >
                <option value="">Any</option>
                {(availableStates?.originStates ?? []).map((abbr) => (
                  <option key={abbr} value={abbr}>{abbr}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Dest. State</label>
              <select
                className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filter.destinationState ?? ''}
                onChange={(e) => {
                  setFilter((f) => ({ ...f, destinationState: e.target.value || undefined }))
                  setPage(0)
                }}
              >
                <option value="">Any</option>
                {(availableStates?.destinationStates ?? []).map((abbr) => (
                  <option key={abbr} value={abbr}>{abbr}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Pickup Date</label>
              <input
                type="date"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filter.pickupDate ?? ''}
                onChange={(e) => {
                  setFilter((f) => ({ ...f, pickupDate: e.target.value || undefined }))
                  setPage(0)
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Delivery Date</label>
              <input
                type="date"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filter.deliveryDate ?? ''}
                onChange={(e) => {
                  setFilter((f) => ({ ...f, deliveryDate: e.target.value || undefined }))
                  setPage(0)
                }}
              />
            </div>
            {(filter.originState || filter.destinationState || filter.pickupDate || filter.deliveryDate) && (
              <Button
                variant="secondary"
                onClick={() => {
                  setFilter(() => ({ equipmentType: user?.equipmentType as EquipmentType | undefined }))
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {isError && <ErrorBanner message="Failed to load the board. Please try again." />}

          {isLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <>
              <div className="relative">
                <div className={hasActiveLoad ? 'opacity-40 pointer-events-none select-none' : ''}>
                  <LoadBoardTable
                    loads={data?.content ?? []}
                    sortBy={filter.sortBy}
                    sortDir={filter.sortDir}
                    onSort={handleSort}
                  />
                </div>
                {hasActiveLoad && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-lg border border-amber-200 bg-white shadow-sm px-6 py-4 text-center max-w-sm">
                      <p className="text-sm font-semibold text-amber-800">Active load in progress</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Deliver your current load before claiming another.
                      </p>
                    </div>
                  </div>
                )}
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
        )}

        {tab === 'history' && (
        <section>
          <h2 className="sr-only">History</h2>
          {history && history.content.length > 0 && (
            <EarningSummaryCard loads={history.content} />
          )}
          {!history || history.totalElements === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="text-gray-400 text-sm">No past loads yet.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
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
                            <StatusBadge status={load.status} />
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
        )}
      </div>
    </AppShell>
  )
}
