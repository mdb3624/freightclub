import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useLazyFonts } from '@/hooks/useLazyFonts'
import { refreshAccessToken } from '@/lib/apiClient'

interface Props {
  children: ReactNode
}

export function AuthInitializer({ children }: Props) {
  const [ready, setReady] = useState(false)
  const hydrate = useAuthStore((s) => s.hydrate)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useLazyFonts(isAuthenticated)

  useEffect(() => {
    let cancelled = false

    async function init() {
      // Restore the (non-sensitive) persisted user profile immediately...
      hydrate()

      // ...then, only if a prior session exists, silently re-derive a real
      // access token from the HTTP-only refresh cookie — the token itself
      // is never persisted, so this is the only way a reload survives.
      if (useAuthStore.getState().user) {
        try {
          await refreshAccessToken()
        } catch {
          if (!cancelled) useAuthStore.getState().logout()
        }
      }

      if (!cancelled) setReady(true)
    }

    init()
    return () => {
      cancelled = true
    }
  }, [hydrate])

  if (!ready) return null

  return <>{children}</>
}
