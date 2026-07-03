import { InputHTMLAttributes, CSSProperties } from 'react'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'style'> {
  /** Renders a <label> above the input */
  label?: string
  /** Error message — turns border red and shows below input */
  error?: string
  /** Helper text shown when no error */
  helper?: string
  style?: CSSProperties
  containerStyle?: CSSProperties
}

export declare function Input(props: InputProps): JSX.Element
