import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { ReactNode } from 'react'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  role?: UserRole
  children: ReactNode
}

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ openLogin: true }} replace />
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" state={{ openLogin: true }} replace />
  }

  return <>{children}</>
}
