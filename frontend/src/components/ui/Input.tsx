import { forwardRef, type InputHTMLAttributes, type CSSProperties } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  testId?: string
}

const inputBase: CSSProperties = {
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

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (props, forwardedRef) => {
    const { label, error, id, testId, className = '', ref: registerRef, style: extraStyle, disabled, ...inputProps } = props as any
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : '')
    const errorId = `${inputId}-error`
    const finalRef = registerRef || forwardedRef

    const inputStyle: CSSProperties = {
      ...inputBase,
      ...(disabled ? { background: '#F8F9FB', cursor: 'not-allowed', opacity: 0.7 } : {}),
      ...(error
        ? { border: '2px solid #E74C3C' }
        : {}),
      ...extraStyle,
    }

    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        {label && (
          <label htmlFor={inputId} style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>
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
              e.currentTarget.style.border = '2px solid #B08D57'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(176,141,87,0.10)'
            }
          }}
          onBlur={e => {
            e.currentTarget.style.border = error ? '2px solid #E74C3C' : '1px solid #D0D0D0'
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
