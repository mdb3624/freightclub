import { CSSProperties, ButtonHTMLAttributes } from 'react'

/**
 * @startingPoint section="Core" subtitle="Bronze-gradient CTA button, persona-aware (shipper/carrier)" viewport="700x200"
 */
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  /** Visual style */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  /** Size scale */
  size?: 'sm' | 'md' | 'lg'
  /** Persona context — affects secondary/ghost background */
  persona?: 'shipper' | 'carrier'
  /** Shows spinner and disables interaction */
  isLoading?: boolean
  style?: CSSProperties
}

export declare function Button(props: ButtonProps): JSX.Element
