import { create } from 'zustand'
import type { User } from '@/types'

// The access token is deliberately kept in memory only (Zustand state) and
// never persisted — localStorage is readable by any injected/XSS'd script,
// and this token is the bearer credential for every API call. Only the
// non-sensitive user profile is persisted, purely so the UI can render a
// "logged in as ..." shell immediately on reload while AuthInitializer
// silently re-derives a real access token from the HTTP-only refresh cookie.
const USER_KEY = 'freightclub_user'

interface AuthState {
  accessToken: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (accessToken: string, user: User) => void
  setAccessToken: (accessToken: string) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: (accessToken, user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ accessToken, user, isAuthenticated: true })
  },

  // Updates the access token only (e.g. after a silent refresh). If a user
  // is already known (from a prior login or hydrate()), this also flips
  // isAuthenticated — covers the mount-time silent-refresh flow where
  // hydrate() restores `user` first and this call supplies the real token.
  setAccessToken: (accessToken) => {
    set({ accessToken, isAuthenticated: get().user != null })
  },

  logout: () => {
    localStorage.removeItem(USER_KEY)
    set({ accessToken: null, user: null, isAuthenticated: false })
  },

  // Restores only the persisted user profile — never a token. isAuthenticated
  // stays false until a real access token is obtained (see AuthInitializer's
  // silent-refresh-on-mount call).
  hydrate: () => {
    const userStr = localStorage.getItem(USER_KEY)
    if (!userStr) return
    try {
      const user = JSON.parse(userStr)
      set({ user })
    } catch {
      localStorage.removeItem(USER_KEY)
    }
  },
}))
