import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { ReactNode } from 'react'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  role?: UserRole
  // US-874/875/877: gates a route on the additive is_tenant_admin flag, independent of role —
  // a Shipper/Carrier Admin route (e.g. Team & Org Settings) needs both the persona role AND
  // this flag; a plain non-admin member of the same persona must not reach it.
  requireTenantAdmin?: boolean
  children: ReactNode
}

export function ProtectedRoute({ role, requireTenantAdmin, children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ openLogin: true }} replace />
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" state={{ openLogin: true }} replace />
  }

  if (requireTenantAdmin && !user?.isTenantAdmin) {
    return <Navigate to="/" state={{ openLogin: true }} replace />
  }

  return <>{children}</>
}
