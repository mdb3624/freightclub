import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useLazyFonts } from '@/hooks/useLazyFonts'

interface Props {
  children: ReactNode
}

export function AuthInitializer({ children }: Props) {
  const [ready, setReady] = useState(false)
  const hydrate = useAuthStore((s) => s.hydrate)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useLazyFonts(isAuthenticated)

  useEffect(() => {
    // Hydrate auth state from localStorage on app mount
    hydrate()
    setReady(true)
  }, [hydrate])

  if (!ready) return null

  return <>{children}</>
}
