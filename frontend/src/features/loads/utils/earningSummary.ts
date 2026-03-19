import type { LoadSummary } from '../types'

export interface EarningSummary {
  loadsCount: number
  totalMiles: number
  totalRevenue: number
  effectiveCpm: number | null
  windowDays: number
}

export function computeEarningSummary(loads: LoadSummary[], windowDays = 30): EarningSummary {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - windowDays)

  const completed = loads.filter(
    (l) =>
      (l.status === 'DELIVERED' || l.status === 'SETTLED') &&
      new Date(l.createdAt) >= cutoff
  )

  let totalRevenue = 0
  let totalMiles = 0

  for (const load of completed) {
    const miles = load.distanceMiles ?? 0
    totalMiles += miles
    totalRevenue += load.payRateType === 'PER_MILE' ? load.payRate * miles : load.payRate
  }

  return {
    loadsCount: completed.length,
    totalMiles,
    totalRevenue,
    effectiveCpm: totalMiles > 0 ? totalRevenue / totalMiles : null,
    windowDays,
  }
}
