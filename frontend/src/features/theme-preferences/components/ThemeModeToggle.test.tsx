/**
 * Feature: US-UI-MIGRATION (Theme State UI Component Migration)
 * AC-5: Theme Mode Switch
 * AC-6: Accessibility & Test Hooks — radiogroup semantics + data-testid
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeModeToggle } from './ThemeModeToggle'

describe('ThemeModeToggle — US-UI-MIGRATION', () => {
  it('renders a radiogroup with LIGHT/DARK/SYSTEM options exposing data-testid hooks', () => {
    render(<ThemeModeToggle value="SYSTEM" onChange={vi.fn()} />)

    const group = screen.getByTestId('theme-mode-toggle')
    expect(group).toHaveAttribute('role', 'radiogroup')

    expect(screen.getByTestId('theme-mode-option-light')).toHaveAttribute('role', 'radio')
    expect(screen.getByTestId('theme-mode-option-dark')).toHaveAttribute('role', 'radio')
    expect(screen.getByTestId('theme-mode-option-system')).toHaveAttribute('role', 'radio')
  })

  it('marks the active mode as aria-checked=true and others false', () => {
    render(<ThemeModeToggle value="DARK" onChange={vi.fn()} />)

    expect(screen.getByTestId('theme-mode-option-dark')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByTestId('theme-mode-option-light')).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByTestId('theme-mode-option-system')).toHaveAttribute('aria-checked', 'false')
  })

  it('invokes onChange with the selected mode when an option is clicked (AC-5)', () => {
    const onChange = vi.fn()
    render(<ThemeModeToggle value="LIGHT" onChange={onChange} />)

    fireEvent.click(screen.getByTestId('theme-mode-option-dark'))

    expect(onChange).toHaveBeenCalledWith('DARK')
  })
})
