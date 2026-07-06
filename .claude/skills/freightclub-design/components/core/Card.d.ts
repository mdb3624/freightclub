import { CSSProperties } from 'react'

export interface CardProps {
  /** Persona context — shipper (cream/white) or carrier (dark) */
  persona?: 'shipper' | 'carrier'
  /** Internal padding */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  /** Elevates box-shadow on hover */
  hover?: boolean
  children?: React.ReactNode
  style?: CSSProperties
  onClick?: () => void
}

export declare function Card(props: CardProps): JSX.Element
