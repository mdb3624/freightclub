import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'
import apiClient from '@/lib/apiClient'
import { useAuthStore } from '@/store/authStore'
import type { RefreshResponse } from '@/types'
import type { Profile } from '@/features/profile/types'

interface Props {
  children: ReactNode
}

export function AuthInitializer({ children }: Props) {
  const [ready, setReady] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    // Attempt silent session restore using HTTP-only refresh cookie.
    // Uses a raw axios call to avoid the apiClient interceptor (no access token yet).
    axios.post<RefreshResponse>('/api/v1/auth/refresh', {}, { withCredentials: true })
      .then(async ({ data }) => {
        // Fetch the user profile with the new access token
        const profile = await apiClient.get<Profile>('/profile', {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        }).then((r) => r.data)

        setAuth(data.accessToken, {
          id: profile.id,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          role: profile.role,
          tenantId: profile.tenantId ?? '',
          equipmentType: profile.equipmentType ?? undefined,
        })
      })
      .catch(() => {
        // No valid session — ProtectedRoute will redirect to login
      })
      .finally(() => {
        setReady(true)
      })
  }, [setAuth])

  if (!ready) return null

  return <>{children}</>
}
