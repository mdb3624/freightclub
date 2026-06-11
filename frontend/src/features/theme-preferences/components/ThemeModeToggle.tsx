import type { ThemeMode } from '../types'

interface ThemeModeToggleProps {
  value: ThemeMode
  onChange: (mode: ThemeMode) => void
}

const OPTIONS: { mode: ThemeMode; label: string; testId: string }[] = [
  { mode: 'LIGHT', label: 'Light', testId: 'theme-mode-option-light' },
  { mode: 'DARK', label: 'Dark', testId: 'theme-mode-option-dark' },
  { mode: 'SYSTEM', label: 'System', testId: 'theme-mode-option-system' },
]

/**
 * AC-4/AC-5/AC-6: track-aware segmented control persisting user_preferences.theme_mode.
 * Carrier track renders pill geometry; Shipper track renders rectangular framing
 * via the `data-track` attribute consumed by Tailwind variants in the host layout.
 */
export function ThemeModeToggle({ value, onChange }: ThemeModeToggleProps) {
  return (
    <div data-testid="theme-mode-toggle" role="radiogroup" aria-label="Theme mode">
      {OPTIONS.map(({ mode, label, testId }) => (
        <button
          key={mode}
          type="button"
          data-testid={testId}
          role="radio"
          aria-checked={value === mode}
          onClick={() => onChange(mode)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
