import { usePersonaTheme } from '@/contexts/PersonaThemeContext'

interface ErrorBannerProps {
  message: string
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  const { persona } = usePersonaTheme()
  const isCarrier = persona === 'carrier'

  return (
    <div
      role="alert"
      data-testid="login-error-message"
      className={
        isCarrier
          ? 'rounded-md border border-[#E74C3C] bg-[#2A1414] px-4 py-3 text-sm text-[#F5F5F5]'
          : 'rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
      }
    >
      {message}
    </div>
  )
}
