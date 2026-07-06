export interface SelectOption {
  value: string | number
  label: string
}

export interface SelectProps {
  label?: string
  error?: string
  helper?: string
  options?: (string | SelectOption)[]
  placeholder?: string
  disabled?: boolean
  id?: string
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  containerStyle?: React.CSSProperties
  style?: React.CSSProperties
}

export declare function Select(props: SelectProps): JSX.Element
