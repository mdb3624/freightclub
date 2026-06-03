import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface ProfileCompletionBannerProps {
  completeness: number
  onDismiss?: () => void
}

export function ProfileCompletionBanner({ completeness, onDismiss }: ProfileCompletionBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('profile-completion-banner-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  if (isDismissed) return null

  const isReady = completeness >= 80
  const bgColor = isReady ? 'bg-green-100 border-l-4 border-green-500' : 'bg-red-100 border-l-4 border-red-500'
  const textColor = isReady ? 'text-green-700' : 'text-red-700'
  const message = isReady
    ? '✓ Your profile is ready - publish loads now'
    : '⚠️ Complete your company profile before publishing loads'

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('profile-completion-banner-dismissed', 'true')
    onDismiss?.()
  }

  return (
    <div data-testid="profile-incomplete-banner" className={`${bgColor} ${textColor} p-4 mb-6 flex items-center justify-between`}>
      <div className="flex items-center gap-3">
        <span data-testid="profile-incomplete-message" className="text-sm font-medium">{message}</span>
        <span data-testid="completion-banner-percent" data-testid-alt="completion-percentage" className="text-xs font-semibold">{completeness}%</span>
      </div>
      <div className="flex items-center gap-3">
        <Link
          data-testid="complete-profile-btn"
          to="/profile"
          className="text-sm font-medium underline hover:no-underline"
        >
          Edit Profile
        </Link>
        <button
          onClick={handleDismiss}
          className="text-lg font-bold hover:opacity-70"
          aria-label="Dismiss banner"
        >
          ×
        </button>
      </div>
    </div>
  )
}
