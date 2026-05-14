import { computeEarningSummary } from '../utils/earningSummary'
import { StatCard } from '@/components/ui/StatCard'
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
        <StatCard label="Loads Completed" value={s.loadsCount} />
        <StatCard label="Total Miles" value={s.totalMiles.toLocaleString()} />
        <StatCard
          label="Total Revenue"
          value={`$${s.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        />
        <StatCard
          label="Effective CPM"
          value={s.effectiveCpm != null ? `$${s.effectiveCpm.toFixed(2)}` : '—'}
          sub={s.effectiveCpm != null ? 'per mile' : undefined}
        />
      </div>
    </div>
  )
}
