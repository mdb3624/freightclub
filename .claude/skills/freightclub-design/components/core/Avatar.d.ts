import { CSSProperties } from 'react'

export interface AvatarProps {
  firstName?: string
  lastName?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  persona?: 'shipper' | 'carrier'
  style?: CSSProperties
}

export declare function Avatar(props: AvatarProps): JSX.Element
