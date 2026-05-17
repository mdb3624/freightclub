import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLogin } from '../hooks/useLogin'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { validateLoginForm } from '../utils/validation'
import type { LoginFormValues } from '../types'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types'

export function LoginForm() {
  const { mutate, isPending, error } = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({})

  const apiErrorMessage = error
    ? ((error as AxiosError<ApiError>).response?.data?.message ?? 'Login failed. Please try again.')
    : null

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    const errors = validateLoginForm(value, password)
    setValidationErrors(prev => ({ ...prev, email: errors.email }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    const errors = validateLoginForm(email, value)
    setValidationErrors(prev => ({ ...prev, password: errors.password }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errors = validateLoginForm(email, password)

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    mutate({ email, password } as LoginFormValues)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {apiErrorMessage && <ErrorBanner message={apiErrorMessage} />}

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={handleEmailChange}
        error={validationErrors.email}
      />

      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={handlePasswordChange}
        error={validationErrors.password}
      />

      <Button type="submit" isLoading={isPending} className="w-full mt-2">
        Sign in
      </Button>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
          Sign up
        </Link>
      </p>
    </form>
  )
}
