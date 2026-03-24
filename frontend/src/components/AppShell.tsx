import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { Button } from '@/components/ui/Button'

interface AppShellProps {
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '5xl' | '6xl' | 'full'
}

export function AppShell({ children, maxWidth = '6xl' }: AppShellProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const { pathname } = useLocation()

  const dashboardPath = user?.role === 'TRUCKER' ? '/dashboard/trucker' : '/dashboard/shipper'
  const dashboardLabel = user?.role === 'TRUCKER' ? 'Load Board' : 'My Loads'

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full',
  }[maxWidth]

  function NavLink({ to, children: label }: { to: string; children: string }) {
    const active = pathname === to || pathname.startsWith(to + '/')
    return (
      <Link
        to={to}
        className={`text-sm font-medium transition-colors ${
          active
            ? 'text-primary-600 border-b-2 border-primary-600 pb-0.5'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-6 py-3">
        <div className={`mx-auto ${maxWidthClass} flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-6">
            <Link to={dashboardPath} className="text-lg font-bold text-gray-900 shrink-0">
              FreightClub
            </Link>
            <nav className="flex items-center gap-5">
              <NavLink to={dashboardPath}>{dashboardLabel}</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              {user?.role === 'TRUCKER' && (
                <NavLink to="/ratings">My Ratings</NavLink>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:inline">
              {user?.firstName} {user?.lastName}
            </span>
            <Button variant="secondary" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className={`mx-auto ${maxWidthClass} px-6 py-8`}>
        {children}
      </main>
    </div>
  )
}
