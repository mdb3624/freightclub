import { CSSProperties } from 'react'

export interface BadgeProps {
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'bronze' | 'rpm_high' | 'rpm_neutral' | 'rpm_low'
  size?: 'sm' | 'md'
  /** Show a dot indicator before text */
  dot?: boolean
  children?: React.ReactNode
  style?: CSSProperties
}

export declare function Badge(props: BadgeProps): JSX.Element
