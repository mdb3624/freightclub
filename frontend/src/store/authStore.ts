import { create } from 'zustand'
import type { User } from '@/types'

interface AuthState {
  accessToken: string | null   // stored in memory only — never persisted
  user: User | null
  isAuthenticated: boolean
  setAuth: (accessToken: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: (accessToken, user) =>
    set({ accessToken, user, isAuthenticated: true }),

  logout: () =>
    set({ accessToken: null, user: null, isAuthenticated: false }),
}))
