import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * AC-1: Carrier Dashboard Header (56px fixed, mobile-first)
 * Spec: [🚛 FC] [HOS: 3h left 🟢] [🔔] [👤 JD]
 *
 * Layout (375px mobile):
 * - Logo (FC brand): 40px left with FreightClub logo
 * - HOS chip: center, auto-sized
 * - Bell + Avatar: 48px each, right side
 * - Avatar: Functional dropdown (Profile, Settings, Logout)
 */

export const CarrierHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
    setShowAvatarMenu(false);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <header
      data-testid="carrier-header"
      style={{
        width: '100%',
        height: 56,
        backgroundColor: '#1A1A1A',
        borderBottom: '1px solid #2A2F37',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 12,
        paddingRight: 12,
        gap: 8,
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      {/* Logo: FreightClub Branding */}
      <button
        data-testid="carrier-logo"
        onClick={() => navigate('/dashboard/carrier')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
          minWidth: 'fit-content',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0
        }}
        aria-label="FreightClub Home"
      >
        <img
          src="/logo.png"
          alt="FC"
          style={{
            height: 32,
            width: 32,
            objectFit: 'contain'
          }}
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#B08D57',
            letterSpacing: 1,
            textTransform: 'uppercase'
          }}
        >
          FC
        </span>
      </button>

      {/* HOS Chip (Hours of Service indicator, center) */}
      <div
        data-testid="hos-chip"
        style={{
          padding: '4px 10px',
          backgroundColor: '#27AE60',
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 600,
          color: '#FFFFFF',
          whiteSpace: 'nowrap',
          minWidth: 'fit-content'
        }}
      >
        HOS: 3h ✓
      </div>

      {/* Right Section: Bell + Avatar (48px each, mobile-friendly) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0
        }}
      >
        {/* Notification Bell */}
        <button
          data-testid="notification-bell"
          style={{
            width: 48,
            height: 48,
            backgroundColor: 'transparent',
            border: 'none',
            color: '#FFFFFF',
            fontSize: 18,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: 0
          }}
          aria-label="Notifications"
        >
          🔔
          <div
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 8,
              height: 8,
              backgroundColor: '#E74C3C',
              borderRadius: '50%'
            }}
          />
        </button>

        {/* Avatar with Dropdown Menu */}
        <div style={{ position: 'relative' }}>
          <button
            data-testid="carrier-avatar"
            onClick={() => setShowAvatarMenu(!showAvatarMenu)}
            style={{
              width: 48,
              height: 48,
              backgroundColor: '#B08D57',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: '#121212',
              cursor: 'pointer',
              border: 'none',
              padding: 0
            }}
            aria-label="Profile menu"
            aria-haspopup="true"
            aria-expanded={showAvatarMenu}
          >
            {getInitials(user?.firstName, user?.lastName)}
          </button>

          {/* Avatar Dropdown Menu */}
          {showAvatarMenu && (
            <div
              role="menu"
              data-testid="avatar-dropdown"
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: 8,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0E0E0',
                borderRadius: 4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                minWidth: '180px',
                zIndex: 1000
              }}
            >
              {/* User Info */}
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #E0E0E0'
                }}
              >
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#000' }}>
                  {user?.firstName} {user?.lastName}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#666' }}>
                  {user?.email}
                </p>
              </div>

              {/* Menu Items */}
              <button
                role="menuitem"
                onClick={handleProfile}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: 13,
                  color: '#000',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F5F5')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Profile
              </button>

              <div style={{ borderTop: '1px solid #E0E0E0' }}>
                <button
                  role="menuitem"
                  onClick={handleLogout}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: 13,
                    color: '#E74C3C',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F5F5')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
