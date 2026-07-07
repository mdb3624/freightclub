import { forwardRef, type InputHTMLAttributes, type CSSProperties } from 'react'
import { usePersonaTheme } from '@/contexts/PersonaThemeContext'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  testId?: string
}

// Shipper persona (default) — Classic Cream & Metallic Bronze, light surfaces.
const SHIPPER_BASE: CSSProperties = {
  height: '40px',
  padding: '8px 12px',
  border: '1px solid #D0D0D0',
  borderRadius: '4px',
  fontSize: '14px',
  fontFamily: 'Inter, ui-sans-serif, sans-serif',
  background: '#FFFFFF',
  color: '#1A1A1A',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border 150ms ease, box-shadow 150ms ease',
}
const SHIPPER_LABEL_COLOR = '#1A1A1A'
const SHIPPER_FOCUS_BORDER = '2px solid #B08D57'
const SHIPPER_FOCUS_SHADOW = '0 0 0 3px rgba(176,141,87,0.10)'
const SHIPPER_BLUR_BORDER = '1px solid #D0D0D0'
const SHIPPER_DISABLED: CSSProperties = { background: '#F8F9FB', cursor: 'not-allowed', opacity: 0.7 }

// Carrier persona — Luxury Industrial dark mode. Hex values match the
// carrier-* Tailwind tokens in tailwind.config.ts exactly (no custom colors).
const CARRIER_BASE: CSSProperties = {
  ...SHIPPER_BASE,
  border: '1px solid #2A2A2A', // carrier-border
  background: '#1A1A1A', // carrier-surface
  color: '#F5F5F5', // carrier-text
}
const CARRIER_LABEL_COLOR = '#C9A876' // carrier-text-muted / carrier-accent
const CARRIER_FOCUS_BORDER = '2px solid #C9A876'
const CARRIER_FOCUS_SHADOW = '0 0 0 3px rgba(201,168,118,0.10)'
const CARRIER_BLUR_BORDER = '1px solid #2A2A2A'
const CARRIER_DISABLED: CSSProperties = { background: '#121212', cursor: 'not-allowed', opacity: 0.7 }

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (props, forwardedRef) => {
    const { label, error, id, testId, className = '', ref: registerRef, style: extraStyle, disabled, ...inputProps } = props as any
    const { persona } = usePersonaTheme()
    const isCarrier = persona === 'carrier'
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : '')
    const errorId = `${inputId}-error`
    const finalRef = registerRef || forwardedRef

    const base = isCarrier ? CARRIER_BASE : SHIPPER_BASE
    const labelColor = isCarrier ? CARRIER_LABEL_COLOR : SHIPPER_LABEL_COLOR
    const focusBorder = isCarrier ? CARRIER_FOCUS_BORDER : SHIPPER_FOCUS_BORDER
    const focusShadow = isCarrier ? CARRIER_FOCUS_SHADOW : SHIPPER_FOCUS_SHADOW
    const blurBorder = isCarrier ? CARRIER_BLUR_BORDER : SHIPPER_BLUR_BORDER
    const disabledStyle = isCarrier ? CARRIER_DISABLED : SHIPPER_DISABLED

    const inputStyle: CSSProperties = {
      ...base,
      ...(disabled ? disabledStyle : {}),
      ...(error
        ? { border: '2px solid #E74C3C' }
        : {}),
      ...extraStyle,
    }

    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        {label && (
          <label htmlFor={inputId} style={{ fontSize: '14px', fontWeight: 500, color: labelColor }}>
            {label}
          </label>
        )}
        <input
          ref={finalRef}
          id={inputId}
          data-testid={testId}
          disabled={disabled}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          style={inputStyle}
          onFocus={e => {
            if (!error) {
              e.currentTarget.style.border = focusBorder
              e.currentTarget.style.boxShadow = focusShadow
            }
          }}
          onBlur={e => {
            e.currentTarget.style.border = error ? '2px solid #E74C3C' : blurBorder
            e.currentTarget.style.boxShadow = 'none'
          }}
          {...inputProps}
        />
        {error && (
          <p
            id={errorId}
            role="alert"
            data-testid={testId ? `${testId}-error` : undefined}
            style={{ fontSize: '12px', fontStyle: 'italic', color: '#E74C3C', marginTop: '4px' }}
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
