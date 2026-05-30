import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import { useLazyFonts } from '@/hooks/useLazyFonts'
import type { RefreshResponse } from '@/types'
import type { UserRole } from '@/types'
import type { Profile } from '@/features/profile/types'

interface Props {
  children: ReactNode
}

export function AuthInitializer({ children }: Props) {
  const [ready, setReady] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useLazyFonts(isAuthenticated)

  useEffect(() => {
    axios.post<RefreshResponse>('/api/v1/auth/refresh', {}, { withCredentials: true })
      .then(async ({ data }) => {
        const profile = await axios.get<Profile>('/api/v1/profile', {
          headers: { Authorization: `Bearer ${data.accessToken}` },
          withCredentials: true,
        }).then((r) => r.data)

        setAuth(data.accessToken, {
          id: profile.id,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          role: profile.role as UserRole,
          tenantId: profile.tenantId ?? '',
          equipmentType: profile.equipmentType ?? undefined,
        })
      })
      .catch((error) => {
        if (typeof window !== 'undefined') {
          console.error('AuthInitializer: Refresh failed', {
            status: error.response?.status,
            message: error.message,
            url: error.config?.url,
          })
        }
        // No valid session — ProtectedRoute will redirect to login
      })
      .finally(() => {
        setReady(true)
      })
  }, [setAuth])

  if (!ready) return null

  return <>{children}</>
}
