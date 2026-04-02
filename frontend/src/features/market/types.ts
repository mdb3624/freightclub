export interface DieselPrices {
  eastPrice: number | null
  eastDelta: number | null
  midwestPrice: number | null
  midwestDelta: number | null
  southPrice: number | null
  southDelta: number | null
  rockyPrice: number | null
  rockyDelta: number | null
  westPrice: number | null
  westDelta: number | null
  period: string | null
  stale: boolean
  available: boolean
}
