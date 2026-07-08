import { create } from 'zustand'
import type { User } from '@/types'

const ACCESS_TOKEN_KEY = 'freightclub_access_token'
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

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: (accessToken, user) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ accessToken, user, isAuthenticated: true })
  },

  // Updates the access token only (e.g. after a silent refresh) — leaves
  // user/isAuthenticated untouched, unlike setAuth which is for full login.
  setAccessToken: (accessToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    set({ accessToken })
  },

  logout: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ accessToken: null, user: null, isAuthenticated: false })
  },

  hydrate: () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    const userStr = localStorage.getItem(USER_KEY)
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        set({ accessToken: token, user, isAuthenticated: true })
      } catch {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      }
    }
  },
}))
