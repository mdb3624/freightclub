import { computeEarningSummary } from '../utils/earningSummary'
import type { LoadSummary } from '../types'

interface EarningSummaryCardProps {
  loads: LoadSummary[]
}

export function EarningSummaryCard({ loads }: EarningSummaryCardProps) {
  const s = computeEarningSummary(loads)
  if (s.loadsCount === 0) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Last 30 Days
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-xs text-gray-500">Loads Completed</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{s.loadsCount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Miles</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">
            {s.totalMiles.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">
            ${s.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Effective CPM</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">
            {s.effectiveCpm != null ? `$${s.effectiveCpm.toFixed(2)}` : '—'}
          </p>
          {s.effectiveCpm != null && (
            <p className="text-xs text-gray-400">per mile</p>
          )}
        </div>
      </div>
    </div>
  )
}
