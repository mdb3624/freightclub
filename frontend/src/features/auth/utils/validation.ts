/**
 * Email validation using regex.
 * Simplified RFC 5322 pattern: allows most practical email formats.
 * @param email - Email address to validate
 * @returns Error message if invalid, undefined if valid
 */
export function validateEmail(email: string): string | undefined {
  if (!email || !email.trim()) {
    return 'Email is required'
  }

  // Simplified RFC 5322: allows alphanumeric, dots, hyphens, underscores, plus
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Enter a valid email'
  }

  return undefined
}

/**
 * Password validation (server-side complexity enforcement).
 * Client-side only checks for required field.
 * @param password - Password to validate
 * @returns Error message if invalid, undefined if valid
 */
export function validatePassword(password: string): string | undefined {
  if (!password || !password.trim()) {
    return 'Password is required'
  }

  return undefined
}

/**
 * Form-level validation combining all fields.
 */
export interface LoginFormErrors {
  email?: string
  password?: string
}

export function validateLoginForm(
  email: string,
  password: string
): LoginFormErrors {
  const errors: LoginFormErrors = {}

  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError

  const passwordError = validatePassword(password)
  if (passwordError) errors.password = passwordError

  return errors
}
