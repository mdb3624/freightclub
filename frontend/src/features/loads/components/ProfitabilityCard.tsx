import { computeBreakdown } from '../utils/profitability'
import type { CostProfile } from '../utils/profitability'
import type { Load } from '../types'

interface ProfitabilityCardProps {
  load: Load
  costProfile: CostProfile
}

const fmt = (n: number) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function ProfitabilityCard({ load, costProfile }: ProfitabilityCardProps) {
  const bd = computeBreakdown(load, costProfile)
  if (bd == null) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 mt-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
        Profitability Breakdown
      </h3>

      <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
        <span className="text-gray-600">Estimated Revenue</span>
        <span className="font-medium text-gray-900">{fmt(bd.estimatedRevenue)}</span>

        {bd.estimatedFuelCost != null && (
          <>
            <span className="text-gray-600">Est. Fuel Cost</span>
            <span className="font-medium text-red-600">− {fmt(bd.estimatedFuelCost)}</span>
          </>
        )}

        {bd.estimatedMaintenanceCost != null && (
          <>
            <span className="text-gray-600">Est. Maintenance</span>
            <span className="font-medium text-red-600">− {fmt(bd.estimatedMaintenanceCost)}</span>
          </>
        )}

        {bd.estimatedNetProfit != null && (
          <>
            <span className="col-span-2 border-t border-gray-100 mt-1" />
            <span className="text-gray-700 font-semibold">Est. Net Profit</span>
            <span className={`font-semibold ${bd.estimatedNetProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {fmt(bd.estimatedNetProfit)}
            </span>
          </>
        )}

        <span className="col-span-2 border-t border-gray-100 mt-1" />

        <span className="text-gray-600">Effective RPM</span>
        <span className="font-medium text-gray-900">${bd.rpm.toFixed(4)}/mi</span>

        {bd.minRpm != null && (
          <>
            <span className="text-gray-600">Your Minimum RPM</span>
            <span className="font-medium text-gray-500">${bd.minRpm.toFixed(4)}/mi</span>
          </>
        )}
      </div>

      {bd.minRpm != null && (
        <div className={`mt-4 rounded-md px-3 py-2 text-xs font-medium ${
          bd.tier === 'green'  ? 'bg-green-50 text-green-800' :
          bd.tier === 'yellow' ? 'bg-amber-50 text-amber-800' :
                                 'bg-red-50 text-red-800'
        }`}>
          {bd.tier === 'green'  && '✓ This load meets your minimum rate target.'}
          {bd.tier === 'yellow' && '⚠ This load is slightly below your minimum rate.'}
          {bd.tier === 'red'    && '✕ This load is below your break-even rate.'}
        </div>
      )}

      {bd.minRpm == null && (
        <p className="mt-3 text-xs text-gray-400">
          Set a cost profile on your profile page to see profitability color coding.
        </p>
      )}
    </div>
  )
}
