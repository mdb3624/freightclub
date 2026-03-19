import { computeRpm, computeMinRpm, computeProfitabilityTier } from '../utils/profitability'
import type { CostProfile } from '../utils/profitability'
import type { LoadSummary } from '../types'

const tierStyles: Record<string, string> = {
  green:   'bg-green-100 text-green-800',
  yellow:  'bg-amber-100 text-amber-800',
  red:     'bg-red-100 text-red-800',
  unknown: 'bg-gray-100 text-gray-600',
}

interface ProfitabilityBadgeProps {
  load: LoadSummary
  costProfile: CostProfile
}

export function ProfitabilityBadge({ load, costProfile }: ProfitabilityBadgeProps) {
  const rpm = computeRpm(load)
  if (rpm == null) return <span className="text-xs text-gray-400">—</span>

  const minRpm = computeMinRpm(costProfile)
  const tier = computeProfitabilityTier(rpm, minRpm)

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tierStyles[tier]}`}
      title={minRpm != null ? `Min RPM: $${minRpm.toFixed(2)}/mi` : 'Set a cost profile to see profitability'}
    >
      ${rpm.toFixed(2)}/mi
    </span>
  )
}
