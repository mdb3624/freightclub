import type { Load, LoadSummary } from '../types'

export interface CostProfile {
  monthlyFixedCosts: number | null
  fuelCostPerGallon: number | null
  milesPerGallon: number | null
  maintenanceCostPerMile: number | null
  monthlyMilesTarget: number | null
  targetMarginPerMile: number | null
}

/** Rate per mile for a load, or null if it cannot be calculated */
export function computeRpm(
  load: Pick<LoadSummary, 'payRate' | 'payRateType' | 'distanceMiles'>
): number | null {
  if (load.payRateType === 'PER_MILE') return load.payRate
  if (load.distanceMiles != null && load.distanceMiles > 0) {
    return load.payRate / load.distanceMiles
  }
  return null
}

/** Minimum acceptable RPM from the trucker's cost profile, or null if profile is incomplete */
export function computeMinRpm(profile: CostProfile): number | null {
  const { monthlyFixedCosts, fuelCostPerGallon, milesPerGallon,
          maintenanceCostPerMile, monthlyMilesTarget, targetMarginPerMile } = profile
  if (monthlyMilesTarget == null || monthlyMilesTarget <= 0) return null
  const fixedCpm = (monthlyFixedCosts ?? 0) / monthlyMilesTarget
  const fuelCpm = (fuelCostPerGallon != null && milesPerGallon != null && milesPerGallon > 0)
    ? fuelCostPerGallon / milesPerGallon
    : 0
  const variableCpm = fuelCpm + (maintenanceCostPerMile ?? 0)
  return fixedCpm + variableCpm + (targetMarginPerMile ?? 0)
}

export type ProfitabilityTier = 'green' | 'yellow' | 'red' | 'unknown'

export function computeProfitabilityTier(
  rpm: number | null,
  minRpm: number | null
): ProfitabilityTier {
  if (rpm == null || minRpm == null) return 'unknown'
  if (rpm >= minRpm) return 'green'
  if (rpm >= minRpm * 0.9) return 'yellow'
  return 'red'
}

export interface ProfitabilityBreakdown {
  rpm: number
  minRpm: number | null
  tier: ProfitabilityTier
  estimatedRevenue: number
  estimatedFuelCost: number | null
  estimatedMaintenanceCost: number | null
  estimatedNetProfit: number | null
}

export function computeBreakdown(
  load: Pick<Load, 'payRate' | 'payRateType' | 'distanceMiles'>,
  profile: CostProfile
): ProfitabilityBreakdown | null {
  const rpm = computeRpm(load)
  if (rpm == null) return null

  const { distanceMiles } = load
  const estimatedRevenue =
    load.payRateType === 'PER_MILE' && distanceMiles != null
      ? load.payRate * distanceMiles
      : load.payRate

  let estimatedFuelCost: number | null = null
  let estimatedMaintenanceCost: number | null = null
  if (distanceMiles != null) {
    if (profile.fuelCostPerGallon != null && profile.milesPerGallon != null && profile.milesPerGallon > 0) {
      estimatedFuelCost = (distanceMiles / profile.milesPerGallon) * profile.fuelCostPerGallon
    }
    if (profile.maintenanceCostPerMile != null) {
      estimatedMaintenanceCost = distanceMiles * profile.maintenanceCostPerMile
    }
  }

  const minRpm = computeMinRpm(profile)
  const estimatedNetProfit =
    estimatedFuelCost != null && estimatedMaintenanceCost != null
      ? estimatedRevenue - estimatedFuelCost - estimatedMaintenanceCost
      : null

  return {
    rpm,
    minRpm,
    tier: computeProfitabilityTier(rpm, minRpm),
    estimatedRevenue,
    estimatedFuelCost,
    estimatedMaintenanceCost,
    estimatedNetProfit,
  }
}
