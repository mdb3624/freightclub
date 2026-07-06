import { CSSProperties } from 'react'

/**
 * @startingPoint section="Core" subtitle="KPI stat card with large number and uppercase label" viewport="700x160"
 */
export interface StatCardProps {
  /** Uppercase label below the number */
  label: string
  /** The numeric (or string) value to display prominently */
  value?: number | string | null
  /** Prepended to value (e.g. "$") */
  prefix?: string
  /** Appended to value (e.g. "%") */
  suffix?: string
  /** Colors the large number for status context */
  statusColor?: 'default' | 'green' | 'yellow' | 'red' | 'bronze'
  /** Optional smaller text below the label */
  sublabel?: string
  /** Optional icon above the number */
  icon?: React.ReactNode
  /** Shows loading skeleton */
  isLoading?: boolean
  style?: CSSProperties
}

export declare function StatCard(props: StatCardProps): JSX.Element
