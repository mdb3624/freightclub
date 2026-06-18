import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LogOut, User, Settings, Bell } from 'lucide-react'

/**
 * ShipperPageHeader: Mandatory header for all Shipper pages
 *
 * Displays:
 * - FreightClub logo + branding
 * - "Integrated Logistics" tagline
 * - Last updated timestamp
 * - Avatar + profile dropdown (profile/settings/logout)
 *
 * Required in all Shipper pages via ShipperPageLayout
 */

export function ShipperPageHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, isAuthenticated } = useAuthStore()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount] = useState(0)

  const isOnDashboard = location.pathname === '/dashboard/shipper'

  const now = new Date()
  const lastUpdated = now.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Close dropdowns when clicking outside
  useEffect(() => {
    if (!showDropdown && !showNotifications) return

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (
        !target.closest('[data-testid="avatar-dropdown"]') &&
        !target.closest('[data-testid="avatar-button"]') &&
        !target.closest('[data-testid="notifications-dropdown"]') &&
        !target.closest('[data-testid="notification-bell"]')
      ) {
        setShowDropdown(false)
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown, showNotifications])

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
    navigate('/login')
  }

  const handleProfileClick = () => {
    navigate('/profile')
    setShowDropdown(false)
  }

  const handleSettingsClick = () => {
    navigate('/settings')
    setShowDropdown(false)
  }

  const handleLogoClick = () => {
    navigate('/dashboard/shipper')
    setShowDropdown(false)
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || ''
    const last = lastName?.[0] || ''
    return (first + last).toUpperCase() || 'U'
  }

  return (
    <div
        className="panel-header"
        data-testid="shipper-page-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
      {/* Left: Logo + Branding */}
      <button
        onClick={handleLogoClick}
        disabled={isOnDashboard}
        data-testid="logo-button"
        aria-label={isOnDashboard ? 'Already on dashboard' : 'Back to dashboard'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          background: 'transparent',
          border: 'none',
          cursor: isOnDashboard ? 'default' : 'pointer',
          padding: '8px 12px',
          borderRadius: '4px',
          transition: 'background-color 0.2s',
          opacity: isOnDashboard ? 0.7 : 1,
        }}
        onMouseEnter={(e) => !isOnDashboard && (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <img src="/logo.png" alt="FreightClub" style={{ height: '40px' }} />
        <div style={{ textAlign: 'left' }}>
          <h1 className="panel-title" style={{ marginBottom: 0, fontSize: 'var(--font-size-lg)' }}>
            FreightClub
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              fontWeight: 'var(--font-weight-regular)',
            }}
          >
            Integrated Logistics
          </p>
        </div>
      </button>

      {/* Center: Last Updated */}
      <div
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-tertiary)',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: 0, marginBottom: 'var(--space-xs)' }}>Last updated</p>
        <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>{lastUpdated}</p>
      </div>

      {/* Right: Notification Bell + Avatar */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            data-testid="notification-bell"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            aria-haspopup="true"
            aria-expanded={showNotifications}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'transparent',
              color: 'var(--color-text-primary)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
            }}
            title="Notifications"
          >
            <Bell size={20} />
            {/* Unread badge - only show if there are unread messages */}
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'var(--color-critical)',
                  borderRadius: 'var(--radius-full)',
                }}
              />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              role="menu"
              data-testid="notifications-dropdown"
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: 'var(--space-sm)',
                backgroundColor: 'var(--color-surface-white)',
                border: 'var(--border-widget)',
                borderRadius: 'var(--radius-widget)',
                boxShadow: 'var(--shadow-elevated)',
                minWidth: '320px',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 1000,
              }}
            >
              {unreadCount === 0 ? (
                <div
                  style={{
                    padding: 'var(--space-lg)',
                    textAlign: 'center',
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  No new messages
                </div>
              ) : (
                <div
                  style={{
                    padding: 'var(--space-md)',
                  }}
                >
                  <p
                    style={{
                      margin: '0 0 var(--space-md) 0',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {unreadCount} new message{unreadCount !== 1 ? 's' : ''}
                  </p>
                  {/* Messages will be populated here */}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar Button */}
        <div style={{ position: 'relative' }}>
          <button
            data-testid="avatar-button"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-haspopup="true"
            aria-expanded={showDropdown}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-brand-bronze)',
              color: 'var(--color-surface-white)',
              border: 'none',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: 'pointer',
            }}
            title={isAuthenticated ? user?.email : 'Login'}
          >
            {isAuthenticated && user ? getInitials(user.firstName, user.lastName) : '?'}
          </button>

        {/* Dropdown Menu */}
        {showDropdown && isAuthenticated && (
          <div
            role="menu"
            data-testid="avatar-dropdown"
            style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: 'var(--space-sm)',
              backgroundColor: 'var(--color-surface-white)',
              border: 'var(--border-widget)',
              borderRadius: 'var(--radius-widget)',
              boxShadow: 'var(--shadow-elevated)',
              minWidth: '200px',
              zIndex: 1000,
            }}
          >
            {/* User Info */}
            <div
              style={{
                padding: 'var(--space-md)',
                borderBottom: 'var(--border-divider)',
              }}
            >
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                {user?.firstName} {user?.lastName}
              </p>
              <p
                style={{
                  margin: 0,
                  marginTop: 'var(--space-xs)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {user?.email}
              </p>
            </div>

            {/* Menu Items */}
            <button
              role="menuitem"
              onClick={handleProfileClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                width: '100%',
                padding: 'var(--space-sm) var(--space-md)',
                border: 'none',
                background: 'transparent',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-interactive-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <User size={16} />
              Profile
            </button>

            <button
              role="menuitem"
              onClick={handleSettingsClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                width: '100%',
                padding: 'var(--space-sm) var(--space-md)',
                border: 'none',
                background: 'transparent',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-interactive-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Settings size={16} />
              Settings
            </button>

            <div style={{ borderTop: 'var(--border-divider)' }}>
              <button
                role="menuitem"
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  width: '100%',
                  padding: 'var(--space-sm) var(--space-md)',
                  border: 'none',
                  background: 'transparent',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-critical)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-interactive-bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
