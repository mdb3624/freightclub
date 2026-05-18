import React, { useState } from 'react'
import { LoginForm } from '../components/LoginForm'
import { authService } from '../services/authService'

export const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleLogin = async (data: { email: string; password: string }) => {
    setIsLoading(true)
    setError('')

    try {
      await authService.login(data)
      // On success, redirect to dashboard
      // The auth cookie is set by the server
      window.location.href = '/dashboard'
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <LoginForm
          onSubmit={handleLogin}
          error={error}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
