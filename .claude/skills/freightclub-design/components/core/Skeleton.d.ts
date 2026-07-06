import { CSSProperties } from 'react'

export interface SkeletonProps {
  variant?: 'text' | 'title' | 'avatar' | 'card' | 'badge'
  width?: number | string
  height?: number | string
  /** Number of stacked blocks to render */
  count?: number
  style?: CSSProperties
}

export declare function Skeleton(props: SkeletonProps): JSX.Element
