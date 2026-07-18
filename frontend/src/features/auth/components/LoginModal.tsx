import { LoginForm } from './LoginForm'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null

  return (
    <div
      data-testid="login-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1A1A]/60 p-6"
    >
      <div
        data-testid="login-modal"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-[400px] flex-col gap-6 rounded-md bg-white p-8 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <img src="/assets/logo-mobile.png" alt="MDB" className="h-7 w-auto object-contain" />
          <button
            type="button"
            data-testid="login-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-shipper-text-muted hover:text-shipper-text"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl font-bold text-shipper-text">Log in to FreightClub</h2>
          <p className="text-sm text-shipper-text-muted">Access your loads, cost profile, and earnings.</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
