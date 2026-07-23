import { useEffect, useRef } from 'react'
import { RegisterForm } from './RegisterForm'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export function SignupModal({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    dialogRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      data-testid="signup-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1A1A]/60 p-6"
    >
      <div
        ref={dialogRef}
        data-testid="signup-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-[440px] flex-col gap-6 overflow-y-auto rounded-md bg-white p-8 shadow-lg outline-none"
      >
        <div className="flex items-center justify-between">
          <img src="/assets/logo-mobile.png" alt="MDB" className="h-7 w-auto object-contain" />
          <button
            type="button"
            data-testid="signup-modal-close-btn"
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
          <h2 id="signup-modal-title" className="font-display text-xl font-bold text-shipper-text">Create your FreightClub account</h2>
          <p className="text-sm text-shipper-text-muted">Set up your cost profile and start seeing per-load profitability.</p>
        </div>

        <RegisterForm onSwitchToLogin={onSwitchToLogin} />
      </div>
    </div>
  )
}
