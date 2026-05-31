import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  testId?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (props, forwardedRef) => {
    const { label, error, id, testId, className = '', ref: registerRef, ...inputProps } = props as any
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : '')
    const errorId = `${inputId}-error`
    // Use registerRef (from react-hook-form) if available, otherwise use forwardedRef
    const finalRef = registerRef || forwardedRef

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={finalRef}
          id={inputId}
          data-testid={testId}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          className={`rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className}`}
          {...inputProps}
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-600" data-testid={testId ? `${testId}-error` : undefined}>
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
