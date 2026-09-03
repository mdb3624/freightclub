import { create } from 'zustand'

// US-885: kept entirely separate from authStore's own accessToken — impersonation never
// overwrites the real Super User's session. apiClient's request interceptor prefers this
// token over the normal one whenever it's active; ending impersonation (or the token
// expiring) just clears this store, and the Super User's own session is exactly as it was.
interface ImpersonationTarget {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

interface ImpersonationState {
  token: string | null
  sessionId: string | null
  expiresAt: string | null
  target: ImpersonationTarget | null
  start: (params: { token: string; sessionId: string; expiresAt: string; target: ImpersonationTarget }) => void
  clear: () => void
}

export const useImpersonationStore = create<ImpersonationState>((set) => ({
  token: null,
  sessionId: null,
  expiresAt: null,
  target: null,

  start: ({ token, sessionId, expiresAt, target }) => set({ token, sessionId, expiresAt, target }),

  clear: () => set({ token: null, sessionId: null, expiresAt: null, target: null }),
}))

// BR-1: the token's own 15-minute expiry already ends real access server-side — this is only
// used client-side to stop attaching an obviously-dead token and to drive the banner countdown.
export function isImpersonationExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true
  return new Date(expiresAt).getTime() <= Date.now()
}
