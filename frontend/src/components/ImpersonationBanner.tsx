import { useEffect, useState } from 'react'
import { useImpersonationStore, isImpersonationExpired } from '@/store/impersonationStore'
import * as adminApi from '@/features/admin/api'

// Ops Dark locked tokens (docs/standards/ADMIN_DESIGN_SYSTEM.md) — this banner can render on
// top of any persona's own theme (it's mounted in AppShell, shown while the Super User views
// another persona's dashboard), so it deliberately does not borrow that persona's palette; it
// always uses the platform's own admin/danger tokens to stay visually unmistakable as a
// cross-cutting Super User artifact, per ADMIN_HFD_RULES.md's "must never be confused with the
// tenant's own view" constraint.
const ADMIN_DANGER = '#F85149' // --admin-danger
const ADMIN_BG = '#0E1116' // --admin-bg — used as text-on-danger; verified 5.7:1 contrast (WCAG AA)

// US-885 BR-2: a persistent, unmissable banner on every screen while impersonating, naming the
// impersonated user, with a one-click end control. Rendered inside AppShell so it appears on
// whichever persona dashboard the Super User is now viewing as the target.
export function ImpersonationBanner() {
  const { token, sessionId, expiresAt, target, clear } = useImpersonationStore()
  const [ending, setEnding] = useState(false)
  const [, forceTick] = useState(0)

  // Re-render every second so the countdown stays live and the banner disappears on its own
  // the moment the token's client-side-known expiry passes (the server enforces the real cutoff).
  useEffect(() => {
    if (!token) return
    const interval = setInterval(() => forceTick((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [token])

  if (!token || !target || isImpersonationExpired(expiresAt)) {
    return null
  }

  const secondsLeft = Math.max(0, Math.floor((new Date(expiresAt!).getTime() - Date.now()) / 1000))
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  async function handleEnd() {
    setEnding(true)
    try {
      if (sessionId) {
        await adminApi.endImpersonation(sessionId)
      }
    } finally {
      clear()
      setEnding(false)
      window.location.href = '/'
    }
  }

  return (
    <div
      data-testid="impersonation-banner"
      role="alert"
      aria-live="assertive"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '10px 20px',
        background: ADMIN_DANGER,
        color: ADMIN_BG,
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      <span>
        Viewing as {target.firstName} {target.lastName} ({target.email}) — impersonation session, view-only.
        Ends in {minutes}:{seconds.toString().padStart(2, '0')}.
      </span>
      <button
        data-testid="end-impersonation-btn"
        onClick={handleEnd}
        disabled={ending}
        aria-label="End impersonation session"
        style={{
          padding: '6px 14px',
          borderRadius: 6,
          border: `1px solid ${ADMIN_BG}`,
          background: 'transparent',
          color: ADMIN_BG,
          fontWeight: 700,
          fontSize: 12,
          cursor: ending ? 'default' : 'pointer',
          opacity: ending ? 0.6 : 1,
        }}
      >
        {ending ? 'Ending…' : 'End impersonation'}
      </button>
    </div>
  )
}
