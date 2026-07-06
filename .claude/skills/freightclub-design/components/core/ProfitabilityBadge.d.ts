import { CSSProperties } from 'react'

export interface ProfitabilityBadgeProps {
  /** Revenue per mile ($/mi) */
  rpm?: number | null
  /** Trucker's minimum RPM from cost profile */
  minRpm?: number | null
  style?: CSSProperties
}

export declare function ProfitabilityBadge(props: ProfitabilityBadgeProps): JSX.Element
