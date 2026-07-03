import { CSSProperties } from 'react'

export interface ErrorBannerProps {
  message?: string
  children?: React.ReactNode
  style?: CSSProperties
}

export declare function ErrorBanner(props: ErrorBannerProps): JSX.Element
