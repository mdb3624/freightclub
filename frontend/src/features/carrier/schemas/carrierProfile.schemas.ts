import { z } from 'zod'

export const CdlClassEnum = z.enum(['CLASS_A', 'CLASS_B', 'CLASS_C'])
export type CdlClass = z.infer<typeof CdlClassEnum>

export const CDL_CLASS_LABELS: Record<CdlClass, string> = {
  CLASS_A: 'Class A',
  CLASS_B: 'Class B',
  CLASS_C: 'Class C',
}

export type ExpiryStatus = 'ok' | 'warn' | 'critical' | 'expired' | 'none'

const MS_PER_DAY = 86_400_000

// Ported 1:1 from Prototype/ui_kits/carrier/carrier-profile.html's daysUntil().
export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / MS_PER_DAY)
}

// Ported 1:1 from the prototype's expiryStatus(): expired < 0d, critical <= 30d, warn <= 90d, else ok.
export function expiryStatus(dateStr: string | null | undefined): ExpiryStatus {
  const d = daysUntil(dateStr)
  if (d === null) return 'none'
  if (d < 0) return 'expired'
  if (d <= 30) return 'critical'
  if (d <= 90) return 'warn'
  return 'ok'
}

// Ported 1:1 from the prototype's expiryColor() — exact hex values from carrier-profile.html.
export function expiryColor(status: ExpiryStatus): string {
  return { expired: '#E74C3C', critical: '#E74C3C', warn: '#F59E0B', ok: '#27AE60', none: '#2A2A2A' }[status]
}

// Ported 1:1 from the prototype's expiryLabel().
export function expiryLabel(dateStr: string | null | undefined): string {
  const d = daysUntil(dateStr)
  if (d === null) return ''
  if (d < 0) return `Expired ${Math.abs(d)}d ago`
  if (d === 0) return 'Today'
  return `${d}d left`
}

// Preferred-lane cap enforced by this UI (ARCH §3: existing carrier_lanes
// table/endpoints, capped here client-side, not a schema constraint).
export const MAX_PREFERRED_LANES = 3
