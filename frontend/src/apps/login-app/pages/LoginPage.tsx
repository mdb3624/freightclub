// @ts-nocheck
import React, { useState } from 'react'
// @ts-nocheck
import { LoginForm } from '../components/LoginForm'
// @ts-nocheck
import { authService } from '../services/authService'
// @ts-nocheck
import { useAuthStore } from '@/store/authStore'
// @ts-nocheck

// @ts-nocheck
export const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const setAuth = useAuthStore((s) => s.setAuth)

  const handleLogin = async (data: { email: string; password: string }) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await authService.login(data)
      // Save auth token and user to store (like signup does)
      setAuth(response.accessToken, response.user)
      // On success, redirect to dashboard
      const destination = response.user.role === 'SHIPPER'
        ? '/dashboard/shipper'
        : '/dashboard/trucker'
      window.location.href = destination
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
