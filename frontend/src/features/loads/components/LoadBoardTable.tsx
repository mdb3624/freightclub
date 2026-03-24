import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LoadSummary, BoardSortBy, BoardSortDir } from '../types'
import { PAYMENT_TERMS_LABELS } from '../types'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { ProfitabilityBadge } from './ProfitabilityBadge'
import { ShipperRepBadge } from '@/features/ratings/components/ShipperRepBadge'
import { computeRpm } from '../utils/profitability'

interface LoadBoardTableProps {
  loads: LoadSummary[]
  sortBy?: BoardSortBy
  sortDir?: BoardSortDir
  onSort?: (col: BoardSortBy) => void
}

function PickupUrgency({ pickupFrom }: { pickupFrom: string }) {
  const now = Date.now()
  const pickup = new Date(pickupFrom).getTime()
  const hoursUntil = (pickup - now) / (1000 * 60 * 60)

  if (hoursUntil < 0) {
    return (
      <div>
        <p className="text-sm text-red-600 font-medium">{new Date(pickupFrom).toLocaleDateString()}</p>
        <span className="inline-block mt-0.5 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Overdue</span>
      </div>
    )
  }
  if (hoursUntil <= 24) {
    const label = hoursUntil < 1
      ? 'Picks up soon'
      : `Picks up in ${Math.round(hoursUntil)} hr${Math.round(hoursUntil) !== 1 ? 's' : ''}`
    return (
      <div>
        <p className="text-sm text-amber-700 font-medium">{new Date(pickupFrom).toLocaleDateString()}</p>
        <span className="inline-block mt-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{label}</span>
      </div>
    )
  }
  if (hoursUntil <= 48) {
    return (
      <div>
        <p className="text-sm text-gray-600">{new Date(pickupFrom).toLocaleDateString()}</p>
        <span className="inline-block mt-0.5 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700">Picks up tomorrow</span>
      </div>
    )
  }
  return <p className="text-sm text-gray-600">{new Date(pickupFrom).toLocaleDateString()}</p>
}

export function LoadBoardTable({ loads, sortBy, sortDir, onSort }: LoadBoardTableProps) {
  const navigate = useNavigate()
  const { data: profile } = useProfile()

  const costProfile = {
    monthlyFixedCosts:      profile?.monthlyFixedCosts      ?? null,
    fuelCostPerGallon:      profile?.fuelCostPerGallon      ?? null,
    milesPerGallon:         profile?.milesPerGallon         ?? null,
    maintenanceCostPerMile: profile?.maintenanceCostPerMile ?? null,
    monthlyMilesTarget:     profile?.monthlyMilesTarget     ?? null,
    targetMarginPerMile:    profile?.targetMarginPerMile    ?? null,
  }

  // Client-side RPM sort (can't be done server-side without trucker's cost profile)
  const sortedLoads = useMemo(() => {
    if (sortBy !== 'rpm') return loads
    const withRpm = loads.map((l) => ({ load: l, rpm: computeRpm(l) }))
    withRpm.sort((a, b) => {
      if (a.rpm == null && b.rpm == null) return 0
      if (a.rpm == null) return 1
      if (b.rpm == null) return -1
      return sortDir === 'asc' ? a.rpm - b.rpm : b.rpm - a.rpm
    })
    return withRpm.map((x) => x.load)
  }, [loads, sortBy, sortDir])

  function SortHeader({ col, label }: { col: BoardSortBy; label: string }) {
    const active = sortBy === col
    const icon = active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''
    return (
      <th
        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-800 select-none"
        onClick={() => onSort?.(col)}
      >
        {label}{icon}
      </th>
    )
  }

  if (loads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-gray-400 text-sm">No open loads right now. Check back soon.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Route</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Shipper</th>
            <SortHeader col="distance" label="Distance" />
            <SortHeader col="pickupDate" label="Pickup" />
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Equipment</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Pay</th>
            <SortHeader col="rpm" label="RPM" />
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Terms</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedLoads.map((load) => {
            const estimatedTotal =
              load.payRateType === 'PER_MILE' && load.distanceMiles != null
                ? load.payRate * load.distanceMiles
                : null

            return (
              <tr
                key={load.id}
                className="hover:bg-primary-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/trucker/loads/${load.id}`)}
              >
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{load.origin}</p>
                  <p className="text-xs text-gray-500 mt-0.5">→ {load.destination}</p>
                </td>
                <td className="px-4 py-3">
                  <ShipperRepBadge
                    avgStars={load.shipperAvgStars}
                    totalRatings={load.shipperRatingCount}
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {load.distanceMiles != null
                    ? `${load.distanceMiles.toLocaleString()} mi`
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <PickupUrgency pickupFrom={load.pickupFrom} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {load.equipmentType.replace(/_/g, ' ')}
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">
                    ${load.payRate.toLocaleString()}
                    <span className="text-xs font-normal text-gray-500 ml-0.5">
                      {load.payRateType === 'PER_MILE' ? '/mi' : ' flat'}
                    </span>
                  </p>
                  {estimatedTotal != null && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      ≈ ${estimatedTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} est.
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ProfitabilityBadge load={load} costProfile={costProfile} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {load.paymentTerms
                    ? PAYMENT_TERMS_LABELS[load.paymentTerms]
                    : <span className="text-gray-300">—</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
