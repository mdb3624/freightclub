import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'
import { Button } from '@/components/ui/Button'
import { usePersonaTheme } from '@/contexts/PersonaThemeContext'

interface AppShellProps {
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '5xl' | '6xl' | 'full'
}

export function AppShell({ children, maxWidth = '6xl' }: AppShellProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const { pathname } = useLocation()
  const { persona, backgroundClassName, surfaceClassName, headingClassName, mutedClassName, contentWidthClassName } = usePersonaTheme()
  const isCarrier = persona === 'carrier'

  const dashboardPath = user?.role === 'TRUCKER' ? '/dashboard/trucker' : '/dashboard/shipper'
  const dashboardLabel = user?.role === 'TRUCKER' ? 'Load Board' : 'My Loads'

  const explicitMaxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full',
  }[maxWidth]

  // CHG-707: Carrier keeps the caller's mobile-first width constraint;
  // Shipper ignores it in favor of the persona's full-width dense layout
  // (desktop data-table density takes precedence over per-page maxWidth).
  const widthClass = isCarrier ? explicitMaxWidthClass : contentWidthClassName

  function NavLink({ to, children: label }: { to: string; children: string }) {
    const active = pathname === to || pathname.startsWith(to + '/')
    return (
      <Link
        to={to}
        className={`text-sm font-medium transition-colors ${
          active
            ? 'text-primary-600 border-b-2 border-primary-600 pb-0.5'
            : isCarrier
              ? 'text-carrier-text-muted hover:text-carrier-text'
              : 'text-shipper-text-muted hover:text-shipper-text'
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <div
      data-testid="app-shell"
      data-persona={persona}
      className={`min-h-screen ${backgroundClassName}`}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2">
        Skip to main content
      </a>
      <header className={`sticky top-0 z-30 px-6 py-3 ${isCarrier ? 'border-b border-carrier-border bg-carrier-bg' : 'border-b border-shipper-border bg-shipper-surface'}`}>
        <div className={`mx-auto ${widthClass} flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-6">
            <Link to={dashboardPath} className={`text-lg font-bold shrink-0 ${headingClassName}`}>
              FreightClub
            </Link>
            <nav role="navigation" className="flex items-center gap-5">
              <NavLink to={dashboardPath}>{dashboardLabel}</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              {user?.role === 'TRUCKER' && (
                <NavLink to="/ratings">My Ratings</NavLink>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <span className={`text-sm hidden sm:inline ${mutedClassName}`}>
              {user?.firstName} {user?.lastName}
            </span>
            <Button
              variant="secondary"
              onClick={logout}
              data-testid="logout-btn"
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className={`mx-auto ${widthClass} px-6 py-8`}>
        <div data-testid="app-shell-surface" className={`p-6 ${surfaceClassName}`}>
          {children}
        </div>
      </main>
    </div>
  )
}
