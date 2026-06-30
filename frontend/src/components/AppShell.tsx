import { useState, useRef, useEffect } from 'react'
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
  const { persona, backgroundClassName, surfaceClassName, contentWidthClassName } = usePersonaTheme()
  const isCarrier = persona === 'carrier'
  const isShipper = !isCarrier

  const [profileOpen, setProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const dashboardPath = user?.role === 'TRUCKER' ? '/dashboard/trucker' : '/dashboard/shipper'

  const explicitMaxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full',
  }[maxWidth]

  const widthClass = isCarrier ? explicitMaxWidthClass : contentWidthClassName

  function NavLink({ to, children: label }: { to: string; children: string }) {
    const active = pathname === to
    return (
      <Link
        to={to}
        className={`text-sm font-medium transition-colors ${
          active
            ? 'text-primary-600 border-b-2 border-primary-600 pb-0.5'
            : 'text-carrier-text-muted hover:text-carrier-text'
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

      <header className={`sticky top-0 z-30 flex items-center px-6 ${isCarrier ? 'h-14 border-b border-carrier-border bg-carrier-bg' : 'h-16 border-b border-[#D8CEB8] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]'}`}>
        <div className={`mx-auto ${widthClass} flex w-full items-center justify-between gap-4`}>

          {/* Left: logo + carrier nav only */}
          <div className="flex items-center gap-6">
            <Link to={dashboardPath} className="shrink-0">
              <img src="/logo.png" alt="FreightClub" className="h-8 w-auto" />
            </Link>
            {isCarrier && (
              <nav role="navigation" className="flex items-center gap-5">
                <NavLink to="/dashboard/trucker">Load Board</NavLink>
                {user?.role === 'TRUCKER' && (
                  <NavLink to="/ratings">My Ratings</NavLink>
                )}
              </nav>
            )}
          </div>

          {/* Right: bell + avatar (shipper gets dropdown; carrier gets sign-out button) */}
          <div className="flex items-center gap-3">
            <NotificationBell />

            {isShipper && user ? (
              <div ref={dropdownRef} className="relative">
                <button
                  data-testid="profile-avatar-btn"
                  onClick={() => setProfileOpen((o) => !o)}
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                  aria-label={`Profile menu for ${user.firstName} ${user.lastName}`}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 border-shipper-accent bg-shipper-surface text-shipper-text shrink-0 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-shipper-accent"
                  style={{ boxShadow: '0 0 0 2px #B08D57, 0 2px 6px rgba(176,141,87,0.4)' }}
                >
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </button>

                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-44 rounded-md border border-shipper-accent bg-shipper-surface shadow-lg z-50 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-shipper-accent">
                      <p className="text-xs font-semibold text-shipper-text truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-shipper-text-muted truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-shipper-text hover:bg-shipper-bg transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      role="menuitem"
                      onClick={() => { setProfileOpen(false); logout() }}
                      data-testid="logout-btn"
                      className="block w-full text-left px-4 py-2 text-sm text-shipper-text hover:bg-shipper-bg transition-colors border-t border-shipper-accent"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {user && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-[#B08D57] text-[#121212] shrink-0 hidden sm:flex"
                    title={`${user.firstName} ${user.lastName}`}
                  >
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                )}
                <Button variant="secondary" onClick={logout} data-testid="logout-btn">
                  Sign out
                </Button>
              </>
            )}
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
