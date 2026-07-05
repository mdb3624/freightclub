import { computeBreakdown } from '../utils/profitability'
import type { CostProfile, ProfitabilityTier } from '../utils/profitability'
import type { Load } from '../types'
import { usePersonaTheme } from '@/contexts/PersonaThemeContext'

interface ProfitabilityCardProps {
  load: Load
  costProfile: CostProfile
}

const fmt = (n: number) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const CARRIER_TIER_CLASSES: Record<ProfitabilityTier, string> = {
  green: 'bg-[rgba(39,174,96,.12)] text-[#27AE60]',
  yellow: 'bg-[rgba(245,158,11,.12)] text-[#F59E0B]',
  red: 'bg-[rgba(239,68,68,.12)] text-[#EF4444]',
  unknown: 'bg-carrier-border text-carrier-text-muted',
}
const SHIPPER_TIER_CLASSES: Record<ProfitabilityTier, string> = {
  green: 'bg-green-50 text-green-800',
  yellow: 'bg-amber-50 text-amber-800',
  unknown: 'bg-gray-50 text-gray-600',
  red: 'bg-red-50 text-red-800',
}

export function ProfitabilityCard({ load, costProfile }: ProfitabilityCardProps) {
  const bd = computeBreakdown(load, costProfile)
  const { persona, surfaceClassName, textClassName, mutedClassName } = usePersonaTheme()
  const isCarrier = persona === 'carrier'
  if (bd == null) return null

  const containerClass = isCarrier
    ? `${surfaceClassName} p-6 mt-4`
    : 'rounded-xl border border-gray-200 bg-white p-6 mt-4'
  const headingClass = isCarrier
    ? `text-sm font-semibold ${mutedClassName} uppercase tracking-wide mb-4`
    : 'text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4'
  const dividerClass = isCarrier ? 'col-span-2 border-t border-carrier-border mt-1' : 'col-span-2 border-t border-gray-100 mt-1'
  const negativeClass = isCarrier ? 'font-medium text-[#EF4444]' : 'font-medium text-red-600'
  const netProfitClass = (positive: boolean) => isCarrier
    ? `font-semibold ${positive ? 'text-[#27AE60]' : 'text-[#EF4444]'}`
    : `font-semibold ${positive ? 'text-green-700' : 'text-red-700'}`

  return (
    <div className={containerClass}>
      <h3 className={headingClass}>
        Profitability Breakdown
      </h3>

      <div className={`grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm ${isCarrier ? textClassName : ''}`}>
        <span className={isCarrier ? mutedClassName : 'text-gray-600'}>Estimated Revenue</span>
        <span className={isCarrier ? `font-medium ${textClassName}` : 'font-medium text-gray-900'}>{fmt(bd.estimatedRevenue)}</span>

        {bd.estimatedFuelCost != null && (
          <>
            <span className={isCarrier ? mutedClassName : 'text-gray-600'}>Est. Fuel Cost</span>
            <span className={negativeClass}>− {fmt(bd.estimatedFuelCost)}</span>
          </>
        )}

        {bd.estimatedMaintenanceCost != null && (
          <>
            <span className={isCarrier ? mutedClassName : 'text-gray-600'}>Est. Maintenance</span>
            <span className={negativeClass}>− {fmt(bd.estimatedMaintenanceCost)}</span>
          </>
        )}

        {bd.estimatedNetProfit != null && (
          <>
            <span className={dividerClass} />
            <span className={isCarrier ? `${textClassName} font-semibold` : 'text-gray-700 font-semibold'}>Est. Net Profit</span>
            <span className={netProfitClass(bd.estimatedNetProfit >= 0)}>
              {fmt(bd.estimatedNetProfit)}
            </span>
          </>
        )}

        <span className={dividerClass} />

        <span className={isCarrier ? mutedClassName : 'text-gray-600'}>Effective RPM</span>
        <span className={isCarrier ? `font-medium ${textClassName}` : 'font-medium text-gray-900'}>${bd.rpm.toFixed(2)}/mi</span>

        {bd.minRpm != null && (
          <>
            <span className={isCarrier ? mutedClassName : 'text-gray-600'}>Your Minimum RPM</span>
            <span className={isCarrier ? `font-medium ${mutedClassName}` : 'font-medium text-gray-500'}>${bd.minRpm.toFixed(2)}/mi</span>
          </>
        )}
      </div>

      {bd.minRpm != null && (
        <div className={`mt-4 rounded-md px-3 py-2 text-xs font-medium ${
          (isCarrier ? CARRIER_TIER_CLASSES : SHIPPER_TIER_CLASSES)[bd.tier]
        }`}>
          {bd.tier === 'green'  && '✓ This load meets your minimum rate target.'}
          {bd.tier === 'yellow' && '⚠ This load is slightly below your minimum rate.'}
          {bd.tier === 'red'    && '✕ This load is below your break-even rate.'}
        </div>
      )}

      {bd.minRpm == null && (
        isCarrier ? (
          <div className="mt-4 rounded-md border border-[#F59E0B]/40 bg-[rgba(245,158,11,.08)] px-3 py-2.5">
            <p className="text-sm font-medium text-[#F59E0B]">Cost profile not set</p>
            <p className={`text-xs ${mutedClassName} mt-0.5`}>
              <a href="/profile" className="underline hover:text-carrier-accent">Set up your cost profile</a>
              {' '}to see color-coded profitability and your minimum RPM.
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
            <p className="text-sm font-medium text-amber-800">Cost profile not set</p>
            <p className="text-xs text-amber-700 mt-0.5">
              <a href="/profile" className="underline hover:text-amber-900">Set up your cost profile</a>
              {' '}to see color-coded profitability and your minimum RPM.
            </p>
          </div>
        )
      )}
    </div>
  )
}
